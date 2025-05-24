import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function FantasyLayout({ children }) {
  const session = await getServerSession(authOptions)

  // Redirect unauthenticated users to sign in
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/fantasy")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/fantasy" className="text-sm font-medium hover:underline">
            Tournaments
          </Link>
          <Link href="/fantasy/leaderboard" className="text-sm font-medium hover:underline">
            Leaderboard
          </Link>
          <Link href="/fantasy/my-brackets" className="text-sm font-medium hover:underline">
            My Brackets
          </Link>
        </div>
      </div>
      <main className="flex-1">{children}</main>
    </div>
  )
}
