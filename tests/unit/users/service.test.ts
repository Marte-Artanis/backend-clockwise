import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserService } from '../../../src/modules/users/service'
import type { FastifyInstance } from 'fastify'
import { InvalidCredentialsError, EmailInUseError } from '../../../src/errors/validation'

// Mock do Fastify
const mockFastify = {
  jwt: {
    sign: vi.fn().mockReturnValue('mock-token')
  },
  log: {
    error: vi.fn()
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
    service = new UserService(mockFastify as unknown as FastifyInstance)
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

      await expect(service.login({
        email: 'nonexistent@example.com',
        password: 'password123'
      })).rejects.toThrow(InvalidCredentialsError)
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

      await expect(service.login({
        email: 'test@example.com',
        password: 'wrong_password'
      })).rejects.toThrow(InvalidCredentialsError)
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

      await expect(service.register({
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123'
      })).rejects.toThrow(EmailInUseError)
    })
  })

  describe('token generation', () => {
    it('deve gerar token com payload correto', async () => {
      const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password'
      }

      mockRepository.findByEmail.mockResolvedValue(mockUser)
      mockRepository.validatePassword.mockResolvedValue(true)

      await service.login({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(mockFastify.jwt.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email
      })
    })

    it('deve gerar token com dados sanitizados', async () => {
      const mockUser = {
        id: '1',
        name: '  Test User  ',
        email: 'TEST@example.com',
        password: 'hashed_password'
      }

      mockRepository.findByEmail.mockResolvedValue(mockUser)
      mockRepository.validatePassword.mockResolvedValue(true)

      await service.login({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(mockFastify.jwt.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        name: mockUser.name.trim(),
        email: mockUser.email.toLowerCase()
      })
    })
  })
}) 