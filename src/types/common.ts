export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface User {
  id: string
  name: string
  email: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface ClockEntry {
  id: string
  user_id: string
  clock_in: string
  clock_out?: string
  total_hours?: string
  status: 'open' | 'closed'
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface CreateClockEntryRequest {
  notes?: string
}

export interface UpdateClockEntryRequest {
  notes?: string
} 