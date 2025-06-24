import { z } from 'zod'
import 'dotenv/config'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string(),
  DATABASE_URL: z.string(),
  USE_SQLITE: z.coerce.boolean().default(false)
})

export const config = envSchema.parse({
  NODE_ENV: process.env['NODE_ENV'],
  PORT: process.env['PORT'],
  JWT_SECRET: process.env['JWT_SECRET'],
  DATABASE_URL: process.env['DATABASE_URL'],
  USE_SQLITE: process.env['USE_SQLITE']
}) 