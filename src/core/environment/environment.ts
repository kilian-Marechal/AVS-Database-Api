export const environment = process.env.NODE_ENV
export const isLocal = environment === 'development'
export const isStaging = environment === 'staging'
export const isProd = environment === 'production'
export const isTest = environment === 'test'

export const stage = isProd ? 'prod' : isStaging ? 'staging' : 'dev'

export const envName = process.env.NODE_NAME
