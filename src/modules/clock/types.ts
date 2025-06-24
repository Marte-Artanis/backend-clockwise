import { Type } from '@sinclair/typebox'
import type { ClockEntry as PrismaClockEntry } from '../../generated/prisma'

// Schema para registro de ponto
export const clockEntrySchema = Type.Object({
  notes: Type.Optional(Type.String())
})

// Tipos para as entradas
export type ClockEntryInput = {
  notes?: string
}

// Tipo para um registro de ponto
export type ClockEntry = PrismaClockEntry

// Tipo para resposta de status
export type ClockStatusResponse = {
  success: boolean
  data?: {
    current_entry?: PrismaClockEntry
    is_clocked_in: boolean
    today_hours: number
  }
  error?: string
  message?: string
}

// Tipo para resposta de histórico
export type ClockHistoryResponse = {
  success: boolean
  data?: {
    entries: PrismaClockEntry[]
    total_hours: number
  }
  error?: string
  message?: string
}

// Tipo para resposta de ação (clock-in/out)
export type ClockActionResponse = {
  success: boolean
  data?: PrismaClockEntry
  error?: string
  message?: string
} 