import Redis from 'ioredis'
import { isProd } from '../environment/environment'
import { serviceName } from '../environment/aws'

const isTest = process.env.TEST === 'true'

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: isTest ? parseInt(process.env.TESTING_REDIS_PORT as string) : parseInt(process.env.REDIS_PORT as string),
  password: process.env.REDIS_PASSWORD ?? '',
  keyPrefix: `${serviceName}:`, // used to make sure that all keys are stored in the same redis node
  ...(isProd && { tls: {} }),
})

export { redis }
