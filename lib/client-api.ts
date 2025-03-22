"use client"

import { gql, useQuery } from "@apollo/client"
import type { TournamentEntrant } from "./types"

// Client-side GraphQL queries
export const SEARCH_PLAYERS_QUERY = gql`
  query SearchPlayers($query: String!) {
    players(query: $query, first: 10) {
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

export const GET_TOURNAMENTS_QUERY = gql`
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

// Hook to fetch tournaments by state
export function useTournamentsByState(state: string, page = 1, perPage = 25) {
  return useQuery(GET_TOURNAMENTS_QUERY, {
    variables: { state, page, perPage },
    notifyOnNetworkStatusChange: true,
  })
}

// Function to extract entrants from tournament data
export function extractEntrantsFromTournaments(data: any): TournamentEntrant[] {
  if (!data || !data.tournaments || !data.tournaments.nodes) {
    return []
  }

  const entrants: TournamentEntrant[] = []

  for (const tournament of data.tournaments.nodes) {
    if (!tournament.events) continue

    for (const event of tournament.events) {
      if (!event.entrants || !event.entrants.nodes) continue

      for (const entrant of event.entrants.nodes) {
        if (!entrant.participants) continue

        for (const participant of entrant.participants) {
          // Add unique entrants only
          if (!entrants.some((e) => e.id === participant.id)) {
            entrants.push({
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

  return entrants
}

