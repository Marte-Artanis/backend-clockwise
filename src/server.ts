import { buildApp } from './app'
import { config } from './config/env'

async function start() {
  try {
    const app = await buildApp()

    await app.listen({ 
      port: config.PORT, 
      host: '0.0.0.0' 
    })

    console.log(`🚀 Server running on http://localhost:${config.PORT}`)
    console.log(`📊 Environment: ${config.NODE_ENV}`)
  } catch (err) {
    console.error('❌ Error starting server:', err)
    process.exit(1)
  }
}

start() 