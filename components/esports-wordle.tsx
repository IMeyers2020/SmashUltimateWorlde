"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { searchPlayers } from "@/lib/startgg-api"
import type { Player, TournamentEntrant } from "@/lib/types"
import PlayerGuessResult from "./player-guess-result"
import PlayerSuggestions from "./player-suggestions"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Loader2 } from "lucide-react"
import { useTournamentsByState, extractEntrantsFromTournaments } from "@/lib/client-api"
import { unique } from "next/dist/build/utils"

export default function EsportsWordle({ dailyPlayer }: { dailyPlayer: Player }) {
  const [guessInput, setGuessInput] = useState("")
  const [guesses, setGuesses] = useState<Player[]>([])
  const [suggestions, setSuggestions] = useState<Player[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [allEntrants, setAllEntrants] = useState<TournamentEntrant[]>([])
  const [isLoadingEntrants, setIsLoadingEntrants] = useState(true)

  // Use Apollo Client hooks to fetch tournament data
  const { data: iaTournaments, loading: iaLoading } = useTournamentsByState("IA")

  // Combine all tournament data
  useEffect(() => {
    const entrants: TournamentEntrant[] = [
      ...extractEntrantsFromTournaments(iaTournaments)
    ]

    // Remove duplicates
    const uniqueEntrants = entrants.filter(
      (entrant, index, self) => index === self.findIndex((e) => e.id === entrant.id),
    )

    setAllEntrants(uniqueEntrants)
    setIsLoadingEntrants(iaLoading)

  }, [iaTournaments, iaLoading])

  // Local search function
  const searchLocalEntrants = (query: string): TournamentEntrant[] => {
    if (!query || query.length < 2) return []

    const lowerQuery = query.toLowerCase()
    return allEntrants.filter((entrant) => entrant.gamerTag.toLowerCase().includes(lowerQuery)).slice(0, 10) // Limit to 10 results
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setGuessInput(value)

    if (value.length > 2) {
      setIsSearching(true)
      setShowSuggestions(true)

      try {
        // First try local search
        const localResults = searchLocalEntrants(value)

        if (localResults.length > 0) {
          // Convert entrants to player format for display
          const localPlayers: Player[] = localResults.map((entrant) => ({
            id: entrant.id,
            gamerTag: entrant.gamerTag,
            mainCharacter: "Unknown",
            secondaryCharacter: "None",
            averageLocalPlacement: 5,
            averageRegionalThreat: 5,
            timeCompeting: 3,
            region: "Unknown",
            tournamentCount: 10,
          }))

          setSuggestions(localPlayers)
        } else {
          // Fall back to API search if no local results
          const players = await searchPlayers(value)
          setSuggestions(players)
        }
      } catch (error) {
        console.error("Error searching players:", error)
        toast({
          title: "Error",
          description: "Failed to search players. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsSearching(false)
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const selectPlayer = (player: Player) => {
    setGuessInput(player.gamerTag)
    setSuggestions([])
    setShowSuggestions(false)
  }

  const submitGuess = async () => {
    if (!guessInput.trim()) return

    const selectedPlayer = suggestions.find((p) => p.gamerTag.toLowerCase() === guessInput.toLowerCase())

    if (!selectedPlayer) {
      toast({
        title: "Invalid player",
        description: "Please select a player from the suggestions.",
        variant: "destructive",
      })
      return
    }

    // Check if player was already guessed
    if (guesses.some((p) => p.id === selectedPlayer.id)) {
      toast({
        title: "Already guessed",
        description: "You've already guessed this player.",
        variant: "destructive",
      })
      return
    }

    // If the player was found in local search but doesn't have complete data,
    // fetch the complete player data from the API
    let completePlayer = selectedPlayer
    if (!selectedPlayer.mainCharacter || selectedPlayer.mainCharacter === "Unknown") {
      try {
        setIsSearching(true)
        const players = await searchPlayers(selectedPlayer.gamerTag)
        const matchedPlayer = players.find((p) => p.id === selectedPlayer.id)
        if (matchedPlayer) {
          completePlayer = matchedPlayer
        }
      } catch (error) {
        console.error("Error fetching complete player data:", error)
      } finally {
        setIsSearching(false)
      }
    }

    const newGuesses = [...guesses, completePlayer]
    setGuesses(newGuesses)
    setGuessInput("")

    // Check if the guess is correct
    if (completePlayer.id === dailyPlayer.id) {
      setGameWon(true)
      toast({
        title: "Congratulations!",
        description: `You guessed correctly! The player was ${dailyPlayer.gamerTag}.`,
        variant: "default",
      })
    } else if (newGuesses.length >= 6) {
      toast({
        title: "Game Over",
        description: `You've used all your guesses. The player was ${dailyPlayer.gamerTag}.`,
        variant: "destructive",
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submitGuess()
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {isLoadingEntrants && (
        <div className="flex justify-center items-center mb-4">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading player database...</span>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">
              Guess the Esports player in 6 tries. Each guess must be a valid player name.
            </p>
          </div>

          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="Enter player name"
              value={guessInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={gameWon || guesses.length >= 6 || isLoadingEntrants}
              className="flex-1"
            />
            <Button
              onClick={submitGuess}
              disabled={!guessInput || gameWon || guesses.length >= 6 || isSearching || isLoadingEntrants}
            >
              Guess
            </Button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <PlayerSuggestions suggestions={suggestions} onSelect={selectPlayer} isLoading={isSearching} />
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {guesses.length > 0 ? (
          guesses.map((guess, index) => <PlayerGuessResult key={index} guess={guess} dailyPlayer={dailyPlayer} />)
        ) : (
          <div className="text-center p-8 text-muted-foreground">No guesses yet. Start by typing a player name.</div>
        )}
      </div>

      <Toaster />
    </div>
  )
}

