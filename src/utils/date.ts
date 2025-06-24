export function getCurrentDateTime(): string {
  return new Date().toISOString()
}

export function getTodayStart(): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today.toISOString()
}

export function getTodayEnd(): string {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return today.toISOString()
}

export function calculateHoursWorked(clockIn: string, clockOut: string): string {
  const start = new Date(clockIn)
  const end = new Date(clockOut)
  const diffMs = end.getTime() - start.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  
  const hours = Math.floor(diffHours)
  const minutes = Math.floor((diffHours - hours) * 60)
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR')
}

export function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function isSameDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate()
} 