import { env } from './env'

const getHost = (envHost: string, serviceName: string) => {
  // Se estivermos rodando dentro do Docker, use o nome do serviço
  if (process.env['DOCKER_CONTAINER'] === 'true') {
    return serviceName
  }
  // Se estivermos rodando localmente, use o host do .env
  return envHost
}

const getDatabaseUrl = (environment: 'development' | 'test' | 'production') => {
  switch (environment) {
    case 'development':
      return `postgresql://${env.DEV_POSTGRES_USER}:${env.DEV_POSTGRES_PASSWORD}@${getHost(env.DEV_POSTGRES_HOST, 'postgres_dev')}:${env.DEV_POSTGRES_PORT}/${env.DEV_POSTGRES_DB}`
    case 'test':
      return `postgresql://${env.TEST_POSTGRES_USER}:${env.TEST_POSTGRES_PASSWORD}@${getHost(env.TEST_POSTGRES_HOST, 'postgres_test')}:${env.TEST_POSTGRES_PORT}/${env.TEST_POSTGRES_DB}`
    case 'production':
      if (env.NODE_ENV !== 'production') {
        throw new Error('Production database configuration is not available in non-production environment')
      }
      return `postgresql://${env.PROD_POSTGRES_USER}:${env.PROD_POSTGRES_PASSWORD}@${getHost(env.PROD_POSTGRES_HOST, 'postgres_prod')}:${env.PROD_POSTGRES_PORT}/${env.PROD_POSTGRES_DB}`
  }
}

export const databaseConfig = {
  development: {
    url: getDatabaseUrl('development')
  },
  test: {
    url: getDatabaseUrl('test')
  },
  production: {
    url: env.NODE_ENV === 'production' ? getDatabaseUrl('production') : getDatabaseUrl('development')
  }
} 