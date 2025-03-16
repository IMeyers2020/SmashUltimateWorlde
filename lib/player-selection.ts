"use server"

import type { Player } from "./types"
import { getPlayerById } from "./startgg-api"

// Sample pool of player IDs to choose from
// In a real application, you would have a larger pool
const playerPool = [
  "1", // Example player IDs
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  // Add more player IDs to your pool
]

// Fallback player data in case API fails
const fallbackPlayers: Player[] = [
  {
    id: "1",
    gamerTag: "Mango",
    mainCharacter: "Fox",
    secondaryCharacter: "Falco",
    averageLocalPlacement: 1.2,
    averageRegionalThreat: 9.5,
    timeCompeting: 10,
    region: "East Coast",
    tournamentCount: 45,
  },
  {
    id: "2",
    gamerTag: "Zain",
    mainCharacter: "Marth",
    secondaryCharacter: "Roy",
    averageLocalPlacement: 2.5,
    averageRegionalThreat: 7.8,
    timeCompeting: 8,
    region: "West Coast",
    tournamentCount: 32,
  },
  {
    id: "3",
    gamerTag: "Hungrybox",
    mainCharacter: "Jigglypuff",
    secondaryCharacter: "Peach",
    averageLocalPlacement: 1.5,
    averageRegionalThreat: 9.2,
    timeCompeting: 12,
    region: "Europe",
    tournamentCount: 67,
  },
  // Add more fallback players
]

export async function getDailyPlayer(): Promise<Player> {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date()
    const dateString = today.toISOString().split("T")[0]

    // Use the date string to deterministically select a player ID from the pool
    const seed = hashString(dateString)
    const selectedIndex = seed % playerPool.length
    const selectedPlayerId = playerPool[selectedIndex]

    // Fetch the player data from StartGG API
    const player = await getPlayerById(selectedPlayerId)

    if (player) {
      return player
    }

    // If API fails, use fallback data
    return fallbackPlayers[selectedIndex % fallbackPlayers.length]
  } catch (error) {
    console.error("Error getting daily player:", error)

    // If anything fails, return the first fallback player
    return fallbackPlayers[0]
  }
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

