import { cleanEnv, str, num, bool } from 'envalid'

// To match typical Envalid error
function prettyPrintMissingVariables(missingVars: string[]): string {
  return [
    '\n================================',
    ' Missing environment variables:',
    ...missingVars.map((varName) => `    ${varName}: undefined`),
    '================================',
  ].join('\n')
}

type BaseEnv = {
  NODE_ENV: string
  NODE_NAME: string
  REDIS_HOST: string
  REDIS_PORT: number
  DATABASE_URL: string
  API_KEY_1: string
  API_KEY_2: string
}

type AwsEnv = BaseEnv & {
  DEPLOYMENT_AWS_ACCOUNT_ID: string
  DEPLOYMENT_AWS_REGION: string
}

export function validateEnv(): Readonly<BaseEnv | AwsEnv> {
  const env = cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'staging', 'production', 'test'] }),
    NODE_NAME: str(),
    REDIS_HOST: str(),
    REDIS_PORT: num(),
    DATABASE_URL: str(),
    API_KEY_1: str(),
    API_KEY_2: str(),
    DEPLOYMENT_AWS_ACCOUNT_ID: str({ default: undefined }),
    DEPLOYMENT_AWS_REGION: str({ default: undefined }),
  })

  // Conditionally enforce AWS credentials in production and staging
  if (env.NODE_ENV === 'production' || env.NODE_ENV === 'staging') {
    const missingVariables: string[] = []
    if (!env.DEPLOYMENT_AWS_ACCOUNT_ID) missingVariables.push('DEPLOYMENT_AWS_ACCOUNT_ID')
    if (!env.DEPLOYMENT_AWS_REGION) missingVariables.push('DEPLOYMENT_AWS_REGION')

    if (missingVariables.length > 0) {
      throw new Error(prettyPrintMissingVariables(missingVariables))
    }
  }
  return env
}

export default validateEnv
