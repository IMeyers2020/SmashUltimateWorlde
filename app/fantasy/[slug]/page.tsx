// import { getTournamentDetails } from "@/lib/startgg"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { BracketForm } from "./bracket-form"
import { BracketView } from "./bracket-view"
import { getTournamentFantasyBracket } from "@/lib/dynamodb"

export const revalidate = 60 // Revalidate every minute

export default async function TournamentPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)

  // Redirect to sign in if not authenticated
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=" + encodeURIComponent(`/fantasy/${params.slug}`))
  }

  const tournament = {} as any //await getTournamentDetails(params.slug)

  // Get the main event (one with most entrants)
  const mainEvent = tournament.events.reduce(
    (max, event) => (event.numEntrants > max.numEntrants ? event : max),
    tournament.events[0],
  )

  // Check if user already has a bracket for this tournament
  const existingBracket = await getTournamentFantasyBracket(session.user.id, tournament.id)

  const tournamentStartTime = new Date(mainEvent.startAt * 1000)
  const isTournamentStarted = tournamentStartTime < new Date()
  const isTournamentCompleted = mainEvent.state === "COMPLETED"

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">{tournament.name}</h1>
      <p className="text-xl mb-8">Fantasy Bracket</p>

      {isTournamentCompleted ? (
        // Show completed bracket with results
        <BracketView tournament={tournament} mainEvent={mainEvent} bracket={existingBracket} status="completed" />
      ) : isTournamentStarted ? (
        // Show active bracket (view only)
        <BracketView tournament={tournament} mainEvent={mainEvent} bracket={existingBracket} status="active" />
      ) : (
        // Show form to create/edit bracket
        <BracketForm
          tournament={tournament}
          mainEvent={mainEvent}
          existingBracket={existingBracket}
          userId={session.user.id}
        />
      )}
    </div>
  )
}

