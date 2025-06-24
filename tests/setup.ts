import { beforeAll } from 'vitest'
import * as dotenv from 'dotenv'

// As variáveis de ambiente já são carregadas pelo import acima
// e pelo arquivo vitest.config.ts

beforeAll(() => {
  // Carrega variáveis de ambiente do arquivo .env.test se existir
  dotenv.config({ path: '.env.test' })

  // Define variáveis de ambiente padrão para testes
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = 'test-secret-key'
  process.env.DATABASE_URL = 'file:./test.db'
  process.env.USE_SQLITE = 'true'
}) 