"use client"

import type { Player } from "@/lib/types"
import { Loader2 } from "lucide-react"

interface PlayerSuggestionsProps {
  suggestions: Player[]
  onSelect: (player: Player) => void
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
    <div className="absolute z-10 w-full bg-background border rounded-md shadow-md mt-1 max-h-60 overflow-y-auto">
      <ul className="py-1">
        {suggestions.map((player) => (
          <li
            key={player.id}
            className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center justify-between"
            onClick={() => onSelect(player)}
          >
            <div>
              <div className="font-medium">{player.gamerTag}</div>
              <div className="text-xs text-muted-foreground">
                {player.mainCharacter} • {player.region}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

