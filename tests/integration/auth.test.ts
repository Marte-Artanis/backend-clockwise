import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { FastifyInstance } from 'fastify'
import { buildApp } from '../../src/app'
import prisma from '../../src/config/prisma'

const timestamp = Date.now()
const secondaryEmail = `test_${timestamp}+1@example.com`
const nonExistentEmail = `test_${timestamp}+2@example.com`

describe('Auth Module Integration Tests', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp(prisma)

    // Garante que não exista usuário prévio com o mesmo email
    await prisma.user.deleteMany({ where: { email: { contains: `${timestamp}` } } })
  })

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test'
        }
      }
    })

    await app.close()
  })

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          name: 'Test User',
          email: secondaryEmail,
          password: 'test123456'
        }
      })

      expect(response.statusCode).toBe(201)
      expect(response.json()).toMatchObject({
        success: true,
        token: expect.any(String),
        user: {
          name: 'Test User',
          email: secondaryEmail
        }
      })
    })

    it('should not allow duplicate email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          name: 'Another User',
          email: secondaryEmail,
          password: 'test123456'
        }
      })

      expect(response.statusCode).toBe(400)
      expect(response.json()).toMatchObject({
        success: false,
        error: 'auth/email-in-use'
      })
    })

    it('should validate name length', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          name: 'Te',
          email: secondaryEmail,
          password: 'test123456'
        }
      })

      expect(response.statusCode).toBe(400)
      expect(response.json()).toMatchObject({
        success: false,
        error: expect.stringContaining('validation')
      })
    })

    it('should validate email format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          name: 'Test User',
          email: 'invalid-email',
          password: 'test123456'
        }
      })

      expect(response.statusCode).toBe(400)
      expect(response.json()).toMatchObject({
        success: false,
        error: expect.stringContaining('validation')
      })
    })

    it('should validate password length', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          name: 'Test User',
          email: secondaryEmail,
          password: '123'
        }
      })

      expect(response.statusCode).toBe(400)
      expect(response.json()).toMatchObject({
        success: false,
        error: expect.stringContaining('validation')
      })
    })
  })

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: secondaryEmail,
          password: 'test123456'
        }
      })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toMatchObject({
        success: true,
        token: expect.any(String),
        user: {
          name: 'Test User',
          email: secondaryEmail
        }
      })
    })

    it('should not login with invalid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: nonExistentEmail,
          password: 'test123456'
        }
      })

      expect(response.statusCode).toBe(401)
      expect(response.json()).toMatchObject({
        success: false,
        error: 'auth/invalid-credentials'
      })
    })

    it('should not login with invalid password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: secondaryEmail,
          password: 'wrong123456'
        }
      })

      expect(response.statusCode).toBe(401)
      expect(response.json()).toMatchObject({
        success: false,
        error: 'auth/invalid-credentials'
      })
    })
  })
}) 