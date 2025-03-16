import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"

// This is for server components only
export function getServerApolloClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: "https://api.start.gg/gql/alpha",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.START_GG_API_KEY}`,
      },
      fetch,
    }),
    defaultOptions: {
      query: {
        fetchPolicy: "network-only",
      },
    },
  })
}

