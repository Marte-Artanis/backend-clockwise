import { PrismaClient } from '@prisma/client'
import { PaginationParams, DateFilter } from './types'

export class ClockRepository {
  private prisma: PrismaClient

  constructor(customPrisma?: PrismaClient) {
    this.prisma = customPrisma || new PrismaClient()
  }

  async findOpenEntry(userId: string) {
    return this.prisma.clock.findFirst({
      where: {
        userId,
        clockOut: null
      }
    })
  }

  async findTodayEntries(userId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return this.prisma.clock.findMany({
      where: {
        userId,
        clockIn: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: {
        clockIn: 'asc'
      }
    })
  }

  async findHistoryEntries(userId: string, pagination?: PaginationParams, filter?: DateFilter) {
    const { page = 1, limit = 10 } = pagination || {}
    const skip = (page - 1) * limit

    let dateFilter: { clockIn?: { gte?: Date; lte?: Date } } = {}
    if (filter?.start_date) {
      const startDate = new Date(filter.start_date)
      startDate.setHours(0, 0, 0, 0)

      dateFilter = {
        ...dateFilter,
        clockIn: {
          gte: startDate
        }
      }
    }

    if (filter?.end_date) {
      const endDate = new Date(filter.end_date)
      endDate.setHours(23, 59, 59, 999)

      dateFilter = {
        ...dateFilter,
        clockIn: {
          ...(dateFilter.clockIn ?? {}),
          lte: endDate
        }
      }
    }

    return this.prisma.clock.findMany({
      where: {
        userId,
        ...dateFilter
      },
      orderBy: {
        clockIn: 'desc'
      },
      skip,
      take: limit
    })
  }

  async clockIn(userId: string, description: string | null = null) {
    return this.prisma.clock.create({
      data: {
        userId,
        clockIn: new Date(),
        description,
        status: 'open'
      }
    })
  }

  async clockOut(entryId: string, description: string | null = null) {
    const now = new Date()
    const entry = await this.prisma.clock.findUnique({
      where: { id: entryId }
    })

    if (!entry) {
      throw new Error('Registro não encontrado')
    }

    const clockIn = new Date(entry.clockIn)
    const totalHours = (now.getTime() - clockIn.getTime()) / (1000 * 60 * 60)

    return this.prisma.clock.update({
      where: { id: entryId },
      data: {
        clockOut: now,
        description: description || entry.description,
        status: 'closed',
        totalHours: Number(totalHours.toFixed(4))
      }
    })
  }

  async findEntriesBetweenDates(userId: string, start: Date, end: Date) {
    return this.prisma.clock.findMany({
      where: {
        userId,
        clockIn: {
          gte: start,
          lt: end
        }
      },
      orderBy: {
        clockIn: 'asc'
      }
    })
  }
} 