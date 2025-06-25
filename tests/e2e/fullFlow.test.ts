import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { FastifyInstance } from 'fastify'
import { buildApp } from '../../src/app'
import prisma from '../../src/config/prisma'

// Gera e-mails únicos para evitar colisão entre execuções
const timestamp = Date.now()
const email = `e2e_${timestamp}@example.com`
const password = 'e2e123456'

let app: FastifyInstance
let authToken: string
let userId: string

beforeAll(async () => {
  app = await buildApp(prisma)

  // Garante ambiente limpo
  await prisma.user.deleteMany({ where: { email } })
})

afterAll(async () => {
  // Limpa registros criados pelo fluxo
  if (userId) {
    await prisma.clock.deleteMany({ where: { userId } })
    await prisma.user.deleteMany({ where: { id: userId } })
  }
  await app.close()
})

describe('E2E - Register → Login → Clock In/Out', () => {
  it('should register, login and perform clock in/out successfully', async () => {
    // 1. Register
    const registerResponse = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        name: 'E2E User',
        email,
        password
      }
    })

    expect(registerResponse.statusCode).toBe(201)
    const registerBody = registerResponse.json() as any
    expect(registerBody.success).toBe(true)
    authToken = registerBody.token
    userId = registerBody.user.id

    // 2. Login
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email, password }
    })

    expect(loginResponse.statusCode).toBe(200)
    const loginBody = loginResponse.json() as any
    expect(loginBody.success).toBe(true)
    // Usa token mais recente
    authToken = loginBody.token

    // 3. Clock In
    const clockInResponse = await app.inject({
      method: 'POST',
      url: '/clock/in',
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {}
    })

    expect(clockInResponse.statusCode).toBe(201)
    const clockInBody = clockInResponse.json() as any
    expect(clockInBody.success).toBe(true)
    expect(clockInBody.data.userId).toBe(userId)

    // 4. Clock Out
    const clockOutResponse = await app.inject({
      method: 'POST',
      url: '/clock/out',
      headers: {
        authorization: `Bearer ${authToken}`
      },
      payload: {}
    })

    expect(clockOutResponse.statusCode).toBe(200)
    const clockOutBody = clockOutResponse.json() as any
    expect(clockOutBody.success).toBe(true)
    expect(clockOutBody.data.userId).toBe(userId)
  })
}) 