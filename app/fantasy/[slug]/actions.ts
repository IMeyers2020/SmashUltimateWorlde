"use server"

import { createFantasyBracket, getTournamentFantasyBracket, updateFantasyBracket, updateUser, getUser } from "@/lib/dynamodb"
import { revalidatePath } from "next/cache"

export async function saveBracket(data) {
  try {
    const { userId, tournamentId } = data
    
    // Check if bracket already exists
    const existingBracket = await getTournamentFantasyBracket(userId, tournamentId)
    
    if (existingBracket) {
      // Update existing bracket
      await updateFantasyBracket(existingBracket.id, {
        predictions: data.predictions,
      })
    } else {
      // Create new bracket
      await createFantasyBracket({
        userId,
        tournamentId: data.tournamentId,
        tournamentName: data.tournamentName,
        tournamentSlug: data.tournamentSlug,
        startTime: data.startTime,
        predictions: data.predictions,
      })
    }
    
    revalidatePath(`/fantasy/${data.tournamentSlug}`)
    return { success: true }
  } catch (error) {
    console.error("Error saving bracket:", error)
    return { success: false, error: error.message }
  }
}

