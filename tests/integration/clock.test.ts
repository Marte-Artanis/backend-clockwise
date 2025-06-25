import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { FastifyInstance } from 'fastify'
import { buildApp } from '../../src/app'
import prisma from '../../src/config/prisma'
import { hash } from 'bcrypt'

describe('Clock Module Integration Tests', () => {
  let app: FastifyInstance
  let authToken: string
  let userId: string

  beforeAll(async () => {
    app = await buildApp(prisma)

    // Criar usuário diretamente na tabela
    const hashedPassword = await hash('test123456', 10)
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword
      }
    })
    
    userId = user.id

    authToken = app.jwt.sign({ id: userId, email: 'test@example.com' })
  })

  afterAll(async () => {
    // Deletar todos os registros de ponto do usuário
    await prisma.clock.deleteMany({
      where: {
        userId
      }
    })

    // Deletar o usuário
    try {
      await prisma.user.delete({
        where: {
          id: userId
        }
      })
    } catch (error) {
      // Ignora erro se o usuário não existe
      if (!error.message.includes('Record to delete does not exist')) {
        throw error
      }
    }

    await app.close()
  })

  describe('POST /clock/in', () => {
    it('should create a new clock entry', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/clock/in',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {}
      })

      expect(response.statusCode).toBe(201)
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          userId,
          clockIn: expect.any(String),
          clockOut: null
        }
      })
    })

    it('should not allow multiple open entries', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/clock/in',
        headers: {
          authorization: `Bearer ${authToken}`
        },
        payload: {}
      })

      expect(response.statusCode).toBe(400)
      expect(response.json()).toMatchObject({
        success: false,
        error: 'clock/already-open'
      })
    })
  })

  describe('POST /clock/out', () => {
    it('should close an open entry', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/clock/out',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          userId,
          clockOut: expect.any(String)
        }
      })
    })

    it('should not allow closing without open entry', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/clock/out',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      })

      expect(response.statusCode).toBe(400)
      expect(response.json()).toMatchObject({
        success: false,
        error: 'clock/no-open-entry'
      })
    })
  })

  describe('GET /clock/status', () => {
    it('should return current status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/clock/status',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          is_clocked_in: expect.any(Boolean),
          today_hours: expect.any(Number)
        }
      })
    })
  })

  describe('GET /clock/history', () => {
    it('should return clock history', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/clock/history',
        headers: {
          authorization: `Bearer ${authToken}`
        }
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toMatchObject({
        success: true,
        data: {
          entries: expect.any(Array),
          total_hours: expect.any(Number)
        }
      })
    })
  })
}) 