export interface Player {
  id: string
  gamerTag: string
  mainCharacter: string
  secondaryCharacter: string
  averagePlacement: number
  numSetsPlayed: number
  region: string
}

export interface StartGGStanding {
  placement: number,
  metadata: any,
  container: {
    numEntrants: number
    tournament: {
      city: string
    }
  }
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
  recentStandings: StartGGStanding[]
}

// New type for tournament entrants
export interface TournamentEntrant {
  id: string
  gamerTag: string
  participantId: string
  playerId: string
}

