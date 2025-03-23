import { Suspense } from "react"
import EsportsWordle from "@/components/esports-wordle"
import { getDailyPlayer } from "@/lib/player-selection"

export default async function WordlePage() {
  // Get the player of the day on the server
  const dailyPlayer = await getDailyPlayer()

  if(!dailyPlayer) return;

  return (
    <div className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <h1 className="text-4xl md:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 mb-4">Iowa Smashdle</h1>
      <Suspense fallback={<div>Loading game...</div>}>
        <EsportsWordle dailyPlayer={dailyPlayer} />
      </Suspense>
    </div>
  )
}

