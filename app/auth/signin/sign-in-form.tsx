"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { FcGoogle } from "react-icons/fc"
import Link from "next/link"

export function SignInForm({ providers, callbackUrl }) {
  return (
    <div className="space-y-6">
      {Object.values(providers).map((provider) => (
        <div key={provider.id}>
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-6"
            onClick={() => signIn(provider.id, { callbackUrl })}
          >
            {provider.id === "google" && <FcGoogle className="h-5 w-5" />}
            Sign in with {provider.name}
          </Button>
        </div>
      ))}

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Don't have an account?{" "}
          <a href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>

      <div className="text-center">
        <Link href="/" className="text-sm text-primary hover:underline">
          Return to Home
        </Link>
      </div>

      <div className="text-center">
        <Link href="/wordle" className="text-sm text-primary hover:underline">
          Continue to Wordle without signing in
        </Link>
      </div>
    </div>
  )
}
