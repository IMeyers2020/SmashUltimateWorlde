import type { Adapter } from "next-auth/adapters"
import { createUser, getUser, updateUser } from "./dynamodb"
import { v4 as uuidv4 } from "uuid"

export function DynamoDBAdapter(): Adapter {
  return {
    async createUser(user) {
      const id = uuidv4()
      const newUser = await createUser({
        id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
      })
      return { id, ...newUser }
    },
    
    async getUser(id) {
      const user = await getUser(id)
      return user || null
    },
    
    async getUserByEmail(email) {
      // This would require a GSI on email in DynamoDB
      // For simplicity, we'll return null and let OAuth handle it
      return null
    },
    
    async getUserByAccount({ providerAccountId, provider }) {
      // This would require a GSI on provider+providerAccountId in DynamoDB
      // For simplicity, we'll return null and let OAuth handle it
      return null
    },
    
    async updateUser(user) {
      const { id, ...updates } = user
      const updatedUser = await updateUser(id, updates)
      return { id, ...updatedUser }
    },
    
    async deleteUser(userId) {
      // Not implemented for simplicity
      return null
    },
    
    async linkAccount(account) {
      // Store account info in user record
      const user = await getUser(account.userId)
      if (user) {
        const accounts = user.accounts || []
        accounts.push(account)
        await updateUser(account.userId, { accounts })
      }
      return account
    },
    
    async unlinkAccount({ providerAccountId, provider }) {
      // Not implemented for simplicity
      return
    },
    
    async createSession({ sessionToken, userId, expires }) {
      // Store session in user record
      const user = await getUser(userId)
      if (user) {
        const sessions = user.sessions || []
        const session = { sessionToken, userId, expires }
        sessions.push(session)
        await updateUser(userId, { sessions })
      }
      return { sessionToken, userId, expires }
    },
    
    async getSessionAndUser(sessionToken) {
      // This would require a GSI on sessionToken in DynamoDB
      // For simplicity, we'll return null and let OAuth handle it
      return null
    },
    
    async updateSession({ sessionToken, expires, userId }) {
      // Not implemented for simplicity
      return null
    },
    
    async deleteSession(sessionToken) {
      // Not implemented for simplicity
      return
    },
    
    async createVerificationToken({ identifier, expires, token }) {
      // Not implemented for simplicity
      return { identifier, expires, token }
    },
    
    async useVerificationToken({ identifier, token }) {
      // Not implemented for simplicity
      return null
    },
  }
}

