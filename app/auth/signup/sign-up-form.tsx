"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"
import Link from "next/link"

export function SignUpForm({ providers, callbackUrl }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          We use Google for authentication to keep your account secure.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No password to remember - just click below to get started!
        </p>
      </div>

      {Object.values(providers).map((provider) => (
        <div key={provider.id}>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-6"
            onClick={() => signIn(provider.id, { callbackUrl })}
          >
            {provider.id === "google" && <FcGoogle className="h-5 w-5" />}
            Sign up with {provider.name}
          </Button>
        </div>
      ))}

      <div className="text-center">
        <Link href="/" className="text-sm text-primary hover:underline">
          Return to Home
        </Link>
      </div>

      <div className="text-center">
        <Link href="/wordle" className="text-sm text-primary hover:underline">
          Continue to Wordle without signing up
        </Link>
      </div>
    </div>
  )
}
