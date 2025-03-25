import type { Player } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, HelpCircle, XCircle } from "lucide-react"
import { CharacterList } from "@/lib/characters"

interface PlayerGuessResultProps {
  guess: Player
  dailyPlayer: Player
}

interface PlayerGuessCharacterComparison {
  exact: boolean;
  matchesOther: boolean;
  matchesGame: boolean;
  direction: "higher" | "lower" | null
}

type GameValue = "64" | "melee" | "brawl" | "wii u" | "ultimate"

const getGameValue = (val: GameValue): number | null => {
  switch(val) {
    case "64":
      return 0;
    case "melee":
      return 1;
    case "brawl":
      return 2;
    case "wii u":
      return 3;
    case "ultimate":
      return 4;
    default:
      return null;
  }
}

export const compareCharacterValue = (guess: Player, daily: Player): { main: PlayerGuessCharacterComparison, secondary: PlayerGuessCharacterComparison} => {
  const guessMainCharacterListItem = CharacterList.find(x => x.name.toLowerCase() === guess.mainCharacter.toLowerCase());
  const guessSecondaryCharacterListItem = CharacterList.find(x => x.name.toLowerCase() === guess.secondaryCharacter.toLowerCase());
  const dailyMainCharacterListItem = CharacterList.find(x => x.name.toLowerCase() === daily.mainCharacter.toLowerCase());
  const dailySecondaryCharacterListItem = CharacterList.find(x => x.name.toLowerCase() === daily.secondaryCharacter.toLowerCase());
  const mainExact = guess.mainCharacter === daily.mainCharacter;
  const mainMatchesOther = guess.mainCharacter === daily.secondaryCharacter;
  const mainMatchesGame = guessMainCharacterListItem?.["first-game"] === dailyMainCharacterListItem?.["first-game"]
  const mainDirection = (mainMatchesGame ||
    getGameValue(guessMainCharacterListItem?.["first-game"] as GameValue) == null ||
    getGameValue(dailyMainCharacterListItem?.["first-game"] as GameValue) == null
  ) ? null :
    getGameValue(guessMainCharacterListItem?.["first-game"] as GameValue)! > getGameValue(dailyMainCharacterListItem?.["first-game"] as GameValue)! ? "lower" : "higher"
    const secondaryExact = guess.secondaryCharacter === daily.secondaryCharacter;
    const secondaryMatchesOther = guess.secondaryCharacter === daily.mainCharacter;
    const secondaryMatchesGame = guessSecondaryCharacterListItem?.["first-game"] === dailySecondaryCharacterListItem?.["first-game"]
    const secondaryDirection = (secondaryMatchesGame ||
      getGameValue(guessSecondaryCharacterListItem?.["first-game"] as GameValue) == null ||
      getGameValue(dailySecondaryCharacterListItem?.["first-game"] as GameValue) == null
    ) ? null :
      getGameValue(guessSecondaryCharacterListItem?.["first-game"] as GameValue)! > getGameValue(dailySecondaryCharacterListItem?.["first-game"] as GameValue)! ? "lower" : "higher"

  const mainComparison: PlayerGuessCharacterComparison = {
    exact: mainExact,
    matchesOther: mainMatchesOther,
    matchesGame: mainMatchesGame,
    direction: mainDirection
  }

  const secondaryComparison: PlayerGuessCharacterComparison = {
    exact: secondaryExact,
    matchesOther: secondaryMatchesOther,
    matchesGame: secondaryMatchesGame,
    direction: secondaryDirection
  }

  return {
    main: mainComparison,
    secondary: secondaryComparison
  }
}

export const getResults = (guess: Player, daily: Player) => {
  const compareChars = compareCharacterValue(guess, daily);
  const compareResult = {
    mainCharacter: compareChars.main,
    secondaryCharacter: compareChars.secondary,
    averageLocalPlacement: comparePlacementValue(guess.averageLocalPlacement, daily.averageLocalPlacement),
    averageMonthlyPlacement: comparePlacementValue(guess.averageMonthlyPlacement, daily.averageMonthlyPlacement),
    averageRegionalPlacement: comparePlacementValue(guess.averageRegionalPlacement, daily.averageRegionalPlacement),
    numSetsPlayed: compareNumericValue(guess.numSetsPlayed, daily.numSetsPlayed),
    region: guess.region === daily.region,
  }

  return compareResult;
}

export default function PlayerGuessResult({ guess, dailyPlayer }: PlayerGuessResultProps) {
  // Compare the guess with the daily player

  const compareResult = getResults(guess, dailyPlayer)

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
              isCorrect={compareResult.mainCharacter.exact}
              isPartial={compareResult.mainCharacter.matchesGame || compareResult.mainCharacter.matchesOther}
              matchesGame={compareResult.mainCharacter.matchesGame}
              matchesOther={compareResult.mainCharacter.matchesOther}
              gameDirection={compareResult.mainCharacter.direction}
              isMain={true}
            />

            <CategoryResult
              label="Secondary Character"
              value={guess.secondaryCharacter}
              isCorrect={compareResult.secondaryCharacter.exact}
              isPartial={compareResult.secondaryCharacter.matchesGame || compareResult.secondaryCharacter.matchesOther}
              matchesGame={compareResult.secondaryCharacter.matchesGame}
              matchesOther={compareResult.secondaryCharacter.matchesOther}
              gameDirection={compareResult.secondaryCharacter.direction}
              isMain={false}
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
  gameDirection?: "higher" | "lower" | null
  matchesGame?: boolean
  matchesOther?: boolean
  isMain?: boolean
}

function CategoryResult({ label, value, isCorrect, direction, isPartial, matchesGame, matchesOther, isMain, gameDirection }: CategoryResultProps) {
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
          ) : gameDirection === "higher" ? (
            <div className="flex text-center px-2">
              <span className="text-xs text-amber-600">↑ First Appeared in a newer game</span>
            </div>
          ) : gameDirection === "lower" ? (
            <div className="flex text-center px-2">
              <span className="text-xs text-amber-600">↓ First Appeared in an older game</span>
            </div>
          ) : isPartial ? (
            <div className="flex flex-col ml-3 justify-center">
              <div className="flex justify-center">
                <HelpCircle className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex text-center">
                {matchesGame ? (<span className="text-xs text-amber-600">Matches First Smash Title{matchesOther && ` and Correct ${isMain ? "Secondary" : "Main"}`}</span>) : matchesOther && (<span className="text-xs text-amber-600">Matches Correct {isMain ? "Secondary" : "Main"}</span>)} 
              </div>
            </div>
        ) :(
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
  const guessPlacement = formatPlacementValue(guessValue);
  const actualPlacement = formatPlacementValue(actualValue);
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

function formatPlacementValue(value: number): number {
  if(value == 0) return 0;
  if (value <= 2) return 1;
  if (value <= 3) return 3;
  if (value <= 5) return 5;
  if (value <= 9) return 9;
  if (value <= 13) return 13;
  if (value <= 17) return 17;
  if (value <= 25) return 25;
  if (value <= 33) return 33;
  return 69;
}

