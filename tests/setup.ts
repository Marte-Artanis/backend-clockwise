import { beforeAll, afterAll } from 'vitest'
import * as dotenv from 'dotenv'
import prisma from '../src/config/prisma'
import fs from 'fs'
import path from 'path'

// As variáveis de ambiente já são carregadas pelo import acima
// e pelo arquivo vitest.config.ts

beforeAll(async () => {
  // Carrega variáveis de ambiente do arquivo .env.test se existir
  dotenv.config({ path: '.env.test' })

  // Define variáveis de ambiente padrão para testes
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = 'test-secret-key'
  
  try {
    // Primeiro tenta limpar as tabelas e resetar as sequências
    try {
      await prisma.$transaction([
        prisma.$executeRawUnsafe('TRUNCATE TABLE "clocks" RESTART IDENTITY CASCADE'),
        prisma.$executeRawUnsafe('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE')
      ])
    } catch (error) {
      // Se as tabelas não existem, aplica as migrações
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        const migrationsPath = path.join(__dirname, '../prisma/migrations')
        const migrationDirs = fs.readdirSync(migrationsPath)
          .filter(dir => dir !== 'migration_lock.toml')
          .sort() // Garante que as migrações sejam aplicadas em ordem

        for (const migrationDir of migrationDirs) {
          const migrationFile = path.join(migrationsPath, migrationDir, 'migration.sql')
          const migration = fs.readFileSync(migrationFile, 'utf8')
          const commands = migration.split(';')
            .map(command => command.trim())
            .filter(command => command.length > 0)
          
          for (const command of commands) {
            try {
              await prisma.$executeRawUnsafe(command)
            } catch (error) {
              // Ignora erros de tabela já existente
              if (!error.message.includes('already exists')) {
                throw error
              }
            }
          }
        }

        // Depois de aplicar as migrações, limpa as tabelas e reseta as sequências
        await prisma.$transaction([
          prisma.$executeRawUnsafe('TRUNCATE TABLE "clocks" RESTART IDENTITY CASCADE'),
          prisma.$executeRawUnsafe('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE')
        ])
      } else {
        throw error
      }
    }
  } catch (error) {
    console.error('Error setting up test database:', error)
    throw error
  }
})

afterAll(async () => {
  await prisma.$disconnect()
}) 