import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Twitter, MessageSquare } from "lucide-react"
import BiggestUpset from "@/components/biggest-upset"

export default function HomePage() {
  // Mock data for biggest upset

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
          <Button size="lg" className="w-full text-lg py-6 cursor-pointer">
            Play Wordle
          </Button>
        </Link>

        <div className="flex flex-col gap-4 mt-8 max-w-md">
          <BiggestUpset></BiggestUpset>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full">
            <Link target="_blank" className="hover:bg-slate-500 hover:text-white text-slate-600 border rounded-lg cursor-pointer" href="https://discord.gg/eDKrEYk9de">
              <Button size="lg" className="flex-1 gap-2 cursor-pointer">
                <MessageSquare className="h-5 w-5" />
                Join our Discord
              </Button>
            </Link>
            <Link target="_blank" className="hover:bg-slate-500 hover:text-white text-slate-600 border rounded-lg cursor-pointer" href="https://x.com/IowaSSBU">
              <Button size="lg" className="flex-1 gap-2 cursor-pointer">
              <Twitter className="h-5 w-5" />
                Follow our Twitter
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

