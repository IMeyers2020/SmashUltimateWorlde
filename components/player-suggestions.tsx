"use client"

import type { Player } from "@/lib/types"
import { Loader2 } from "lucide-react"

interface PlayerSuggestionsProps {
  suggestions: { gamerTag: string, playerId: number}[]
  onSelect: (player: number) => void
  isLoading: boolean
}

export default function PlayerSuggestions({ suggestions, onSelect, isLoading }: PlayerSuggestionsProps) {
  if (isLoading) {
    return (
      <div className="absolute z-10 w-full bg-background border rounded-md shadow-md mt-1 p-4 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="z-10 w-full bg-background flex border rounded-md shadow-md mt-1 max-h-60 overflow-y-auto">
      {suggestions.map((player) => (
          <div
            key={player.playerId}
            className="px-4 py-2 hover:bg-muted bg-background cursor-pointer flex items-center justify-between"
            onClick={() => onSelect(player.playerId)}
          >
            <div className="font-medium bg-background">{player.gamerTag}</div>
          </div>
      ))}
    </div>
  )
}

