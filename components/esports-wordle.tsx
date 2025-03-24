"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { fetchEntrantsPage, getPlayerById } from "@/lib/startgg-api"
import type { Player, StaticPlayerProps, TournamentEntrant } from "@/lib/types"
import PlayerGuessResult from "./player-guess-result"
import PlayerSuggestions from "./player-suggestions"
import { toast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { PlayerIds } from "@/lib/player-ids"
import { PlayerStaticValues } from "@/lib/static-players"

export default function EsportsWordle({ dailyPlayer }: { dailyPlayer: Player }) {
  const [guessInput, setGuessInput] = useState("")
  const [guesses, setGuesses] = useState<Player[]>([])
  const [suggestions, setSuggestions] = useState<{ gamerTag: string, playerId: number}[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [allPlayers, setAllPlayers] = useState<StaticPlayerProps[]>(PlayerStaticValues)

  const Search = (val: string) => {
    return allPlayers?.filter(x => x.gamerTag.toLowerCase().includes(val.toLowerCase()) && PlayerStaticValues.map(y => +y.id).includes(+x.id)) ?? []
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setGuessInput(value)

    if (value.length > 1) {
      setIsSearching(true)
      setShowSuggestions(true)

      try {
        // First try local search
        const localResults = Search(value);
        setSuggestions(localResults.map(x => ({
          playerId: +x.id,
          gamerTag: x.gamerTag
        })))
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

    const guessString = allPlayers.find(x => x.gamerTag.toLowerCase() === guessInput.toLowerCase());

    if (!guessString) {
      toast({
        title: "Invalid player",
        description: "Please select a player from the suggestions.",
        variant: "destructive",
      })
      return
    }

    const selectedPlayer = await getPlayerById(+guessString.id)

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
        const player = await getPlayerById(+selectedPlayer.id)
        if (player) {
          completePlayer = player
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
    } else if (newGuesses.length >= 8) {
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

  const playerChosen = async (pId: number) => {
    const player = await getPlayerById(pId);
    if(player) {
      selectPlayer(player)
    } else {
      toast({
        title: "Error",
        description: `Failed to get the player ${player}. Try to ensure you are using their most recent tag`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">
              Guess the Iowa Smash player in 8 tries. Each guess must be a valid player name.
            </p>
          </div>

          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder={"Enter player name"}
              value={guessInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={gameWon || guesses.length >= 8}
              className="flex-1"
            />
            <Button
              className="border rounded-lg hover:bg-slate-100 bg-slate-500 text-white hover:text-slate-600 cursor-pointer"
              onClick={submitGuess}
              disabled={!guessInput || gameWon || guesses.length >= 8 || isSearching }
            >
              Guess
            </Button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <PlayerSuggestions suggestions={suggestions} onSelect={playerChosen} isLoading={isSearching} />
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

