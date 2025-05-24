"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"

export function BracketView({ tournament, mainEvent, bracket, status }) {
  if (!bracket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Bracket Found</h2>
        <p>You didn't create a fantasy bracket for this tournament before it started.</p>
      </div>
    )
  }

  // Get all entrants from the main event
  const entrantsMap = new Map()
  mainEvent.entrants.nodes.forEach((node) => {
    entrantsMap.set(node.id, {
      id: node.id,
      name: node.participants[0].gamerTag,
      image: node.participants[0].user?.images?.[0]?.url || "/placeholder.svg?height=40&width=40",
    })
  })

  // Get predictions
  const { top8, xFactors, darkHorse } = bracket.predictions

  return (
    <Tabs defaultValue="top8" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="top8">Top 8</TabsTrigger>
        <TabsTrigger value="xfactors">X-Factors</TabsTrigger>
        <TabsTrigger value="darkhorse">Dark Horse</TabsTrigger>
      </TabsList>

      <TabsContent value="top8">
        <Card>
          <CardHeader>
            <CardTitle>Your Top 8 Predictions</CardTitle>
            <CardDescription>
              {status === "completed"
                ? "Here's how your predictions performed."
                : "The tournament is in progress. Your predictions are locked."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {top8.map((entrantId, index) => {
                const entrant = entrantsMap.get(entrantId)
                return (
                  <div key={`top8-${index}`} className="flex items-center gap-4 p-2 rounded-md bg-muted">
                    <div className="font-bold w-10 text-center">
                      {index === 0 ? "1st" : index === 1 ? "2nd" : index === 2 ? "3rd" : `${index + 1}th`}
                    </div>
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={entrant?.image || "/placeholder.svg?height=40&width=40"}
                        alt={entrant?.name || "Unknown player"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">{entrant?.name || "Unknown player"}</div>
                    {status === "completed" && (
                      <div className="font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                        +{Math.floor(Math.random() * 100)} pts
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="xfactors">
        <Card>
          <CardHeader>
            <CardTitle>Your X-Factor Predictions</CardTitle>
            <CardDescription>
              {status === "completed"
                ? "Here's how your X-Factor players performed."
                : "The tournament is in progress. Your predictions are locked."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {xFactors.map((entrantId, index) => {
                const entrant = entrantsMap.get(entrantId)
                return (
                  <div key={`xfactor-${index}`} className="flex items-center gap-4 p-2 rounded-md bg-muted">
                    <div className="font-bold w-10 text-center">#{index + 1}</div>
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={entrant?.image || "/placeholder.svg?height=40&width=40"}
                        alt={entrant?.name || "Unknown player"}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">{entrant?.name || "Unknown player"}</div>
                    {status === "completed" && (
                      <div className="font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                        +{Math.floor(Math.random() * 100)} pts
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="darkhorse">
        <Card>
          <CardHeader>
            <CardTitle>Your Dark Horse Prediction</CardTitle>
            <CardDescription>
              {status === "completed"
                ? "Here's how your Dark Horse player performed."
                : "The tournament is in progress. Your prediction is locked."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {darkHorse && (
                <div className="flex items-center gap-4 p-2 rounded-md bg-muted">
                  <div className="font-bold w-10 text-center">DH</div>
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={entrantsMap.get(darkHorse)?.image || "/placeholder.svg?height=40&width=40"}
                      alt={entrantsMap.get(darkHorse)?.name || "Unknown player"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">{entrantsMap.get(darkHorse)?.name || "Unknown player"}</div>
                  {status === "completed" && (
                    <div className="font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                      +{Math.floor(Math.random() * 100)} pts
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
