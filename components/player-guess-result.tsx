import type { Player } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, HelpCircle, XCircle } from "lucide-react"

interface PlayerGuessResultProps {
  guess: Player
  dailyPlayer: Player
}

export const compareCharacterValue = (guess: Player, daily: Player): { main: "exact" | "partial" | "incorrect", secondary: "exact" | "partial" | "incorrect"} => {
  return {
    main: guess.mainCharacter === daily.mainCharacter ? "exact" : guess.mainCharacter === daily.secondaryCharacter ? "partial" : "incorrect",
    secondary: guess.secondaryCharacter === daily.secondaryCharacter ? "exact" : guess.secondaryCharacter === daily.mainCharacter ? "partial" : "incorrect"
  }
}

export default function PlayerGuessResult({ guess, dailyPlayer }: PlayerGuessResultProps) {
  // Compare the guess with the daily player

  const compareChars = compareCharacterValue(guess, dailyPlayer);
  const compareResult = {
    mainCharacter: compareChars.main,
    secondaryCharacter: compareChars.secondary,
    averageLocalPlacement: comparePlacementValue(guess.averageLocalPlacement, dailyPlayer.averageLocalPlacement),
    averageMonthlyPlacement: comparePlacementValue(guess.averageMonthlyPlacement, dailyPlayer.averageMonthlyPlacement),
    averageRegionalPlacement: comparePlacementValue(guess.averageRegionalPlacement, dailyPlayer.averageRegionalPlacement),
    numSetsPlayed: compareNumericValue(guess.numSetsPlayed, dailyPlayer.numSetsPlayed),
    region: guess.region === dailyPlayer.region,
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
              isCorrect={compareResult.mainCharacter === "exact"}
              isPartial={compareResult.mainCharacter === "partial"}
            />

            <CategoryResult
              label="Secondary Character"
              value={guess.secondaryCharacter}
              isCorrect={compareResult.secondaryCharacter === "exact"}
              isPartial={compareResult.secondaryCharacter === "partial"}
            />

            <CategoryResult
              label="Average Local Placement (Last 20 Brackets)"
              value={formatPlacement(guess.averageLocalPlacement)}
              isCorrect={compareResult.averageLocalPlacement.exact}
              direction={compareResult.averageLocalPlacement.direction}
            />

            <CategoryResult
              label="Average Monthly Placement (Last 20 Brackets)"
              value={formatPlacement(guess.averageMonthlyPlacement)}
              isCorrect={compareResult.averageMonthlyPlacement.exact}
              direction={compareResult.averageMonthlyPlacement.direction}
            />

            <CategoryResult
              label="Average Regional Placement (Last 20 Brackets)"
              value={formatPlacement(guess.averageRegionalPlacement)}
              isCorrect={compareResult.averageRegionalPlacement.exact}
              direction={compareResult.averageRegionalPlacement.direction}
            />

            <CategoryResult
              label="Number of Sets Played (Lifetime)"
              value={`${guess.numSetsPlayed}`}
              isCorrect={compareResult.numSetsPlayed.exact}
              direction={compareResult.numSetsPlayed.direction}
            />

            <CategoryResult label="Region" value={guess.region} isCorrect={compareResult.region} />
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
  isPartial?: boolean
}

function CategoryResult({ label, value, isCorrect, direction, isPartial }: CategoryResultProps) {
  return (
    <div className={`p-2 rounded-md flex flex-col ${isCorrect ? "bg-green-100 dark:bg-green-900/20" : isPartial ? "bg-amber-100 dark:bg-amber-900/20" : "bg-muted"}`}>
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
          ) : isPartial ? (<HelpCircle className="h-4 w-4 text-amber-600" />) :(
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </span>
      </div>
    </div>
  )
}

function compareNumericValue(guessValue: number, actualValue: number): { exact: boolean, direction: "higher" | "lower" | null } {
  if (guessValue === actualValue) {
    return { exact: true, direction: null }
  } else if (guessValue < actualValue) {
    return { exact: false, direction: "higher" }
  } else {
    return { exact: false, direction: "lower" }
  }
}

function comparePlacementValue(guessValue: number, actualValue: number): { exact: boolean, direction: "higher" | "lower" | null } {
  const guessPlacement = formatPlacement(guessValue);
  const actualPlacement = formatPlacement(actualValue);
  if (guessPlacement === actualPlacement) {
    return { exact: true, direction: null }
  } else if (guessPlacement < actualPlacement) {
    return { exact: false, direction: "lower" }
  } else {
    return { exact: false, direction: "higher" }
  }
}

function formatPlacement(value: number): string {
  if(value == 0) return "N/A"
  if (value <= 2) return "1st-2nd"
  if (value <= 3) return "2nd-3rd"
  if (value <= 5) return "3rd-5th"
  if (value <= 9) return "5th-9th"
  if (value <= 13) return "9th-13th"
  if (value <= 17) return "13th-17th"
  if (value <= 25) return "17th-25th"
  if (value <= 33) return "25th-33rd"
  return "33rd+"
}

