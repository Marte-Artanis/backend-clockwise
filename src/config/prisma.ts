import { PrismaClient } from '../generated/prisma'
import { getDatabaseUrl } from './database'

declare global {
  var prisma: PrismaClient | undefined
}

const prisma = global.prisma || new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
})

if (process.env['NODE_ENV'] === 'development') global.prisma = prisma

export default prisma 