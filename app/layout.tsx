import type React from "react"
import { Suspense } from "react"
import { ApolloClientProvider } from "@/lib/apollo-provider"
import "./globals.css"

export const metadata = {
  title: "Iowa Smashdle",
  description: "Guess the Iowa Smash player of the day",
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

