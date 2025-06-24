import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserService } from '../../../src/modules/users/service'
import { UserRepository } from '../../../src/modules/users/repository'

// Mock do Fastify
const mockFastify = {
  jwt: {
    sign: vi.fn().mockReturnValue('mock-token')
  }
}

// Mock do repositório
const mockRepository = {
  findByEmail: vi.fn(),
  validatePassword: vi.fn(),
  create: vi.fn()
}

vi.mock('../../../src/modules/users/repository', () => {
  return {
    UserRepository: vi.fn().mockImplementation(() => mockRepository)
  }
})

describe('UserService', () => {
  let service: UserService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new UserService(mockFastify as any)
  })

  describe('login', () => {
    it('deve retornar sucesso com token quando credenciais são válidas', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password'
      }

      mockRepository.findByEmail.mockResolvedValue(mockUser)
      mockRepository.validatePassword.mockResolvedValue(true)

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.success).toBe(true)
      expect(result.token).toBe('mock-token')
      expect(result.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email
      })
    })

    it('deve retornar erro quando email não existe', async () => {
      mockRepository.findByEmail.mockResolvedValue(null)

      const result = await service.login({
        email: 'nonexistent@example.com',
        password: 'password123'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('auth/invalid-credentials')
    })

    it('deve retornar erro quando senha é inválida', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password'
      }

      mockRepository.findByEmail.mockResolvedValue(mockUser)
      mockRepository.validatePassword.mockResolvedValue(false)

      const result = await service.login({
        email: 'test@example.com',
        password: 'wrong_password'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('auth/invalid-credentials')
    })
  })

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      mockRepository.findByEmail.mockResolvedValue(null)
      
      const mockUser = {
        id: '1',
        name: 'New User',
        email: 'new@example.com',
        password: 'hashed_password'
      }

      mockRepository.create.mockResolvedValue(mockUser)

      const result = await service.register({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123'
      })

      expect(result.success).toBe(true)
      expect(result.token).toBe('mock-token')
      expect(result.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email
      })
    })

    it('deve retornar erro quando email já está em uso', async () => {
      const existingUser = {
        id: '1',
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'hashed_password'
      }

      mockRepository.findByEmail.mockResolvedValue(existingUser)

      const result = await service.register({
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('auth/email-in-use')
    })
  })
}) 