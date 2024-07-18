import { version } from './version'

if (process.env.DEPLOYMENT_AWS_ACCOUNT_ID === undefined || process.env.DEPLOYMENT_AWS_REGION === undefined)
  throw new Error('DEPLOYMENT_AWS_ACCOUNT_ID of DEPLOYMENT_AWS_REGION is undefined')

export const awsAccountId = process.env.DEPLOYMENT_AWS_ACCOUNT_ID
export const awsRegion = process.env.DEPLOYMENT_AWS_REGION

export const versionTag = `v${version.split('.')[0]}`

// [TEMPLATE] change this to the service's name
export const serviceName = 'avs-db-Api'
