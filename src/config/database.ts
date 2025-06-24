import { config } from './env'

export const getDatabaseUrl = () => {
  if (config.USE_SQLITE) {
    return 'file:./dev.db'
  }
  
  return config.DATABASE_URL
} 