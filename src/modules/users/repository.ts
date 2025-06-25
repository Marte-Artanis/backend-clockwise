import { hash, compare } from 'bcrypt'
import prisma from '../../config/prisma'
import { PrismaClient } from '@prisma/client'

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
        password: hashedPassword
      }
    })
  }

  async validatePassword(user: { password: string }, password: string) {
    return compare(password, user.password)
  }
}