import { MongoMemoryServer } from 'mongodb-memory-server'

// Set env vars at module load time (before any NestJS module is created)
process.env.JWT_SECRET = 'gdash-secret-key'

let mongoServer: MongoMemoryServer

export async function setupTestDatabase() {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  process.env.MONGODB_URI = uri
  return uri
}

export async function teardownTestDatabase() {
  if (mongoServer) {
    await mongoServer.stop()
  }
}
