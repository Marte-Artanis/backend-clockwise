import { z } from 'zod'
import 'dotenv/config'

const productionEnvSchema = z.object({
  NODE_ENV: z.literal('production'),
  
  // Development Database
  DEV_POSTGRES_USER: z.string(),
  DEV_POSTGRES_PASSWORD: z.string(),
  DEV_POSTGRES_DB: z.string(),
  DEV_POSTGRES_HOST: z.string(),
  DEV_POSTGRES_PORT: z.string(),

  // Test Database
  TEST_POSTGRES_USER: z.string(),
  TEST_POSTGRES_PASSWORD: z.string(),
  TEST_POSTGRES_DB: z.string(),
  TEST_POSTGRES_HOST: z.string(),
  TEST_POSTGRES_PORT: z.string(),

  // Production Database
  PROD_POSTGRES_USER: z.string(),
  PROD_POSTGRES_PASSWORD: z.string(),
  PROD_POSTGRES_DB: z.string(),
  PROD_POSTGRES_HOST: z.string(),
  PROD_POSTGRES_PORT: z.string(),

  // JWT
  JWT_SECRET: z.string()
})

const developmentEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test']),
  
  // Development Database
  DEV_POSTGRES_USER: z.string(),
  DEV_POSTGRES_PASSWORD: z.string(),
  DEV_POSTGRES_DB: z.string(),
  DEV_POSTGRES_HOST: z.string(),
  DEV_POSTGRES_PORT: z.string(),

  // Test Database
  TEST_POSTGRES_USER: z.string(),
  TEST_POSTGRES_PASSWORD: z.string(),
  TEST_POSTGRES_DB: z.string(),
  TEST_POSTGRES_HOST: z.string(),
  TEST_POSTGRES_PORT: z.string(),

  // Production Database
  PROD_POSTGRES_USER: z.string().optional(),
  PROD_POSTGRES_PASSWORD: z.string().optional(),
  PROD_POSTGRES_DB: z.string().optional(),
  PROD_POSTGRES_HOST: z.string().optional(),
  PROD_POSTGRES_PORT: z.string().optional(),

  // JWT
  JWT_SECRET: z.string()
})

const envSchema = z.discriminatedUnion('NODE_ENV', [
  productionEnvSchema,
  developmentEnvSchema
])

export const env = envSchema.parse(process.env) 