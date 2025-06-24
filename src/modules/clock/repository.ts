import prisma from '../../config/prisma'
import { ClockEntry } from './types'
import { PrismaClient } from '../../generated/prisma'

export class ClockRepository {
  private prisma: PrismaClient

  constructor(customPrisma?: PrismaClient) {
    this.prisma = customPrisma || prisma
  }

  async findOpenEntry(userId: string): Promise<ClockEntry | null> {
    return this.prisma.clockEntry.findFirst({
      where: {
        userId,
        status: 'open'
      }
    })
  }

  async findTodayEntries(userId: string): Promise<ClockEntry[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return this.prisma.clockEntry.findMany({
      where: {
        userId,
        clockIn: {
          gte: today
        }
      },
      orderBy: {
        clockIn: 'desc'
      }
    })
  }

  async findHistoryEntries(userId: string, limit = 7): Promise<ClockEntry[]> {
    return this.prisma.clockEntry.findMany({
      where: {
        userId
      },
      orderBy: {
        clockIn: 'desc'
      },
      take: limit
    })
  }

  async clockIn(userId: string, notes?: string): Promise<ClockEntry> {
    return this.prisma.clockEntry.create({
      data: {
        userId,
        clockIn: new Date(),
        notes: notes ?? null,
        status: 'open'
      }
    })
  }

  async clockOut(entryId: string): Promise<ClockEntry> {
    const clockOut = new Date()
    
    // Primeiro busca o registro
    const currentEntry = await this.prisma.clockEntry.findUnique({
      where: { id: entryId }
    })

    if (!currentEntry) {
      throw new Error('Registro não encontrado')
    }

    // Depois atualiza
    return this.prisma.clockEntry.update({
      where: { id: entryId },
      data: {
        clockOut,
        status: 'closed',
        totalHours: this.calculateHours(currentEntry.clockIn, clockOut)
      }
    })
  }

  private calculateHours(clockIn: Date, clockOut: Date): number {
    const diffMs = clockOut.getTime() - clockIn.getTime()
    return Number((diffMs / (1000 * 60 * 60)).toFixed(2))
  }
} 