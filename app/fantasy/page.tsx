import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Users } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { DateTime } from "luxon"
import { getSession } from "next-auth/react"

export const revalidate = 3600 // Revalidate every hour

export default async function FantasyPage() {
  const session = await getServerSession(authOptions)
  const otherSession = await getSession()

  console.log("SESSION: ", session, otherSession)

  // Redirect to sign in if not authenticated
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/fantasy")
  }

  const tournaments = [] as any[]// await getUpcomingTournaments()

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Esports Fantasy</h1>
      <p className="text-xl mb-8">
        Create fantasy brackets for upcoming tournaments in Iowa with more than 30 entrants. Predict the top 8, choose
        X-Factor players for upsets, and select a Dark Horse to earn points!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament) => {
          const startDate = DateTime.fromMillis(tournament.startAt * 1000)
          const defaultImage = "https://start.gg/images/gg-app-icon.png"
          const tournamentImage = tournament.images?.[0]?.url || defaultImage

          // Find the event with the most entrants
          const mainEvent = tournament.events.reduce(
            (max, event) => (event.numEntrants > max.numEntrants ? event : max),
            tournament.events[0],
          )

          return (
            <Link href={`/fantasy/${tournament.slug}`} key={tournament.id}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="relative w-full h-40 mb-2">
                    <Image
                      src={tournamentImage || "/placeholder.svg"}
                      alt={tournament.name}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <CardTitle className="line-clamp-2">{tournament.name}</CardTitle>
                  <CardDescription>Starts {startDate.toLocaleString(DateTime.DATETIME_MED)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">Main Event: {mainEvent.name}</p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">{mainEvent.numEntrants} Entrants</span>
                  </div>
                  <span className="text-sm font-medium">Create Bracket</span>
                </CardFooter>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
