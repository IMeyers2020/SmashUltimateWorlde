"use server"

import type { Player, StartGGPlayer, StartGGStanding, TournamentEntrant } from "./types"
import { getServerApolloClient } from "./apollo-server"
import { gql } from "@apollo/client"
import { DateTime } from "luxon";

const GET_PLAYER_BY_ID_QUERY = gql`
  query GetPlayer($id: ID!) {
    player(id: $id) {
      id
      gamerTag
      user {
        id
        slug
        name
        location {
          country
          state
        }
      }
      recentStandings(videogameId: 1386, limit: 20) {
        placement,
        metadata,
        container {
          ... on Event {
            numEntrants
            tournament {
              city
            }
          }
        }
      }
    }
  }
`

const GET_SETS_PLAYER = gql`
  query GetPlayerSets($id: ID!) {
    player(id: $id) {
      id
      gamerTag
			sets {
        pageInfo {
          total
        }
      }
    }
  }
`

const GET_TOURNAMENTS_QUERY = gql`
query TournamentsByState($page: Int!, $after: Timestamp!) {
  tournaments(query: {
    page: $page
    perPage: 25
    filter: {
      addrState: "IA",
      afterDate: $after
    }
  }) {
    pageInfo {
      total
      totalPages
    }
    nodes {
      id
      name
      addrState
      events(filter: {videogameId: 1386}) {
        id
        name
        entrants(query: { page: 1, perPage: 25 }) {
          pageInfo {
            total
            totalPages
          }
          nodes {
            id
            participants {
              id
              gamerTag
              player {
                id
                gamerTag
                sets {
                  pageInfo {
                    total
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`

