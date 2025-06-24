import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

export const createClockEntrySchema = z.object({
  notes: z.string().optional()
})

export const updateClockEntrySchema = z.object({
  notes: z.string().optional()
})

export const paginationSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10')
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateClockEntryInput = z.infer<typeof createClockEntrySchema>
export type UpdateClockEntryInput = z.infer<typeof updateClockEntrySchema>
export type PaginationInput = z.infer<typeof paginationSchema> 