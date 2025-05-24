import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { getUserFantasyBrackets } from "@/lib/dynamodb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { DateTime, Duration } from "luxon"

export const revalidate = 60 // Revalidate every minute

export default async function MyBracketsPage() {
  const session = await getServerSession(authOptions)

  // Redirect to sign in if not authenticated
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/fantasy/my-brackets")
  }

  // Get user's brackets
  const brackets = await getUserFantasyBrackets(session.user.id)

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">My Brackets</h1>
      <p className="text-xl mb-8">View and manage your fantasy brackets for all tournaments.</p>

      {brackets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brackets.map((bracket) => {
            const startDate = DateTime.fromISO(bracket.startTime)
            const now = DateTime.now()
            const isStarted = startDate < now

            return (
              <Link href={`/fantasy/${bracket.tournamentSlug}`} key={bracket.id}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{bracket.tournamentName}</CardTitle>
                    <CardDescription>
                      {isStarted
                        ? `Started ${now.diff(startDate).toHuman()}`
                        : `Starts ${now.diff(startDate).toHuman()}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <span
                          className={`text-sm font-medium ${
                            bracket.status === "completed"
                              ? "text-green-600"
                              : bracket.status === "active"
                                ? "text-blue-600"
                                : "text-yellow-600"
                          }`}
                        >
                          {bracket.status === "completed"
                            ? "Completed"
                            : bracket.status === "active"
                              ? "In Progress"
                              : "Pending"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Created:</span>
                        <span className="text-sm">{DateTime.fromISO(bracket.createdAt).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS)}</span>
                      </div>
                      {bracket.status === "completed" && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Points:</span>
                          <span className="text-sm font-bold">{bracket.points}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">You haven't created any fantasy brackets yet.</p>
            <Link href="/fantasy" className="text-primary hover:underline">
              Browse tournaments and create your first bracket
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

