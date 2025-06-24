import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { ClockService } from './service'
import { clockEntrySchema, ClockEntryInput } from './types'
import { authenticate, getUserFromToken } from '../../middlewares/auth'

export async function clockRoutes(app: FastifyInstance) {
  const service = new ClockService(app.prisma)

  // Aplica autenticação em todas as rotas
  app.addHook('onRequest', authenticate)

  app.get('/clock/status', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = getUserFromToken(request)
    const result = await service.getStatus(userId)
    
    if (!result.success) {
      return reply.status(400).send(result)
    }

    return reply.send(result)
  })

  app.get('/clock/history', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = getUserFromToken(request)
    const result = await service.getHistory(userId)
    
    if (!result.success) {
      return reply.status(400).send(result)
    }

    return reply.send(result)
  })

  app.post<{ Body: ClockEntryInput }>('/clock/in', async (request: FastifyRequest<{ Body: ClockEntryInput }>, reply: FastifyReply) => {
    const { id: userId } = getUserFromToken(request)
    const result = await service.clockIn(userId, request.body)
    
    if (!result.success) {
      return reply.status(400).send(result)
    }

    return reply.status(201).send(result)
  })

  app.post('/clock/out', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = getUserFromToken(request)
    const result = await service.clockOut(userId)
    
    if (!result.success) {
      return reply.status(400).send(result)
    }

    return reply.send(result)
  })
} 