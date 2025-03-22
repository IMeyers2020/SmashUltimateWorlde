import { Suspense } from "react"
import EsportsWordle from "@/components/esports-wordle"
import { getDailyPlayer } from "@/lib/player-selection"

export default async function Home() {
  // Get the player of the day on the server
  const dailyPlayer = await getDailyPlayer()
  console.log(dailyPlayer)

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <h1 className="text-4xl font-bold mb-8 text-center">Iowa Smashdle</h1>
      <Suspense fallback={<div>Loading game...</div>}>
        <EsportsWordle dailyPlayer={dailyPlayer} />
      </Suspense>
    </main>
  )
}

