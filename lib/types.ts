
export interface StaticPlayerProps {
  id: string
  gamerTag: string
  mainCharacter: string
  secondaryCharacter: string
  region: string
}
export type Player = StaticPlayerProps & {
  averageLocalPlacement: number
  averageMonthlyPlacement: number
  averageRegionalPlacement: number
  numSetsPlayed: number
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
export interface TournamentEntrant { gamerTag: string, playerId: number}

