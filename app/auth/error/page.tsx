"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  let errorMessage = "An error occurred during authentication."

  if (error === "AccessDenied") {
    errorMessage = "Access denied. You may not have permission to sign in."
  } else if (error === "Verification") {
    errorMessage = "The verification link may have expired or been used already."
  } else if (error === "OAuthSignin" || error === "OAuthCallback") {
    errorMessage = "There was a problem with the OAuth authentication process."
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Authentication Error</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{errorMessage}</p>
        </div>

        <div className="flex flex-col space-y-4">
          <Button asChild>
            <Link href="/auth/signin">Try Again</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
