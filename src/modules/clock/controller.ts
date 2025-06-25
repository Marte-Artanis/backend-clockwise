import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { ClockService } from './service'
import { clockEntrySchema, ClockEntryInput } from './types'
import { authenticate, getUserFromToken } from '../../middlewares/auth'
import { CustomError, errorResponseSchema, successResponseSchema } from '../../types/common'

export async function clockRoutes(app: FastifyInstance) {
  if (!app.prisma) {
    throw new Error('Prisma client not found in app instance')
  }
  const service = new ClockService(app, app.prisma)

  // Adiciona o middleware de autenticação em todas as rotas
  app.addHook('preHandler', authenticate)

  app.get('/clock/status', {
    schema: {
      response: {
        200: successResponseSchema,
        400: errorResponseSchema
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id: userId } = getUserFromToken(request)
      const result = await service.getStatus(userId)
      return reply.send(result)
    } catch (error) {
      app.log.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  })

  app.get('/clock/history', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1 },
          limit: { type: 'integer', minimum: 1 },
          start_date: { type: 'string' },
          end_date: { type: 'string' }
        },
        additionalProperties: false
      },
      response: {
        200: successResponseSchema,
        400: errorResponseSchema
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id: userId } = getUserFromToken(request)
      const { page, limit, start_date, end_date } = request.query as any
      const pagination = page || limit ? { page: Number(page) || 1, limit: Number(limit) || 10 } : undefined
      const filter = (start_date || end_date) ? { start_date, end_date } : undefined
      const result = await service.getHistory(userId, pagination, filter)
      return reply.send(result)
    } catch (error) {
      app.log.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  })

  app.post<{ Body: ClockEntryInput }>('/clock/in', {
    schema: {
      response: {
        201: successResponseSchema,
        400: errorResponseSchema
      },
      body: {
        type: 'object',
        properties: {
          description: { 
            type: 'string',
            errorMessage: {
              type: 'Descrição deve ser uma string'
            }
          }
        },
        additionalProperties: false,
        errorMessage: {
          type: 'Corpo da requisição deve ser um objeto',
          additionalProperties: 'Campos adicionais não são permitidos'
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: ClockEntryInput }>, reply: FastifyReply) => {
    try {
      const { id: userId } = getUserFromToken(request)
      const result = await service.clockIn(userId, request.body)
      return reply.status(201).send(result)
    } catch (error) {
      app.log.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        input: request.body
      })
      throw error
    }
  })

  app.post('/clock/out', {
    schema: {
      response: {
        200: successResponseSchema,
        400: errorResponseSchema
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id: userId } = getUserFromToken(request)
      const result = await service.clockOut(userId)
      return reply.status(200).send(result)
    } catch (error) {
      app.log.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    }
  })

  // Estatísticas de horas
  app.get('/clock/today', {
    schema: {
      response: {
        200: successResponseSchema,
        400: errorResponseSchema
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id: userId } = getUserFromToken(request)
      const result = await service.getTodayStats(userId)
      return reply.send(result)
    } catch (error) {
      app.log.error(error)
      throw error
    }
  })

  app.get('/clock/week', {
    schema: {
      response: {
        200: successResponseSchema,
        400: errorResponseSchema
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id: userId } = getUserFromToken(request)
      const result = await service.getWeekStats(userId)
      return reply.send(result)
    } catch (error) {
      app.log.error(error)
      throw error
    }
  })

  app.get('/clock/month', {
    schema: {
      response: {
        200: successResponseSchema,
        400: errorResponseSchema
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { id: userId } = getUserFromToken(request)
      const result = await service.getMonthStats(userId)
      return reply.send(result)
    } catch (error) {
      app.log.error(error)
      throw error
    }
  })
} 