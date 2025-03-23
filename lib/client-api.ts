"use client"

import { gql, useQuery } from "@apollo/client"
import type { TournamentEntrant } from "./types"
import { DateTime } from "luxon"

// Simplified query that reduces complexity by limiting fields and nesting
export const GET_TOURNAMENTS_QUERY = gql`
  query TournamentsByState($page: Int!, $perPage: Int!, $after: Timestamp) {
    tournaments(query: {
      page: $page
      perPage: $perPage
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
      }
    }
  }
`

// Separate query to get events for a specific tournament
export const GET_TOURNAMENT_EVENTS_QUERY = gql`
  query TournamentEvents($tournamentId: ID!) {
    tournament(id: $tournamentId) {
      events(filter: {videogameId: 1386}) {
        id
        name
      }
    }
  }
`

// Separate query to get entrants for a specific event
export const GET_EVENT_ENTRANTS_QUERY = gql`
  query EventEntrants($eventId: ID!, $page: Int!, $perPage: Int!) {
    event(id: $eventId) {
      entrants(query: { page: $page, perPage: $perPage }) {
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
`

// Hook to fetch tournaments by state with pagination
export function useTournamentsByState(page = 1, perPage = 25, after = 1546300800) {
  return useQuery(GET_TOURNAMENTS_QUERY, {
    variables: { page, perPage, after },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only", // Don't use cache for this query
    errorPolicy: "all", // Return partial data even if there are errors
    onError: (error) => {
      console.error("Error fetching tournaments:", error)
    },
    // Add a timeout to prevent hanging queries
    context: {
      fetchOptions: {
        timeout: 10000, // 10 seconds timeout
      },
    },
  })
}

// Hook to fetch events for a tournament
export function useTournamentEvents(tournamentId: string) {
  return useQuery(GET_TOURNAMENT_EVENTS_QUERY, {
    variables: { tournamentId },
    notifyOnNetworkStatusChange: true,
    skip: !tournamentId,
    fetchPolicy: "network-only",
    errorPolicy: "all",
    onError: (error) => {
      console.error(`Error fetching events for tournament ${tournamentId}:`, error)
    },
    context: {
      fetchOptions: {
        timeout: 10000,
      },
    },
  })
}

// Hook to fetch entrants for an event
export function useEventEntrants(eventId: string, page = 1, perPage = 25) {
  return useQuery(GET_EVENT_ENTRANTS_QUERY, {
    variables: { eventId, page, perPage },
    notifyOnNetworkStatusChange: true,
    skip: !eventId,
    fetchPolicy: "network-only",
    errorPolicy: "all",
    onError: (error) => {
      console.error(`Error fetching entrants for event ${eventId}:`, error)
    },
    context: {
      fetchOptions: {
        timeout: 10000,
      },
    },
  })
}

// Function to extract entrants from event data
export function extractEntrantsFromEvent(data: any): TournamentEntrant[] {
  if (!data || !data.event || !data.event.entrants || !data.event.entrants.nodes) {
    return []
  }

  const entrants: TournamentEntrant[] = []

  for (const entrant of data.event.entrants.nodes) {
    if (!entrant.participants) continue

    for (const participant of entrant.participants) {
      if (!participant.player) continue

      // Add unique entrants only
      entrants.push({
        gamerTag: participant.gamerTag,
        playerId: participant.player.id,
      })
    }
  }

  return entrants
}

// Helper function to create a timestamp for a specific date
export function getTimestampForDate(date: Date): string {
  return Math.floor(date.getTime() / 1000).toString()
}

// Helper function to get timestamps for different time periods
export function getTimeframes() {
  const now = DateTime.now()

  // Last 3 months
  const threeMonthsAgo = Math.floor(now.minus({months: 3}).toSeconds())

  // Last 6 months
  const sixMonthsAgo = Math.floor(now.minus({months: 6}).toSeconds())

  // Last year
  const oneYearAgo = Math.floor(now.minus({years: 1}).toSeconds())

  // Last 2 years
  const twoYearsAgo = Math.floor(now.minus({years: 2}).toSeconds())

  return {
    threeMonths: threeMonthsAgo,
    sixMonths: sixMonthsAgo,
    oneYear: oneYearAgo,
    twoYears: twoYearsAgo,
  }
}

