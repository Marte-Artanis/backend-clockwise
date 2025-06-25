import { ClockRepository } from './repository'
import { ClockEntryInput, ClockStatusResponse, ClockHistoryResponse, ClockActionResponse, PaginationParams, DateFilter } from './types'
import { PrismaClient } from '@prisma/client'
import { ClockAlreadyOpenError, NoOpenClockError, InvalidDateError } from '../../errors/validation'
import { FastifyInstance } from 'fastify'

interface CustomError extends Error {
  statusCode?: number
  code?: string
}

export class ClockService {
  private repository: ClockRepository
  private app: FastifyInstance

  constructor(app: FastifyInstance, customPrisma?: PrismaClient) {
    this.repository = new ClockRepository(customPrisma)
    this.app = app
  }

  async getStatus(userId: string): Promise<ClockStatusResponse> {
    try {
      const openEntry = await this.repository.findOpenEntry(userId)
      const todayEntries = await this.repository.findTodayEntries(userId)

      const totalHours = todayEntries.reduce((acc, entry) => {
        if (!entry.clockOut) return acc
        const clockIn = new Date(entry.clockIn)
        const clockOut = new Date(entry.clockOut)
        const hours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
        return acc + hours
      }, 0)

      return {
        success: true,
        data: {
          is_clocked_in: !!openEntry,
          today_hours: totalHours,
          current_entry: openEntry
        }
      }
    } catch (error) {
      this.app.log.error(error)
      throw error
    }
  }

  async getHistory(userId: string, pagination?: PaginationParams, filter?: DateFilter): Promise<ClockHistoryResponse> {
    try {
      // Validar datas
      if (filter?.start_date && isNaN(Date.parse(filter.start_date))) {
        throw new InvalidDateError('Data inicial inválida')
      }

      if (filter?.end_date && isNaN(Date.parse(filter.end_date))) {
        throw new InvalidDateError('Data final inválida')
      }

      const entries = await this.repository.findHistoryEntries(userId, pagination, filter)

      const totalHours = entries.reduce((acc, entry) => {
        if (!entry.clockOut) return acc
        const clockIn = new Date(entry.clockIn)
        const clockOut = new Date(entry.clockOut)
        const hours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
        return acc + hours
      }, 0)

      return {
        success: true,
        data: {
          entries,
          total_hours: totalHours
        }
      }
    } catch (error) {
      this.app.log.error(error)
      throw error
    }
  }

  async clockIn(userId: string, input: ClockEntryInput): Promise<ClockActionResponse> {
    try {
      const openEntry = await this.repository.findOpenEntry(userId)

      if (openEntry) {
        throw new ClockAlreadyOpenError()
      }

      const entry = await this.repository.clockIn(userId, input.description)

      return {
        success: true,
        data: entry
      }
    } catch (error) {
      this.app.log.error(error)
      throw error
    }
  }

  async clockOut(userId: string, input: ClockEntryInput = {}): Promise<ClockActionResponse> {
    try {
      const openEntry = await this.repository.findOpenEntry(userId)

      if (!openEntry) {
        throw new NoOpenClockError()
      }

      const entry = await this.repository.clockOut(openEntry.id, input.description)

      return {
        success: true,
        data: entry
      }
    } catch (error) {
      this.app.log.error(error)
      throw error
    }
  }

  async getTodayStats(userId: string): Promise<{ success: boolean; data: { totalHours: number } }> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const entries = await this.repository.findEntriesBetweenDates(userId, today, tomorrow)

    const totalHours = entries.reduce((acc, entry) => {
      if (!entry.clockOut) return acc
      const clockIn = new Date(entry.clockIn)
      const clockOut = new Date(entry.clockOut)
      const hours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
      return acc + hours
    }, 0)

    return {
      success: true,
      data: {
        totalHours: Number(totalHours.toFixed(4))
      }
    }
  }

  async getWeekStats(userId: string): Promise<{ success: boolean; data: { totalHours: number } }> {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 domingo
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - dayOfWeek)
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 7)

    const entries = await this.repository.findEntriesBetweenDates(userId, startOfWeek, endOfWeek)

    const totalHours = entries.reduce((acc, entry) => {
      if (!entry.clockOut) return acc
      const clockIn = new Date(entry.clockIn)
      const clockOut = new Date(entry.clockOut)
      const hours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
      return acc + hours
    }, 0)

    return {
      success: true,
      data: {
        totalHours: Number(totalHours.toFixed(4))
      }
    }
  }

  async getMonthStats(userId: string): Promise<{ success: boolean; data: { totalHours: number } }> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const entries = await this.repository.findEntriesBetweenDates(userId, startOfMonth, endOfMonth)

    const totalHours = entries.reduce((acc, entry) => {
      if (!entry.clockOut) return acc
      const clockIn = new Date(entry.clockIn)
      const clockOut = new Date(entry.clockOut)
      const hours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)
      return acc + hours
    }, 0)

    return {
      success: true,
      data: {
        totalHours: Number(totalHours.toFixed(4))
      }
    }
  }
} 