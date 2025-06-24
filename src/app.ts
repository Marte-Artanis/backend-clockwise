import Fastify, { FastifyError, FastifyRequest, FastifyReply } from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { config } from './config/env'
import { userRoutes } from './modules/users/controller'
import { clockRoutes } from './modules/clock/controller'
import { PrismaClient } from './generated/prisma'

export async function buildApp(customPrisma?: PrismaClient) {
  const app = Fastify({
    logger: config.NODE_ENV === 'development'
  })

  await app.register(cors, {
    origin: true,
    credentials: true
  })

  await app.register(jwt, {
    secret: config.JWT_SECRET,
    sign: {
      expiresIn: '7d'
    },
    verify: {
      extractToken: (request) => {
        const authHeader = request.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) return undefined
        return authHeader.slice(7)
      }
    }
  })

  // Adiciona o prisma client ao contexto do app
  app.decorate('prisma', customPrisma)

  // Registra as rotas
  await app.register(userRoutes)
  await app.register(clockRoutes)

  app.setErrorHandler((error: FastifyError, _request: FastifyRequest, reply: FastifyReply) => {
    app.log.error(error)

    if (error.validation) {
      return reply.status(400).send({
        success: false,
        error: 'Validation error',
        message: error.message
      })
    }

    return reply.status(500).send({
      success: false,
      error: 'Internal server error'
    })
  })

  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  return app
} 