"use client"

import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"
import { registerApolloClient } from "@apollo/experimental-nextjs-app-support/rsc"

export const { getClient } = registerApolloClient(() => {
  const httpLink = new HttpLink({
    uri: "https://api.start.gg/gql/alpha",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.START_GG_API_KEY}`,
    },
  })

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink,
    defaultOptions: {
      query: {
        fetchPolicy: "network-only",
      },
    },
  })
})

