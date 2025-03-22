"use server"

import type { Player, StartGGPlayer, StartGGStanding, TournamentEntrant } from "./types"
import { getServerApolloClient } from "./apollo-server"
import { gql } from "@apollo/client"
import { DateTime } from "luxon";

// GraphQL queries
const SEARCH_PLAYERS_QUERY = gql`
  query SearchPlayers {
    player {
      nodes {
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
      }
    }
  }
`

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
  standings.forEach(s => {
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

  Object.entries(regionsDict).forEach(x => {
    if(x[1] > currMax) {
      currMax = x[1];
      returnRegion = x[0]
    }
  })
  return returnRegion;
}

export async function searchPlayers(query: string): Promise<Player[]> {
  try {
    const client = getServerApolloClient()
    const { data } = await client.query({
      query: SEARCH_PLAYERS_QUERY,
      variables: { query },
    })

    const players = data.players.nodes.map((player: StartGGPlayer) => {
      // Get additional player details from our database or use defaults

      return {
        id: player.id,
        gamerTag: player.gamerTag,
        mainCharacter: "Unknown",
        secondaryCharacter: "Unknown",
        averagePlacement: player.recentStandings.reduce((prev, curr) => prev += curr.placement, 0) / player.recentStandings.length,
        region: getRegion(player.recentStandings),
        tournamentCount: player.recentStandings.length
      }
    })

    return players
  } catch (error) {
    console.error("Error searching players:", error)
    throw new Error("Failed to search players")
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
        const currPlayer = y.selections.find(z => z.entrant.participants[0].player.id == id)

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

    return {
      id: player.id,
      gamerTag: player.gamerTag,
      mainCharacter: main,
      secondaryCharacter: secondary,
      averagePlacement: player.recentStandings.reduce((prev: number, curr: StartGGStanding) => prev += curr.placement, 0) / player.recentStandings.length,
      numSetsPlayed: await getSetCountForPlayer(+player.id) ?? -1,
      region: getRegion(player.recentStandings)
    }
  } catch (error) {
    console.error("Error fetching player:", error)
    return null
  }
}

export async function fetchAllEntrants(): Promise<TournamentEntrant[]> {
  try {
    const client = getServerApolloClient()
    const allEntrants: TournamentEntrant[] = []

    // Process each state with pagination
    let page = 1
    let hasMorePages = true

    while (hasMorePages && page <= 3) {
      // Limit to 3 pages per state to avoid excessive requests
      const { data } = await client.query({
        query: GET_TOURNAMENTS_QUERY,
        variables: {
          page,
          after: Math.floor(DateTime.now().minus({years: 1}).toSeconds())
        },
      })

      const tournaments = data.tournaments.nodes

      // Process each tournament
      for (const tournament of tournaments) {
        for (const event of tournament.events) {
          for (const entrant of event.entrants.nodes) {
            for (const participant of entrant.participants) {
              // Add unique entrants only
              if (!allEntrants.some((e) => e.playerId === participant.player.id)) {
                allEntrants.push({
                  id: participant.id,
                  gamerTag: participant.gamerTag,
                  participantId: entrant.id,
                  playerId: participant.player.id
                })
              }
            }
          }
        }
      }

      // Check if there are more pages
      hasMorePages = page < data.tournaments.pageInfo.totalPages
      page++
    }

    return allEntrants
  } catch (error) {
    console.error("Error fetching all entrants:", error)
    return []
  }
}

