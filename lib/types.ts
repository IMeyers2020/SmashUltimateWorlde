export interface Player {
  id: string
  gamerTag: string
  mainCharacter: string
  secondaryCharacter: string
  averageLocalPlacement: number
  averageRegionalThreat: number
  timeCompeting: number
  region: string
  tournamentCount: number // New field
}

export interface StartGGPlayer {
  id: string
  gamerTag: string
  user: {
    id: string
    slug: string
    name: string
    location: {
      country: string
      state: string
    } | null
  } | null
}

// New type for tournament entrants
export interface TournamentEntrant {
  id: string
  gamerTag: string
  participantId: string
}

