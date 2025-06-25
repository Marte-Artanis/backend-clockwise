export interface Clock {
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