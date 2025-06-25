// Service de usuários: lógica de autenticação 
import { FastifyInstance } from 'fastify'
import { UserRepository } from './repository'
import { LoginInput, RegisterInput, AuthResponse } from './types'
import { PrismaClient } from '@prisma/client'
import { InvalidCredentialsError, EmailInUseError } from '../../errors/validation'

interface CustomError extends Error {
  statusCode?: number
  code?: string
}

export class UserService {
  private repository: UserRepository
  private app: FastifyInstance

  constructor(app: FastifyInstance, customPrisma?: PrismaClient) {
    this.repository = new UserRepository(customPrisma)
    this.app = app
  }

  private sanitizeUserData(user: { id: string; name: string; email: string }) {
    return {
      id: user.id,
      name: user.name.trim(),
      email: user.email.toLowerCase()
    }
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    try {
      const user = await this.repository.findByEmail(input.email)
      
      if (!user) {
        throw new InvalidCredentialsError()
      }

      const isValid = await this.repository.validatePassword(user, input.password)
      
      if (!isValid) {
        throw new InvalidCredentialsError()
      }

      const sanitizedUser = this.sanitizeUserData(user)
      const token = this.app.jwt.sign(sanitizedUser)

      return {
        success: true,
        token,
        user: sanitizedUser
      }
    } catch (error) {
      this.app.log.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        input: {
          email: input.email,
          passwordLength: input.password.length
        }
      })

      if (error instanceof InvalidCredentialsError) {
        throw error
      }

      const authError: CustomError = new Error('Erro ao realizar login')
      authError.statusCode = 500
      authError.code = 'auth/unknown'
      throw authError
    }
  }

  async register(input: RegisterInput): Promise<AuthResponse> {
    try {
      const existingUser = await this.repository.findByEmail(input.email)
      
      if (existingUser) {
        throw new EmailInUseError()
      }

      const user = await this.repository.create(input.name, input.email, input.password)

      const sanitizedUser = this.sanitizeUserData(user)
      const token = this.app.jwt.sign(sanitizedUser)

      return {
        success: true,
        token,
        user: sanitizedUser
      }
    } catch (error) {
      this.app.log.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        input: {
          name: input.name,
          email: input.email,
          passwordLength: input.password.length
        }
      })

      if (error instanceof EmailInUseError) {
        throw error
      }

      const authError: CustomError = new Error('Erro ao criar usuário')
      authError.statusCode = 500
      authError.code = 'auth/unknown'
      throw authError
    }
  }
} 