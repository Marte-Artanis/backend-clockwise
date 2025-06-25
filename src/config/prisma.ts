import { PrismaClient } from '@prisma/client'
import { env } from './env'
import { databaseConfig } from './database'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseConfig[env.NODE_ENV].url
    }
  }
})

export default prisma 