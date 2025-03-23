import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Twitter, MessageSquare } from "lucide-react"

export default function HomePage() {
  // Mock data for biggest upset
  const biggestUpset = {
    title: "Cloud9 Defeats T1 in Stunning Reverse Sweep",
    description:
      "In an unexpected turn of events, Cloud9 managed to reverse sweep tournament favorites T1 in the quarterfinals, coming back from an 0-2 deficit to win 3-2.",
    date: "April 15, 2024",
    teams: {
      winner: {
        name: "Cloud9",
        seed: 8,
        logo: "/placeholder.svg?height=80&width=80",
      },
      loser: {
        name: "T1",
        seed: 1,
        logo: "/placeholder.svg?height=80&width=80",
      },
    },
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-12">
      <div className="w-full max-w-5xl flex flex-col items-center gap-8">
        <h1 className="text-4xl md:text-6xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
          Iowa Smash Ultimate
        </h1>

        <p className="text-center text-lg text-muted-foreground max-w-2xl">
          Test your knowledge of players from all over the state with our daily Wordle challenge.
        </p>

        <Link href="/wordle" className="w-full max-w-xs border rounded-lg hover:bg-slate-100 bg-slate-500 text-white hover:text-slate-600 cursor-pointer">
          <Button size="lg" className="w-full text-lg py-6">
            Play Wordle
          </Button>
        </Link>

        {/* <Card className="w-full mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Biggest Upset of the Week</CardTitle>
            <CardDescription>{biggestUpset.date}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex flex-1 items-center justify-center gap-4">
                <div className="flex flex-col items-center">
                  <Image
                    src={biggestUpset.teams.winner.logo || "/placeholder.svg"}
                    alt={biggestUpset.teams.winner.name}
                    width={80}
                    height={80}
                    className="rounded-full border-4 border-green-500"
                  />
                  <p className="font-bold mt-2">{biggestUpset.teams.winner.name}</p>
                  <p className="text-sm text-muted-foreground">Seed #{biggestUpset.teams.winner.seed}</p>
                </div>
                <div className="text-2xl font-bold">vs</div>
                <div className="flex flex-col items-center">
                  <Image
                    src={biggestUpset.teams.loser.logo || "/placeholder.svg"}
                    alt={biggestUpset.teams.loser.name}
                    width={80}
                    height={80}
                    className="rounded-full border-4 border-red-500"
                  />
                  <p className="font-bold mt-2">{biggestUpset.teams.loser.name}</p>
                  <p className="text-sm text-muted-foreground">Seed #{biggestUpset.teams.loser.seed}</p>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{biggestUpset.title}</h3>
                <p className="text-muted-foreground">{biggestUpset.description}</p>
              </div>
            </div>
          </CardContent>
        </Card> */}

        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md">
          <Link target="_blank" className="hover:bg-slate-500 hover:text-white text-slate-600 border rounded-lg cursor-pointer" href="https://discord.gg/eDKrEYk9de">
            <Button size="lg" className="flex-1 gap-2">
              <MessageSquare className="h-5 w-5" />
              Join our Discord
            </Button>
          </Link>
          <Link target="_blank" className="hover:bg-slate-500 hover:text-white text-slate-600 border rounded-lg cursor-pointer" href="https://x.com/IowaSSBU">
            <Button size="lg" className="flex-1 gap-2">
            <Twitter className="h-5 w-5" />
              Follow our Twitter
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

