import type React from "react"
import { Suspense } from "react"
import { ApolloClientProvider } from "@/lib/apollo-provider"
import "./globals.css"

export const metadata = {
  title: "Esports Wordle",
  description: "Guess the esports player of the day",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ApolloClientProvider>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </ApolloClientProvider>
      </body>
    </html>
  )
}

