"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { saveBracket } from "./actions"

export function BracketForm({ tournament, mainEvent, existingBracket, userId }) {
  const [top8, setTop8] = useState(existingBracket?.predictions?.top8 || Array(8).fill(""))
  const [xFactors, setXFactors] = useState(existingBracket?.predictions?.xFactors || Array(3).fill(""))
  const [darkHorse, setDarkHorse] = useState(existingBracket?.predictions?.darkHorse || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Get all entrants from the main event
  const entrants = mainEvent.entrants.nodes.map((node) => ({
    id: node.id,
    name: node.participants[0].gamerTag,
    image: node.participants[0].user?.images?.[0]?.url,
  }))

  const handleTop8Change = (index, value) => {
    const newTop8 = [...top8]
    newTop8[index] = value
    setTop8(newTop8)
  }

  const handleXFactorChange = (index, value) => {
    const newXFactors = [...xFactors]
    newXFactors[index] = value
    setXFactors(newXFactors)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (top8.some((id) => !id)) {
        throw new Error("Please select all Top 8 players")
      }

      if (xFactors.some((id) => !id)) {
        throw new Error("Please select all X-Factor players")
      }

      if (!darkHorse) {
        throw new Error("Please select a Dark Horse player")
      }

      // Check for duplicates
      const allSelections = [...top8, ...xFactors, darkHorse]
      const uniqueSelections = new Set(allSelections)

      if (uniqueSelections.size !== allSelections.length) {
        throw new Error("Please select different players for each position")
      }

      // Save bracket
      await saveBracket({
        userId,
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        tournamentSlug: tournament.slug,
        startTime: new Date(mainEvent.startAt * 1000),
        predictions: {
          top8,
          xFactors,
          darkHorse,
        },
      })

      toast({
        title: "Bracket saved!",
        description: "Your fantasy bracket has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error saving bracket",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="top8" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="top8">Top 8</TabsTrigger>
          <TabsTrigger value="xfactors">X-Factors</TabsTrigger>
          <TabsTrigger value="darkhorse">Dark Horse</TabsTrigger>
        </TabsList>

        <TabsContent value="top8">
          <Card>
            <CardHeader>
              <CardTitle>Predict the Top 8</CardTitle>
              <CardDescription>
                Select the 8 players you think will make it to the top 8 in this tournament. You'll earn points based on
                their actual placement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={`top8-${index}`} className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">
                    {index === 0 ? "1st" : index === 1 ? "2nd" : index === 2 ? "3rd" : `${index + 1}th`}
                  </Label>
                  <div className="col-span-3">
                    <Select value={top8[index]} onValueChange={(value) => handleTop8Change(index, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        {entrants.map((entrant) => (
                          <SelectItem key={entrant.id} value={entrant.id}>
                            {entrant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="xfactors">
          <Card>
            <CardHeader>
              <CardTitle>X-Factor Players</CardTitle>
              <CardDescription>
                Select 3 players you think will cause upsets in the tournament. You'll earn points based on the biggest
                upset they achieve.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`xfactor-${index}`} className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">X-Factor {index + 1}</Label>
                  <div className="col-span-3">
                    <Select value={xFactors[index]} onValueChange={(value) => handleXFactorChange(index, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        {entrants.map((entrant) => (
                          <SelectItem key={entrant.id} value={entrant.id}>
                            {entrant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="darkhorse">
          <Card>
            <CardHeader>
              <CardTitle>Dark Horse</CardTitle>
              <CardDescription>
                Select 1 player you think will greatly outperform their seed. You'll earn more points the better they do
                compared to their expected placement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Dark Horse</Label>
                <div className="col-span-3">
                  <Select value={darkHorse} onValueChange={setDarkHorse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {entrants.map((entrant) => (
                        <SelectItem key={entrant.id} value={entrant.id}>
                          {entrant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Bracket"}
        </Button>
      </div>
    </form>
  )
}
