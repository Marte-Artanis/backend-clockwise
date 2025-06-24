import { PrismaClient } from '../generated/prisma'
import 'fastify'

declare module 'fastify' {
  interface FastifyInstance {
    prisma?: PrismaClient
  }
} 