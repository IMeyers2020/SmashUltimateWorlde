import { gql } from "@apollo/client"

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

export const GET_SETS_BY_PLAYER = gql`
query Sets {
  player(id: 1000) {
    id
    sets(perPage: 5, page: 10) {
      nodes {
        id
        displayScore
        event {
          id
          name
          tournament {
            id
            name
          }
        }
      }
    }
  }
}
`

export const GET_PLAYER_BY_ID_QUERY = gql`
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

