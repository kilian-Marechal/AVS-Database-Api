export const environment = process.env.NODE_ENV
export const isLocal = environment === 'development'
export const isStaging = environment === 'staging'
export const isProd = environment === 'production'

if (environment !== 'production' && environment !== 'staging' && environment !== 'development')
  throw new Error("couldn't find stage")

export const stage = environment === 'production' ? 'prod' : environment === 'staging' ? 'staging' : 'dev'
