import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

const bucketName = process.env.AWS_S3_BUCKET_NAME || ""

/**
 * Store user data in S3
 */
export async function storeUserInS3(user: any) {
  if (!bucketName) {
    console.error("AWS S3 bucket name not configured")
    return null
  }

  try {
    const params = {
      Bucket: bucketName,
      Key: `users/${user.id}.json`,
      Body: JSON.stringify(user),
      ContentType: "application/json",
    }

    const command = new PutObjectCommand(params)
    await s3Client.send(command)

    return true
  } catch (error) {
    console.error("Error storing user in S3:", error)
    return null
  }
}

/**
 * Get user data from S3
 */
export async function getUserFromS3(userId: string) {
  if (!bucketName) {
    console.error("AWS S3 bucket name not configured")
    return null
  }

  try {
    const params = {
      Bucket: bucketName,
      Key: `users/${userId}.json`,
    }

    const command = new GetObjectCommand(params)
    const response = await s3Client.send(command)

    if (response.Body) {
      const bodyContents = await response.Body.transformToString()
      return JSON.parse(bodyContents)
    }

    return null
  } catch (error) {
    // If the file doesn't exist, return null instead of throwing an error
    if ((error as any).name === "NoSuchKey") {
      return null
    }

    console.error("Error getting user from S3:", error)
    return null
  }
}
