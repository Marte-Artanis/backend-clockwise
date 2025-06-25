import { z } from 'zod'

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

export type CreateClockEntryInput = z.infer<typeof createClockEntrySchema>
export type UpdateClockEntryInput = z.infer<typeof updateClockEntrySchema>
export type PaginationInput = z.infer<typeof paginationSchema> 