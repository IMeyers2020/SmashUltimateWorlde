import { Suspense } from "react"
import { ApolloClientProvider } from "@/lib/apollo-provider"
import "./globals.css"
import SessionProvider from "@/components/session-provider"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth/next"
import { GlobalNav } from "@/components/global-nav"

export const metadata = {
  title: "Iowa Smash Ultimate Wordle",
  description: "Guess the Iowa Smash Ultimate player of the day",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        <SessionProvider session={session}>
          <ApolloClientProvider>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <GlobalNav />
              {children}
            </Suspense>
          </ApolloClientProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

