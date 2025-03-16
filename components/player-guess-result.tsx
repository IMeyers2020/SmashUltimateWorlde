import type { Player } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"

interface PlayerGuessResultProps {
  guess: Player
  dailyPlayer: Player
}

export default function PlayerGuessResult({ guess, dailyPlayer }: PlayerGuessResultProps) {
  // Compare the guess with the daily player
  const compareResult = {
    mainCharacter: guess.mainCharacter === dailyPlayer.mainCharacter,
    secondaryCharacter: guess.secondaryCharacter === dailyPlayer.secondaryCharacter,
    averageLocalPlacement: compareNumericValue(guess.averageLocalPlacement, dailyPlayer.averageLocalPlacement),
    averageRegionalThreat: compareNumericValue(guess.averageRegionalThreat, dailyPlayer.averageRegionalThreat),
    timeCompeting: compareNumericValue(guess.timeCompeting, dailyPlayer.timeCompeting),
    region: guess.region === dailyPlayer.region,
    tournamentCount: compareNumericValue(guess.tournamentCount, dailyPlayer.tournamentCount), // New comparison
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">{guess.gamerTag}</h3>
            <div className="flex gap-1">
              {guess.id === dailyPlayer.id ? (
                <Badge variant="default" className="bg-green-600">
                  Correct!
                </Badge>
              ) : (
                <Badge variant="outline">Incorrect</Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
            <CategoryResult
              label="Main Character"
              value={guess.mainCharacter}
              isCorrect={compareResult.mainCharacter}
            />

            <CategoryResult
              label="Secondary Character"
              value={guess.secondaryCharacter}
              isCorrect={compareResult.secondaryCharacter}
            />

            <CategoryResult
              label="Local Placement"
              value={formatPlacement(guess.averageLocalPlacement)}
              isCorrect={compareResult.averageLocalPlacement.exact}
              direction={compareResult.averageLocalPlacement.direction}
            />

            <CategoryResult
              label="Regional Threat"
              value={formatThreat(guess.averageRegionalThreat)}
              isCorrect={compareResult.averageRegionalThreat.exact}
              direction={compareResult.averageRegionalThreat.direction}
            />

            <CategoryResult
              label="Time Competing"
              value={`${guess.timeCompeting} years`}
              isCorrect={compareResult.timeCompeting.exact}
              direction={compareResult.timeCompeting.direction}
            />

            <CategoryResult label="Region" value={guess.region} isCorrect={compareResult.region} />

            <CategoryResult
              label="Tournaments"
              value={guess.tournamentCount.toString()}
              isCorrect={compareResult.tournamentCount.exact}
              direction={compareResult.tournamentCount.direction}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface CategoryResultProps {
  label: string
  value: string
  isCorrect: boolean
  direction?: "higher" | "lower" | null
}

function CategoryResult({ label, value, isCorrect, direction }: CategoryResultProps) {
  return (
    <div className={`p-2 rounded-md flex flex-col ${isCorrect ? "bg-green-100 dark:bg-green-900/20" : "bg-muted"}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex items-center justify-between">
        <span className="font-medium">{value}</span>
        <span>
          {isCorrect ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : direction === "higher" ? (
            <span className="text-xs text-amber-600">↑ Higher</span>
          ) : direction === "lower" ? (
            <span className="text-xs text-amber-600">↓ Lower</span>
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </span>
      </div>
    </div>
  )
}

function compareNumericValue(guessValue: number, actualValue: number) {
  if (guessValue === actualValue) {
    return { exact: true, direction: null }
  } else if (guessValue < actualValue) {
    return { exact: false, direction: "higher" }
  } else {
    return { exact: false, direction: "lower" }
  }
}

function formatPlacement(value: number): string {
  if (value <= 1.5) return "1st-2nd"
  if (value <= 3) return "2nd-3rd"
  if (value <= 5) return "3rd-5th"
  if (value <= 9) return "5th-9th"
  if (value <= 13) return "9th-13th"
  return "13th+"
}

function formatThreat(value: number): string {
  if (value >= 9) return "Very High"
  if (value >= 7) return "High"
  if (value >= 5) return "Medium"
  if (value >= 3) return "Low"
  return "Very Low"
}

