import { buildApp } from './app'

const start = async () => {
  try {
    const app = await buildApp()
    await app.listen({ port: 3333, host: '0.0.0.0' })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

start() 