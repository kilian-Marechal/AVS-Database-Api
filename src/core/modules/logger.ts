import pino, { Logger } from 'pino'
import { isLocal } from '../environment/environment'
interface LogOptions {
  endpoint?: string
  additionalData: {
    action: string
    [key: string]: unknown
  }
}

const logger = isLocal
  ? pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    })
  : pino()

type LogLevel = 'info' | 'error'

function logMessage(level: LogLevel, message: string, options: LogOptions): void {
  ;(logger[level] as Logger[typeof level])({
    timestamp: Date.now(),
    message,
    endpoint: options?.endpoint || '',
    additionalData: options.additionalData,
  })
}

export const log = {
  pinoInfo: (message: string, options: LogOptions) => logMessage('info', message, options),
  pinoError: (message: string, options: LogOptions) => logMessage('error', message, options),
}

// // Examples : // //
// log.pinoInfo('Request received', {
//   endpoint: '/your-endpoint',
//   additionalData: {
//     action: 'start-request',
//     method: event.httpMethod,
//     path: event.path,
//     anyData...
//   },
// });
// log.pinoError('An error occurred', {
//   endpoint: '/your-endpoint',
//   additionalData: {
//     action: 'handle-error',
//     error: (error as Error).message,
//   },
// });
// // // // // // //
