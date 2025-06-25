// Controller de usuários: login e registro 
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { UserService } from './service'
import { LoginInput, RegisterInput } from './types'
import { errorResponseSchema } from '../../types/common'

const userResponseSchema = {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
} as const

export async function userRoutes(app: FastifyInstance) {
  const service = new UserService(app, app.prisma)

  app.post<{ Body: RegisterInput }>('/auth/register', {
    schema: {
      response: {
        201: userResponseSchema,
        400: errorResponseSchema
      },
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { 
            type: 'string', 
            minLength: 3, 
            maxLength: 100,
            errorMessage: {
              type: 'Nome deve ser uma string',
              minLength: 'Nome deve ter pelo menos 3 caracteres',
              maxLength: 'Nome deve ter no máximo 100 caracteres'
            }
          },
          email: { 
            type: 'string', 
            format: 'email',
            errorMessage: {
              type: 'Email deve ser uma string',
              format: 'Email inválido'
            }
          },
          password: { 
            type: 'string', 
            minLength: 6,
            errorMessage: {
              type: 'Senha deve ser uma string',
              minLength: 'Senha deve ter pelo menos 6 caracteres'
            }
          }
        },
        additionalProperties: false,
        errorMessage: {
          type: 'Corpo da requisição deve ser um objeto',
          required: {
            name: 'Nome é obrigatório',
            email: 'Email é obrigatório',
            password: 'Senha é obrigatória'
          },
          additionalProperties: 'Campos adicionais não são permitidos'
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: RegisterInput }>, reply: FastifyReply) => {
    try {
      const result = await service.register(request.body)
      return reply.code(201).send(result)
    } catch (error) {
      app.log.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        input: request.body
      })
      throw error
    }
  })

  app.post<{ Body: LoginInput }>('/auth/login', {
    schema: {
      response: {
        200: userResponseSchema,
        401: errorResponseSchema
      },
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { 
            type: 'string', 
            format: 'email',
            errorMessage: {
              type: 'Email deve ser uma string',
              format: 'Email inválido'
            }
          },
          password: { 
            type: 'string', 
            errorMessage: {
              type: 'Senha deve ser uma string'
            }
          }
        },
        additionalProperties: false,
        errorMessage: {
          type: 'Corpo da requisição deve ser um objeto',
          required: {
            email: 'Email é obrigatório',
            password: 'Senha é obrigatória'
          },
          additionalProperties: 'Campos adicionais não são permitidos'
        }
      }
    }
  }, async (request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) => {
    try {
      const result = await service.login(request.body)
      return reply.send(result)
    } catch (error) {
      app.log.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        input: request.body
      })
      throw error
    }
  })
} 