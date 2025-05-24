import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { DynamoDBAdapter } from "@/lib/dynamodb-adapter"
import { storeUserInS3, getUserFromS3 } from "@/lib/s3"
import { createUser, getUser, updateUser } from "@/lib/dynamodb"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: DynamoDBAdapter(),
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log({ user, account, profile })
      try {
        // Check if user exists in DynamoDB
        let dbUser = await getUser(user.id)
        console.log("DBUser: ", dbUser)
        
        if (!dbUser) {
          // Create new user in DynamoDB
          dbUser = await createUser({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          })
        } else {
          // Update user's last sign-in time
          await updateUser(user.id, {
            lastSignIn: new Date().toISOString(),
          })
        }
        
        // Store user data in S3 as well
        // await storeUserInS3({
        //   id: user.id,
        //   name: user.name,
        //   email: user.email,
        //   image: user.image,
        //   lastSignIn: new Date().toISOString(),
        // })
        
        return true
      } catch (error) {
        console.error("Error during sign in:", error)
        return false
      }
    },
    async session({ session, user }) {
      // Add user ID to the session
      console.log("SESSION GOT CALLED: ", session, user)
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

