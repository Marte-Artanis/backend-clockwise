import { hash, compare } from 'bcryptjs'
import prisma from '../../config/prisma'
import { PrismaClient } from '../../generated/prisma'

export class UserRepository {
  private prisma: PrismaClient

  constructor(customPrisma?: PrismaClient) {
    this.prisma = customPrisma || prisma
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email }
    })
  }

  async create(name: string, email: string, password: string) {
    const hashedPassword = await hash(password, 10)

    return this.prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword
      }
    })
  }

  async validatePassword(user: { passwordHash: string }, password: string) {
    return compare(password, user.passwordHash)
  }
}