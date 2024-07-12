import { version } from '../environment/version'

export const allowedOrigins = ['http://localhost:3000']

export const corsHeaders = (origin: string | undefined): {} => {
  let corsOrigin
  if (origin !== undefined && allowedOrigins.includes(origin)) {
    corsOrigin = origin
  }

  return {
    'Access-Control-Allow-Origin': corsOrigin || 'unknown origin', // set dynamically based on the request
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With,X-Api-Key',
  }
}

export const versionHeaders = {
  'X-API-Version': version,
}
