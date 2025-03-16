"use server"

import type { Player, StartGGPlayer, TournamentEntrant } from "./types"
import { getServerApolloClient } from "./apollo-server"
import { gql } from "@apollo/client"

// GraphQL queries
const SEARCH_PLAYERS_QUERY = gql`
  query SearchPlayers($query: String!) {
    player(query: $query, first: 10) {
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
    }
  }
`

const GET_TOURNAMENTS_QUERY = gql`
  query TournamentsByState($page: Int!) {
    tournaments(query: {
      page: $page
      perPage: 10
      filter: {
        addrState: "IA"
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
              }
            }
          }
        }
      }
    }
  }
`

// Sample player data to augment the StartGG API data
const playerDetails: Record<string, Partial<Player>> = {
  // These would be populated with real data from your research
  // This is just sample data for demonstration
  "1": {
    mainCharacter: "Fox",
    secondaryCharacter: "Falco",
    averageLocalPlacement: 1.2,
    averageRegionalThreat: 9.5,
    timeCompeting: 10,
    region: "East Coast",
    tournamentCount: 45,
  },
  "2": {
    mainCharacter: "Marth",
    secondaryCharacter: "Roy",
    averageLocalPlacement: 2.5,
    averageRegionalThreat: 7.8,
    timeCompeting: 8,
    region: "West Coast",
    tournamentCount: 32,
  },
  "3": {
    mainCharacter: "Jigglypuff",
    secondaryCharacter: "Peach",
    averageLocalPlacement: 1.5,
    averageRegionalThreat: 9.2,
    timeCompeting: 12,
    region: "Europe",
    tournamentCount: 67,
  },
  // Add more player details as needed
}

// Default values for missing player details
const defaultPlayerDetails: Omit<Player, "id" | "gamerTag"> = {
  mainCharacter: "Unknown",
  secondaryCharacter: "None",
  averageLocalPlacement: 5,
  averageRegionalThreat: 5,
  timeCompeting: 3,
  region: "Unknown",
  tournamentCount: 10,
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
      const details = playerDetails[player.id] || defaultPlayerDetails

      // Determine region based on location data if available
      let region = details.region || defaultPlayerDetails.region
      if (player.user?.location) {
        const { country, state } = player.user.location
        if (country === "US") {
          if (["CA", "WA", "OR", "NV", "AZ"].includes(state || "")) {
            region = "West Coast"
          } else if (["NY", "NJ", "MA", "PA", "MD", "VA"].includes(state || "")) {
            region = "East Coast"
          } else if (["TX", "OK", "LA"].includes(state || "")) {
            region = "South"
          } else if (["IL", "MI", "OH", "IN"].includes(state || "")) {
            region = "Midwest"
          }
        } else if (["JP"].includes(country)) {
          region = "Japan"
        } else if (["SE", "UK", "DE", "FR", "ES", "IT"].includes(country)) {
          region = "Europe"
        }
      }

      return {
        id: player.id,
        gamerTag: player.gamerTag,
        ...defaultPlayerDetails,
        ...details,
        region,
      }
    })

    return players
  } catch (error) {
    console.error("Error searching players:", error)
    throw new Error("Failed to search players")
  }
}

export async function getPlayerById(id: string): Promise<Player | null> {
  try {
    const client = getServerApolloClient()
    const { data } = await client.query({
      query: GET_PLAYER_BY_ID_QUERY,
      variables: { id },
    })

    const player = data.player

    if (!player) {
      return null
    }

    // Get additional player details from our database or use defaults
    const details = playerDetails[player.id] || defaultPlayerDetails

    // Determine region based on location data if available
    let region = details.region || defaultPlayerDetails.region
    if (player.user?.location) {
      const { country, state } = player.user.location
      if (country === "US") {
        if (["CA", "WA", "OR", "NV", "AZ"].includes(state || "")) {
          region = "West Coast"
        } else if (["NY", "NJ", "MA", "PA", "MD", "VA"].includes(state || "")) {
          region = "East Coast"
        } else if (["TX", "OK", "LA"].includes(state || "")) {
          region = "South"
        } else if (["IL", "MI", "OH", "IN"].includes(state || "")) {
          region = "Midwest"
        }
      } else if (["JP"].includes(country)) {
        region = "Japan"
      } else if (["SE", "UK", "DE", "FR", "ES", "IT"].includes(country)) {
        region = "Europe"
      }
    }

    return {
      id: player.id,
      gamerTag: player.gamerTag,
      ...defaultPlayerDetails,
      ...details,
      region,
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
          page
        },
      })

      const tournaments = data.tournaments.nodes

      // Process each tournament
      for (const tournament of tournaments) {
        for (const event of tournament.events) {
          for (const entrant of event.entrants.nodes) {
            for (const participant of entrant.participants) {
              // Add unique entrants only
              if (!allEntrants.some((e) => e.id === participant.id)) {
                allEntrants.push({
                  id: participant.id,
                  gamerTag: participant.gamerTag,
                  participantId: entrant.id,
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

    console.log(allEntrants)
    return allEntrants
  } catch (error) {
    console.error("Error fetching all entrants:", error)
    return []
  }
}