const GET_SETS_WITH_CHARACTERS = gql`
  query GetPlayerCharacterSets($id: ID!) {
    player(id: $id) {
      id
      gamerTag
			sets {
        pageInfo {
          total
        },
        nodes {
          games {
            selections {
              character {
                name
              }
              entrant {
                id
                participants {
                  player {
                    id
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

export const getRegion = (standings: StartGGStanding[]) => {
  const regionsDict: Record<string, number> = {}
  standings?.forEach(s => {
    if(s.container.tournament.city) {
      if(regionsDict[s.container.tournament.city]) {
        regionsDict[s.container.tournament.city]++;
      } else {
        regionsDict[s.container.tournament.city] = 1;
      }
    }
  })

  let returnRegion: string = "Unknown"
  let currMax: number = 0;

  Object.entries(regionsDict)?.forEach(x => {
    if(x[1] > currMax) {
      currMax = x[1];
      returnRegion = x[0]
    }
  })
  return returnRegion;
}

export async function getPlacements(standings: StartGGStanding[]): Promise<{ local: number, monthly: number, regional: number }> {
  if(!standings) {
    return {
      local: 0,
      monthly: 0,
      regional: 0,
    }
  }

  const locals = standings.filter(x => x.container.numEntrants <= 40);
  const monthlies = standings.filter(x => x.container.numEntrants > 40 && x.container.numEntrants <= 100);
  const regionals = standings.filter(x => x.container.numEntrants > 100);

  const localPlacement = locals.length > 0 ? locals.reduce((prev, curr) => prev += curr.placement, 0) / locals.length : 0;
  const monthlyPlacement = monthlies.length > 0 ? monthlies.reduce((prev, curr) => prev += curr.placement, 0) / monthlies.length : 0;
  const regionalPlacement = regionals.length > 0 ? regionals.reduce((prev, curr) => prev += curr.placement, 0) / regionals.length : 0;

  return {
    local: localPlacement,
    monthly: monthlyPlacement,
    regional: regionalPlacement
  }
}

export async function getSetCountForPlayer(id: number): Promise<number | null> {
  try {
    const client = getServerApolloClient()
    const { data } = await client.query({
      query: GET_SETS_PLAYER,
      variables: { id },
    })
    return data?.player?.sets?.pageInfo?.total
  } catch (error) {
    console.error("Error fetching player:", error)
    return null
  }
}

export async function getMainSecondaryFromDict(dict: Record<string, number>): Promise<{main: string, secondary: string}> {
  let returnMain: string = "None"
  let returnSecondary: string = "None"
  let currMax: number = 0;

  Object.entries(dict).forEach(x => {
    if(x[1] > currMax) {
      currMax = x[1];
      returnSecondary = returnMain
      returnMain = x[0]
    }
  })
  return {
    main: returnMain,
    secondary: returnSecondary
  };
}

export async function getMainAndSecondaryForPlayer(id: number): Promise<{main: string, secondary: string} | null> {
  try {
    const client = getServerApolloClient()
    const { data } = await client.query({
      query: GET_SETS_WITH_CHARACTERS,
      variables: { id },
    })

    const characterDict: Record<string, number> = {}
    data.player.sets.nodes?.forEach(x => {
      x.games?.forEach(y => {
        const currPlayer = y.selections?.find(z => z.entrant.participants[0].player.id == id)

        if(characterDict[currPlayer.character.name]) {
          characterDict[currPlayer.character.name]++
        } else {
          characterDict[currPlayer.character.name] = 1;
        }
      })
    })

    const mainAndSecondary = await getMainSecondaryFromDict(characterDict)
    return {
      main: mainAndSecondary.main,
      secondary: mainAndSecondary.secondary
    }
  } catch (error) {
    console.error("Error fetching player:", error)
    return null
  }
}

export async function getPlayerById(id: number): Promise<Player | null> {
  try {
    const client = getServerApolloClient()
    const { data } = await client.query({
      query: GET_PLAYER_BY_ID_QUERY,
      variables: { id },
    })

    const player: StartGGPlayer = data.player

    if (!player) {
      return null
    }

    const { main, secondary } = await getMainAndSecondaryForPlayer(+player.id) ?? { main: "None", secondary: "None"};

    const placements = await getPlacements(player.recentStandings)

    return {
      id: player.id,
      gamerTag: player.gamerTag,
      mainCharacter: main,
      secondaryCharacter: secondary,
      averageLocalPlacement: placements.local,
      averageMonthlyPlacement: placements.monthly,
      averageRegionalPlacement: placements.regional,
      numSetsPlayed: await getSetCountForPlayer(+player.id) ?? -1,
      region: getRegion(player.recentStandings)
    }
  } catch (error) {
    console.error("Error fetching player:", error)
    return null
  }
}

const blacklistedIds: number[] = [
  216617,
  49302,
  1695284,
  351855,
  918277,
  1198128,
  353073
]

export async function fetchAllEntrants(): Promise<{playerId: number, gamerTag: string}[]> {
    const client = getServerApolloClient()
    const displayPlayers: {playerId: number, gamerTag: string}[] = [];
    let continueLoop: boolean = true
    let index = 1;

    while(continueLoop) {
      try {
        const { data } = await client.query({
          query: GET_TOURNAMENTS_QUERY,
          variables: { 
            page: index,
            after: Math.floor(DateTime.now().minus({months: 10}).toSeconds())
          },
          notifyOnNetworkStatusChange: true,
          errorPolicy: "all", // Return partial data even if there are errors
          context: {
            fetchOptions: {
              timeout: 10000, // 10 seconds timeout
            },
          },
        })
  
        if(data == undefined) {
          index++;
          continue;
        }
  
        if(data?.tournaments?.nodes.length < 25) continueLoop = false;
    
        data?.tournaments?.nodes?.forEach(node => {
          node.events?.forEach(event => {
            event.entrants?.nodes?.forEach(node2 => {
                node2.participants?.forEach(part => {
                  if(!displayPlayers.find(x => (x.playerId === part.player.id) || (x.gamerTag === part.player.gamerTag))) {
                    if(part.player.sets.pageInfo.total > 50) {
                      displayPlayers.push({
                        playerId: part.player.id,
                        gamerTag: part.player.gamerTag.replace("ū", "u").replace("ë", "e")
                      })
                    }
                  }
                })
              })
          })
        })
  
        index++;
      } catch (error) {
        const message: string = error instanceof Error ? error.message : error;
        console.error("Error fetching all entrants:", message)

        if(message.includes("status code 429")) {
          return displayPlayers ?? []
        } else {
          index++;
          continue;
        }
      }
    }
    console.log(displayPlayers.map(x => x.gamerTag))
    return displayPlayers
  }

