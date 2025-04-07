import { Suspense } from "react"
import { ApolloClientProvider } from "@/lib/apollo-provider"
import "./globals.css"
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

export const metadata = {
  title: "Iowa Smash Ultimate Wordle",
  description: "Guess the Iowa Smash Ultimate player of the day",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  loadErrorMessages()
  loadDevMessages()
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        <ApolloClientProvider>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            {children}
          </Suspense>
        </ApolloClientProvider>
      </body>
    </html>
  )
}

