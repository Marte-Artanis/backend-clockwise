import { FastifyRequest, FastifyReply } from 'fastify'

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Missing token'
      })
    }

    if (!authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid token format'
      })
    }

    await request.jwtVerify()
  } catch (err) {
    return reply.status(401).send({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid token'
    })
  }
}

export function getUserFromToken(request: FastifyRequest) {
  return request.user as { id: string; email: string }
} 