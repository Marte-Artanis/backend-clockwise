import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['./tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    env: {
      NODE_ENV: 'test',
      TEST_POSTGRES_USER: 'clockwise_test',
      TEST_POSTGRES_PASSWORD: 'clockwise_test',
      TEST_POSTGRES_DB: 'clockwise_test',
      TEST_POSTGRES_HOST: 'localhost',
      TEST_POSTGRES_PORT: '5434',
      JWT_SECRET: 'test-secret'
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
}) 