import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb"
import { DateTime } from "luxon"

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

export const docClient = DynamoDBDocumentClient.from(client)

// Table names
export const USERS_TABLE = "UsersTable"
export const FANTASY_BRACKETS_TABLE = "FantasyBracketsTable"

// User operations
export async function getUser(id: string) {
  try {
    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: { id },
    })
    const response = await docClient.send(command)
    console.debug("User successfully created")
    return response.Item
  } catch (error) {
    console.error("Error getting user from DynamoDB:", error)
    return null
  }
}

export async function createUser(user: any) {
  try {
    const command = new PutCommand({
      TableName: USERS_TABLE,
      Item: {
        ...user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        points: 0,
      },
    })
    const response = await docClient.send(command)
    return response
  } catch (error) {
    console.error("Error creating user in DynamoDB:", error)
    return null
  }
}

export async function updateUser(id: string, updates: any) {
  try {
    const updateExpression = "set " + Object.keys(updates).map(key => `#${key} = :${key}`).join(", ") + ", #updatedAt = :updatedAt"
    
    const expressionAttributeNames = Object.keys(updates).reduce((acc, key) => {
      acc[`#${key}`] = key
      return acc
    }, { "#updatedAt": "updatedAt" } as Record<string, string>)
    
    const expressionAttributeValues = Object.keys(updates).reduce((acc, key) => {
      acc[`:${key}`] = updates[key]
      return acc
    }, { ":updatedAt": DateTime.now().toISOTime() } satisfies Record<string, any>)

    console.log("AT VALS: ", expressionAttributeValues)
    
    const command = new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
    
    const response = await docClient.send(command)
    return response.Attributes
  } catch (error) {
    console.error("Error updating user in DynamoDB:", error)
    return null
  }
}

// Fantasy bracket operations
export async function getFantasyBracket(id: string) {
  try {
    const command = new GetCommand({
      TableName: FANTASY_BRACKETS_TABLE,
      Key: { id },
    })
    const response = await docClient.send(command)
    return response.Item
  } catch (error) {
    console.error("Error getting fantasy bracket from DynamoDB:", error)
    return null
  }
}

export async function getUserFantasyBrackets(userId: string) {
  try {
    const command = new QueryCommand({
      TableName: FANTASY_BRACKETS_TABLE,
      IndexName: "UserIdIndex",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
      ScanIndexForward: false, // Sort in descending order (newest first)
    })
    const response = await docClient.send(command)
    return response.Items || []
  } catch (error) {
    console.error("Error getting user fantasy brackets from DynamoDB:", error)
    return []
  }
}

export async function getTournamentFantasyBracket(userId: string, tournamentId: string) {
  try {
    const command = new QueryCommand({
      TableName: FANTASY_BRACKETS_TABLE,
      IndexName: "UserTournamentIndex",
      KeyConditionExpression: "userId = :userId AND tournamentId = :tournamentId",
      ExpressionAttributeValues: {
        ":userId": userId,
        ":tournamentId": tournamentId,
      },
    })
    const response = await docClient.send(command)
    return response.Items?.[0] || null
  } catch (error) {
    console.error("Error getting tournament fantasy bracket from DynamoDB:", error)
    return null
  }
}

export async function createFantasyBracket(bracket: any) {
  try {
    const id = `${bracket.userId}-${bracket.tournamentId}`
    const command = new PutCommand({
      TableName: FANTASY_BRACKETS_TABLE,
      Item: {
        id,
        ...bracket,
        points: 0,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    })
    await docClient.send(command)
    return { id, ...bracket }
  } catch (error) {
    console.error("Error creating fantasy bracket in DynamoDB:", error)
    return null
  }
}

export async function updateFantasyBracket(id: string, updates: any) {
  try {
    const updateExpression = "set " + Object.keys(updates).map(key => `#${key} = :${key}`).join(", ") + ", #updatedAt = :updatedAt"
    
    const expressionAttributeNames = Object.keys(updates).reduce((acc, key) => {
      acc[`#${key}`] = key
      return acc
    }, { "#updatedAt": "updatedAt" } as Record<string, string>)
    
    const expressionAttributeValues = Object.keys(updates).reduce((acc, key) => {
      acc[`:${key}`] = updates[key]
      return acc
    }, { ":updatedAt": new Date().toISOString() } as Record<string, any>)
    
    const command = new UpdateCommand({
      TableName: FANTASY_BRACKETS_TABLE,
      Key: { id },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
    
    const response = await docClient.send(command)
    return response.Attributes
  } catch (error) {
    console.error("Error updating fantasy bracket in DynamoDB:", error)
    return null
  }
}

// Get top users by points
export async function getTopUsers(limit = 50) {
  try {
    const command = new ScanCommand({
      TableName: USERS_TABLE,
      Limit: limit,
    })
    const response = await docClient.send(command)
    const users = response.Items || []
    
    // Sort by points in descending order
    return users.sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, limit)
  } catch (error) {
    console.error("Error getting top users from DynamoDB:", error)
    return []
  }
}

