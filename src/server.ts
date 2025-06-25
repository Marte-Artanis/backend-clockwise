import { buildApp } from './app'
import prisma from './config/prisma'

const start = async () => {
  try {
    const app = await buildApp(prisma)
    await app.listen({ port: 3333, host: '0.0.0.0' })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start() 