import { getProviders } from "next-auth/react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { SignUpForm } from "./sign-up-form"

export default async function SignUpPage({ searchParams }) {
  const session = await getServerSession(authOptions)

  // Redirect to home if already signed in
  if (session) {
    redirect("/")
  }

  const providers = await getProviders()
  const callbackUrl = searchParams.callbackUrl || "/"

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign up to create fantasy brackets and compete with friends
          </p>
        </div>
        <SignUpForm providers={providers} callbackUrl={callbackUrl} />
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Already have an account?{" "}
            <a href="/auth/signin" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
