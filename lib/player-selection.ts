"use server"

import type { Player } from "./types"
import { getPlayerById } from "./startgg-api"
import { PlayerIds } from "./player-ids";
import { DateTime } from "luxon";

export async function getDailyPlayer(): Promise<Player | null> {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = DateTime.now().startOf("day").toSeconds().toString()

    const seed = hashString(today)
    const selectedIndex = seed % PlayerIds.length
    const selectedPlayerId = PlayerIds[selectedIndex]

    // Fetch the player data from StartGG API
    const player = await getPlayerById(selectedPlayerId)

    // Fetch the player data from StartGG API
    if (player) {
      return player
    }
  } catch (error) {
    console.error("Error getting daily player:", error)
  }
  return null
}

// Simple hash function to convert a string to a number
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

