import { Type } from '@sinclair/typebox'
import type { User } from '../../generated/prisma'

export const loginSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 })
})

export const registerSchema = Type.Object({
  name: Type.String({ minLength: 3 }),
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 })
})

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  name: string
  email: string
  password: string
}

export type PublicUser = Pick<User, 'id' | 'name' | 'email'>

// Tipo para resposta de autenticação
export type AuthResponse = {
  success: boolean
  token?: string
  user?: PublicUser
  error?: string
  message?: string
}

// Tipos específicos do usuário 