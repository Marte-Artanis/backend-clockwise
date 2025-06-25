import type { User } from '@prisma/client'

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export type PublicUser = Pick<User, 'id' | 'name' | 'email' | 'createdAt' | 'updatedAt'>

// Tipo para resposta de autenticação
export type AuthResponse = {
  success: boolean
  token?: string
  user?: PublicUser
  error?: string
  message?: string
} 