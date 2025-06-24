// Controller de usuários: login e registro 
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { UserService } from './service'
import { LoginInput, RegisterInput } from './types'

export async function userRoutes(app: FastifyInstance) {
  const service = new UserService(app, app.prisma)

  app.post<{ Body: LoginInput }>('/auth/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) => {
    const result = await service.login(request.body)
    
    if (!result.success) {
      return reply.status(401).send(result)
    }

    return reply.send(result)
  })

  app.post<{ Body: RegisterInput }>('/auth/register', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 3 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: RegisterInput }>, reply: FastifyReply) => {
    const result = await service.register(request.body)
    
    if (!result.success) {
      return reply.status(400).send(result)
    }

    return reply.status(201).send(result)
  })
} 