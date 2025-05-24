import { getTopUsers } from "@/lib/dynamodb"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy } from 'lucide-react'

export const revalidate = 3600 // Revalidate every hour

export default async function LeaderboardPage() {
  // Get top users by points
  const users = await getTopUsers(50)

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Leaderboard</h1>
      <p className="text-xl mb-8">See who's leading the fantasy brackets competition!</p>

      <Card>
        <CardHeader>
          <CardTitle>Top Fantasy Players</CardTitle>
          <CardDescription>Players ranked by total points earned across all tournaments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length > 0 ? (
              users.map((user, index) => {
                const initials = user.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "U"

                return (
                  <div key={user.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
                    <div className="font-bold w-8 text-center">{index + 1}</div>
                    {index < 3 && (
                      <Trophy
                        className={`h-5 w-5 ${
                          index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : "text-amber-700"
                        }`}
                      />
                    )}
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name || "User"} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 font-medium">{user.name}</div>
                    <div className="font-mono font-bold">{user.points || 0} pts</div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No data available yet. Check back after tournaments are completed!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

