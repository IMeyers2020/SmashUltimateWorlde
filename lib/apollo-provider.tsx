"use client"

import { ApolloClient, ApolloProvider, InMemoryCache, HttpLink } from "@apollo/client"
import { type ReactNode, useMemo } from "react"

export function ApolloClientProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    return new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({
        uri: "https://api.start.gg/gql/alpha",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_START_GG_API_KEY}`,
        },
      }),
      defaultOptions: {
        query: {
          fetchPolicy: "network-only",
        },
      },
    })
  }, [])

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

