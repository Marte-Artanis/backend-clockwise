import fastify, { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { env } from './config/env'
import { clockRoutes } from './modules/clock/controller'
import { userRoutes } from './modules/users/controller'
import { PrismaClient } from '@prisma/client'
import ajvErrors from 'ajv-errors'
import { ValidationError } from './errors/validation'

interface CustomError extends Error {
  statusCode?: number
  code?: string
  validation?: Array<{
    keyword: string
    instancePath?: string
    schemaPath?: string
    params?: Record<string, unknown>
    message?: string
  }>
}

export async function buildApp(customPrisma?: PrismaClient) {
  const app = fastify({
    logger: env.NODE_ENV === 'development',
    ajv: {
      customOptions: {
        allErrors: true,
        removeAdditional: true,
        useDefaults: true,
        coerceTypes: true,
        strictSchema: false,
        messages: true,
        verbose: true,
        passContext: true
      },
      plugins: [[ajvErrors, { singleError: true }]]
    }
  })

  // Configure error handler
  app.setErrorHandler((error: FastifyError & CustomError, request: FastifyRequest, reply: FastifyReply) => {
    app.log.error({
      error: error.message,
      stack: error.stack,
      validation: error.validation,
      code: error.code,
      statusCode: error.statusCode,
      url: request.url,
      method: request.method
    })

    // Handle custom validation errors
    if (error instanceof ValidationError) {
      const errorField = error.code.split('/')[1] || 'error'
      return reply.code(error.statusCode).send({
        success: false,
        error: error.code,
        message: error.message,
        errors: {
          [errorField]: [error.message]
        }
      })
    }

    // Handle validation errors from schema validation
    if (error.validation && error.validation.length > 0) {
      const validationError = error.validation[0]
      let errorCode = 'validation/error'
      let errorMessage = validationError?.message || 'Validation error'
      const statusCode = 400

      // Map validation errors to specific error codes
      if (validationError?.keyword === 'format' && validationError?.params && validationError.params['format'] === 'email') {
        errorCode = 'validation/invalid-email'
        errorMessage = 'Email inválido'
      } else if (validationError?.keyword === 'minLength') {
        const path = validationError.instancePath || ''
        if (path.includes('password')) {
          errorCode = 'validation/weak-password'
          errorMessage = 'Senha deve ter pelo menos 6 caracteres'
        } else if (path.includes('name')) {
          errorCode = 'validation/invalid-name'
          errorMessage = 'Nome deve ter pelo menos 3 caracteres'
        }
      } else if (validationError?.keyword === 'maxLength' && validationError.instancePath?.includes('name')) {
        errorCode = 'validation/invalid-name'
        errorMessage = 'Nome deve ter no máximo 100 caracteres'
      } else if (validationError?.keyword === 'required' && validationError.params && validationError.params['missingProperty']) {
        const missingField = validationError.params['missingProperty']
        if (missingField === 'name') {
          errorCode = 'validation/invalid-name'
          errorMessage = 'Nome é obrigatório'
        } else if (missingField === 'email') {
          errorCode = 'validation/invalid-email'
          errorMessage = 'Email é obrigatório'
        } else if (missingField === 'password') {
          errorCode = 'validation/weak-password'
          errorMessage = 'Senha é obrigatória'
        }
      }

      const fieldName = validationError?.instancePath?.replace('/', '') || 
                       (validationError?.params && validationError.params['missingProperty']) || 
                       'error'

      return reply.code(statusCode).send({
        success: false,
        error: errorCode,
        message: errorMessage,
        errors: {
          [fieldName]: [errorMessage]
        }
      })
    }

    // Handle custom errors with statusCode and code
    if (error.statusCode && error.code) {
      const errorField = error.code.split('/')[1] || 'error'
      return reply.code(error.statusCode).send({
        success: false,
        error: error.code,
        message: error.message,
        errors: {
          [errorField]: [error.message]
        }
      })
    }

    // Handle all other errors
    return reply.code(500).send({
      success: false,
      error: 'internal/error',
      message: 'Internal server error',
      errors: {
        error: ['Internal server error']
      }
    })
  })

  await app.register(cors, {
    origin: true,
    credentials: true
  })

  await app.register(jwt, {
    secret: env.JWT_SECRET,
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
  if (!customPrisma) {
    throw new Error('Prisma client is required')
  }
  app.decorate('prisma', customPrisma)

  // Registra as rotas
  await app.register(userRoutes)
  await app.register(clockRoutes)

  app.get('/health', async () => {
    return { status: 'ok' }
  })

  return app
} 