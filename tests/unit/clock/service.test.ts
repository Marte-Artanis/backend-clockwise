import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ClockService } from '../../../src/modules/clock/service'
import { ClockRepository } from '../../../src/modules/clock/repository'
import type { ClockEntry } from '../../../src/modules/clock/types'
import { ClockAlreadyOpenError, NoOpenClockError, InvalidDateError } from '../../../src/errors/validation'

const mockRepository = {
  findOpenEntry: vi.fn(),
  findTodayEntries: vi.fn(),
  findHistoryEntries: vi.fn(),
  clockIn: vi.fn(),
  clockOut: vi.fn()
}

// Mock do Fastify
const mockFastify = {
  jwt: {
    sign: vi.fn().mockReturnValue('mock-token')
  },
  log: {
    error: vi.fn()
  }
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
    service = new ClockService(mockFastify as any)
  })

  describe('getStatus', () => {
    it('deve retornar status quando usuário está em horário de trabalho', async () => {
      const mockOpenEntry: ClockEntry = {
        id: '1',
        userId: 'user-1',
        clockIn: new Date('2025-06-23T09:00:00.000Z'),
        clockOut: null,
        description: null,
        status: 'open',
        totalHours: null,
        createdAt: new Date('2025-06-25T00:59:55.950Z'),
        updatedAt: new Date('2025-06-25T00:59:55.950Z')
      }

      mockRepository.findOpenEntry.mockResolvedValue(mockOpenEntry)
      mockRepository.findTodayEntries.mockResolvedValue([
        {
          ...mockOpenEntry,
          clockOut: new Date('2025-06-23T13:00:00.000Z')
        }
      ])

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
      expect(result.data?.current_entry).toBeNull()
      expect(result.data?.today_hours).toBe(0)
    })
  })

  describe('getHistory', () => {
    it('deve retornar histórico com total de horas', async () => {
      const mockEntries = [
        {
          id: '1',
          userId: 'user-1',
          clockIn: new Date('2025-06-23T09:00:00.000Z'),
          clockOut: new Date('2025-06-23T17:00:00.000Z'),
          description: null,
          status: 'closed',
          totalHours: 8,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      mockRepository.findHistoryEntries.mockResolvedValue(mockEntries)

      const result = await service.getHistory('user-1')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.entries).toEqual(mockEntries)
      expect(result.data?.total_hours).toBe(8)
    })

    it('deve aplicar paginação corretamente', async () => {
      const mockEntries = [
        {
          id: '1',
          userId: 'user-1',
          clockIn: new Date('2025-06-23T09:00:00.000Z'),
          clockOut: new Date('2025-06-23T17:00:00.000Z'),
          description: null,
          status: 'closed',
          totalHours: 8,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      mockRepository.findHistoryEntries.mockResolvedValue(mockEntries)

      const result = await service.getHistory('user-1', { page: 1, limit: 10 })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.entries).toEqual(mockEntries)
      expect(result.data?.total_hours).toBe(8)
    })

    it('deve filtrar por intervalo de datas', async () => {
      const mockEntries = [
        {
          id: '1',
          userId: 'user-1',
          clockIn: new Date('2025-06-23T09:00:00.000Z'),
          clockOut: new Date('2025-06-23T17:00:00.000Z'),
          description: null,
          status: 'closed',
          totalHours: 8,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      mockRepository.findHistoryEntries.mockResolvedValue(mockEntries)

      const result = await service.getHistory('user-1', undefined, {
        start_date: '2025-06-23',
        end_date: '2025-06-23'
      })

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.entries).toEqual(mockEntries)
      expect(result.data?.total_hours).toBe(8)
    })

    it('deve retornar erro para datas inválidas', async () => {
      await expect(service.getHistory('user-1', undefined, {
        start_date: 'invalid-date',
        end_date: '2025-06-23'
      })).rejects.toThrow(InvalidDateError)
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
        description: null,
        status: 'open',
        totalHours: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockRepository.clockIn.mockResolvedValue(mockEntry)

      const result = await service.clockIn('user-1', {})

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
        description: null,
        status: 'open',
        totalHours: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockRepository.findOpenEntry.mockResolvedValue(mockOpenEntry)

      await expect(service.clockIn('user-1', {})).rejects.toThrow(ClockAlreadyOpenError)
    })
  })

  describe('clockOut', () => {
    it('deve registrar saída com sucesso', async () => {
      const mockOpenEntry: ClockEntry = {
        id: '1',
        userId: 'user-1',
        clockIn: new Date('2025-06-23T09:00:00.000Z'),
        clockOut: null,
        description: null,
        status: 'open',
        totalHours: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockRepository.findOpenEntry.mockResolvedValue(mockOpenEntry)

      const mockClosedEntry: ClockEntry = {
        ...mockOpenEntry,
        clockOut: new Date('2025-06-23T17:00:00.000Z'),
        status: 'closed',
        totalHours: 8
      }

      mockRepository.clockOut.mockResolvedValue(mockClosedEntry)

      const result = await service.clockOut('user-1', {})

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data).toEqual(mockClosedEntry)
    })

    it('deve retornar erro quando não existe registro aberto', async () => {
      mockRepository.findOpenEntry.mockResolvedValue(null)

      await expect(service.clockOut('user-1', {})).rejects.toThrow(NoOpenClockError)
    })
  })

  describe('cálculo de horas', () => {
    it('deve calcular horas corretamente para um dia', async () => {
      const mockEntries = [
        {
          id: '1',
          userId: 'user-1',
          clockIn: new Date('2025-06-23T09:00:00.000Z'),
          clockOut: new Date('2025-06-23T12:00:00.000Z'),
          description: null,
          status: 'closed',
          totalHours: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          userId: 'user-1',
          clockIn: new Date('2025-06-23T13:00:00.000Z'),
          clockOut: new Date('2025-06-23T18:00:00.000Z'),
          description: null,
          status: 'closed',
          totalHours: 5,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      mockRepository.findTodayEntries.mockResolvedValue(mockEntries)
      mockRepository.findOpenEntry.mockResolvedValue(null)

      const result = await service.getStatus('user-1')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.today_hours).toBe(8)
    })

    it('deve ignorar registros sem saída no cálculo', async () => {
      const mockEntries = [
        {
          id: '1',
          userId: 'user-1',
          clockIn: new Date('2025-06-23T09:00:00.000Z'),
          clockOut: new Date('2025-06-23T12:00:00.000Z'),
          description: null,
          status: 'closed',
          totalHours: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          userId: 'user-1',
          clockIn: new Date('2025-06-23T13:00:00.000Z'),
          clockOut: null,
          description: null,
          status: 'open',
          totalHours: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      mockRepository.findTodayEntries.mockResolvedValue(mockEntries)
      mockRepository.findOpenEntry.mockResolvedValue(mockEntries[1])

      const result = await service.getStatus('user-1')

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data?.today_hours).toBe(3)
    })
  })
}) 