import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClockService } from '../../../src/modules/clock/service'
import { ClockRepository } from '../../../src/modules/clock/repository'
import type { ClockEntry } from '../../../src/modules/clock/types'

const mockRepository = {
  findOpenEntry: vi.fn(),
  findTodayEntries: vi.fn(),
  findHistoryEntries: vi.fn(),
  clockIn: vi.fn(),
  clockOut: vi.fn()
}

vi.mock('../../../src/modules/clock/repository', () => {
  return {
    ClockRepository: vi.fn().mockImplementation(() => mockRepository)
  }
})

describe('ClockService', () => {
  let service: ClockService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new ClockService()
  })

  describe('getStatus', () => {
    it('deve retornar status quando usuário está em horário de trabalho', async () => {
      const mockOpenEntry: ClockEntry = {
        id: '1',
        userId: 'user-1',
        clockIn: new Date(),
        clockOut: null,
        totalHours: null,
        status: 'open',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockTodayEntries: ClockEntry[] = [
        {
          id: '2',
          userId: 'user-1',
          clockIn: new Date(),
          clockOut: new Date(),
          totalHours: 4,
          status: 'closed',
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      mockRepository.findOpenEntry.mockResolvedValue(mockOpenEntry)
      mockRepository.findTodayEntries.mockResolvedValue(mockTodayEntries)

      const result = await service.getStatus('user-1')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.is_clocked_in).toBe(true)
      expect(result.data?.current_entry).toEqual(mockOpenEntry)
      expect(result.data?.today_hours).toBe(4)
    })

    it('deve retornar status quando usuário não está em horário de trabalho', async () => {
      mockRepository.findOpenEntry.mockResolvedValue(null)
      mockRepository.findTodayEntries.mockResolvedValue([])

      const result = await service.getStatus('user-1')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.is_clocked_in).toBe(false)
      expect(result.data?.current_entry).toBeUndefined()
      expect(result.data?.today_hours).toBe(0)
    })
  })

  describe('getHistory', () => {
    it('deve retornar histórico com total de horas', async () => {
      const mockEntries: ClockEntry[] = [
        {
          id: '1',
          userId: 'user-1',
          clockIn: new Date(),
          clockOut: new Date(),
          totalHours: 4,
          status: 'closed',
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          userId: 'user-1',
          clockIn: new Date(),
          clockOut: new Date(),
          totalHours: 3.5,
          status: 'closed',
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      mockRepository.findHistoryEntries.mockResolvedValue(mockEntries)

      const result = await service.getHistory('user-1')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.entries).toEqual(mockEntries)
      expect(result.data?.total_hours).toBe(7.5)
    })
  })

  describe('clockIn', () => {
    it('deve registrar entrada com sucesso', async () => {
      mockRepository.findOpenEntry.mockResolvedValue(null)

      const mockEntry: ClockEntry = {
        id: '1',
        userId: 'user-1',
        clockIn: new Date('2025-06-23T23:09:39.137Z'),
        clockOut: null,
        totalHours: null,
        status: 'open',
        notes: 'Test note',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockRepository.clockIn.mockResolvedValue(mockEntry)

      const result = await service.clockIn('user-1', { notes: 'Test note' })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data).toEqual(mockEntry)
    })

    it('deve retornar erro quando já existe registro aberto', async () => {
      const mockOpenEntry: ClockEntry = {
        id: '1',
        userId: 'user-1',
        clockIn: new Date(),
        clockOut: null,
        totalHours: null,
        status: 'open',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockRepository.findOpenEntry.mockResolvedValue(mockOpenEntry)

      const result = await service.clockIn('user-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('clock/already-open')
    })
  })

  describe('clockOut', () => {
    it('deve registrar saída com sucesso', async () => {
      const mockOpenEntry: ClockEntry = {
        id: '1',
        userId: 'user-1',
        clockIn: new Date(),
        clockOut: null,
        totalHours: null,
        status: 'open',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const mockClosedEntry: ClockEntry = {
        ...mockOpenEntry,
        clockOut: new Date(),
        totalHours: 4,
        status: 'closed'
      }

      mockRepository.findOpenEntry.mockResolvedValue(mockOpenEntry)
      mockRepository.clockOut.mockResolvedValue(mockClosedEntry)

      const result = await service.clockOut('user-1')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data).toEqual(mockClosedEntry)
    })

    it('deve retornar erro quando não existe registro aberto', async () => {
      mockRepository.findOpenEntry.mockResolvedValue(null)

      const result = await service.clockOut('user-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('clock/no-open-entry')
    })
  })
}) 