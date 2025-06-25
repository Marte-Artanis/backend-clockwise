import { Clock } from '@prisma/client'

// Schema para registro de ponto
export const clockEntrySchema = {
  type: 'object',
  properties: {
    description: { 
      type: 'string',
      errorMessage: {
        type: 'Descrição deve ser uma string'
      }
    }
  },
  additionalProperties: false,
  errorMessage: {
    type: 'Corpo da requisição deve ser um objeto',
    additionalProperties: 'Campos adicionais não são permitidos'
  }
} as const

// Tipos para as entradas
export interface ClockEntryInput {
  description?: string
}

// Tipo para um registro de ponto
export interface ClockEntry {
  id: string
  userId: string
  clockIn: Date
  clockOut: Date | null
  description: string | null
  status: string
  totalHours: number | null
  createdAt: Date
  updatedAt: Date
}

// Tipo para resposta de status
export interface ClockStatusResponse {
  success: boolean
  data: {
    is_clocked_in: boolean
    today_hours: number
    current_entry?: ClockEntry | null
  }
}

// Tipo para resposta de histórico
export interface ClockHistoryResponse {
  success: boolean
  data: {
    entries: ClockEntry[]
    total_hours: number
  }
  error?: string
}

// Tipo para resposta de ação (clock-in/out)
export type ClockActionResponse = {
  success: boolean
  data?: Clock
  error?: string
  message?: string
}

// Tipo para paginação
export interface PaginationParams {
  page?: number
  limit?: number
}

// Tipo para filtro de datas
export interface DateFilter {
  start_date?: string
  end_date?: string
} 