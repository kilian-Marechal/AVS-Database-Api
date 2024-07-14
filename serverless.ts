import * as dotenv from 'dotenv'
// Load environment variables from the appropriate .env file
dotenv.config({ path: '.env' })
dotenv.config({ path: `.env.${process.env.NODE_ENV}`, override: true })

import { version } from './src/core/environment/version'
import { stage } from './src/core/environment/environment'
import { log } from './src/core/modules/logger'
import validateEnv from './src/core/environment/envalid'
import { versionTag, serviceName, awsRegion } from './src/core/environment/aws'
import type { AWS } from '@serverless/typescript'

log.pinoInfo(`Deploying with NODE_ENV=${process.env.NODE_ENV}`, {
  additionalData: {
    action: 'deployment',
  },
})

validateEnv()

let slsOfflineConfig = {}
// For custom sls offline ports
if (process.env.HTTP_PORT && process.env.LAMBDA_PORT) {
  slsOfflineConfig = {
    httpPort: process.env.HTTP_PORT,
    lambdaPort: process.env.LAMBDA_PORT,
  }
}

const serverlessConfiguration: AWS = {
  service: serviceName,
  frameworkVersion: '3',
  provider: {
    name: 'aws',
    runtime: 'nodejs18.x',
    // @ts-ignore
    region: awsRegion,
    profile: 'hackathon-july-2024',
    stage: `${stage}-${versionTag}`,
    tags: {
      // TODO add tags
    },
    // TODO setup the VPC
    vpc: {
      securityGroupIds: ['sg-072c511e659f6ed7b'],
      subnetIds: ['subnet-0196a83aeedb924be'],
    },
    // TODO setup IAM roles when needed
    iamRoleStatements: [],
    environment: {
      SERVICE_VERSION: version,
    },
  },
  functions: {
    operatorStatusUpdate: {
      name: `operatorStatusUpdate-${stage}-${versionTag}-${serviceName}`,
      handler: 'src/functions/operatorStatusUpdate.handler', // Path to worker function
      timeout: 900, // Timeout in seconds
      events: [
        {
          http: {
            path: `operatorStatusUpdate`,
            method: 'get',
          },
        },
        {
          schedule: {
            rate: ['cron(0 12 * * ? *)'], // Runs every day at midnight UTC
            enabled: true,
          },
        },
      ],
    },
    getOperatorAvsRelationshipAtBlock: {
      name: `getOperatorAvsRelationshipAtBlock-${stage}-${versionTag}-${serviceName}`,
      handler: 'src/functions/getOperatorAvsRelationshipAtBlock.handler', // Path to worker function
      timeout: 900, // Timeout in seconds
      events: [
        {
          http: {
            path: `getOperatorAvsRelationshipAtBlock`,
            method: 'post',
          },
        },
      ],
    },
    getSpecificOperatorAvsRegistrationEvents: {
      name: `getSpecificOperatorAvsRegistrationEvents-${stage}-${versionTag}-${serviceName}`,
      handler: 'src/functions/getSpecificOperatorAvsRegistrationEvents.handler', // Path to worker function
      timeout: 900, // Timeout in seconds
      events: [
        {
          http: {
            path: `getSpecificOperatorAvsRegistrationEvents`,
            method: 'post',
          },
        },
      ],
    },
    getSpecificOperatorRestakers: {
      name: `getSpecificOperatorRestakers-${stage}-${versionTag}-${serviceName}`,
      handler: 'src/functions/getSpecificOperatorRestakers.handler', // Path to worker function
      timeout: 900, // Timeout in seconds
      events: [
        {
          http: {
            path: `getSpecificOperatorRestakers`,
            method: 'post',
          },
        },
      ],
    },
    stakerDelegationsUpdate: {
      name: `stakerDelegationsUpdate-${stage}-${versionTag}-${serviceName}`,
      handler: 'src/functions/stakerDelegationsUpdate.handler', // Path to worker function
      timeout: 900, // Timeout in seconds
      events: [
        {
          http: {
            path: `stakerDelegationsUpdate`,
            method: 'get',
          },
        },
        {
          schedule: {
            rate: ['cron(0 12 * * ? *)'], // Runs every day at midnight UTC
            enabled: true,
          },
        },
      ],
    },
    stakerUndelegationsUpdate: {
      name: `stakerUndelegationsUpdate-${stage}-${versionTag}-${serviceName}`,
      handler: 'src/functions/stakerUndelegationsUpdate.handler', // Path to worker function
      timeout: 900, // Timeout in seconds
      events: [
        {
          http: {
            path: `stakerUndelegationsUpdate`,
            method: 'get',
          },
        },
        {
          schedule: {
            rate: ['cron(0 12 * * ? *)'], // Runs every day at midnight UTC
            enabled: true,
          },
        },
      ],
    },
    stakerForceUndelegationsUpdate: {
      name: `stakerForceUndelegationsUpdate-${stage}-${versionTag}-${serviceName}`,
      handler: 'src/functions/stakerForceUndelegationsUpdate.handler', // Path to worker function
      timeout: 900, // Timeout in seconds
      events: [
        {
          http: {
            path: `stakerForceUndelegationsUpdate`,
            method: 'get',
          },
        },
        {
          schedule: {
            rate: ['cron(0 12 * * ? *)'], // Runs every day at midnight UTC
            enabled: true,
          },
        },
      ],
    },
    updateTotalStakersByOperator: {
      name: `updateTotalStakersByOperator-${stage}-${versionTag}-${serviceName}`,
      handler: 'src/functions/updateTotalStakersByOperator.handler', // Path to worker function
      timeout: 900, // Timeout in seconds
      events: [
        {
          http: {
            path: `updateTotalStakersByOperator`,
            method: 'get',
          },
        },
        {
          schedule: {
            rate: ['cron(5 12 * * ? *)'], // Runs every day at 00h05 UTC
            enabled: true,
          },
        },
      ],
    },
    operatorSharesIncreasedUpdate: {
      name: `operatorSharesIncreasedUpdate-${stage}-${versionTag}-${serviceName}`,
      handler: 'src/functions/operatorSharesIncreasedUpdate.handler', // Path to worker function
      timeout: 900, // Timeout in seconds
      events: [
        {
          http: {
            path: `operatorSharesIncreasedUpdate`,
            method: 'get',
          },
        },
        {
          schedule: {
            rate: ['cron(0 12 * * ? *)'], // Runs every day at midnight UTC
            enabled: true,
          },
        },
      ],
    },
    operatorSharesDecreasedUpdate: {
      name: `operatorSharesDecreasedUpdate-${stage}-${versionTag}-${serviceName}`,
      handler: 'src/functions/operatorSharesDecreasedUpdate.handler', // Path to worker function
      timeout: 900, // Timeout in seconds
      events: [
        {
          http: {
            path: `operatorSharesDecreasedUpdate`,
            method: 'get',
          },
        },
        {
          schedule: {
            rate: ['cron(0 12 * * ? *)'], // Runs every day at midnight UTC
            enabled: true,
          },
        },
      ],
    },
  },
  package: {
    // Exclude resources from webpack execution
    patterns: [
      '@',
      'webpack.config.ts',
      '.env*',
      '!docker-compose.yaml',
      '!hardhat.config.ts',
      '!Makefile',
      '!jest.config.json',
      '!__test__/*',
      '!redis-config/*',
      '!redis-data/*',
      '!.vscode/*',
      '!*.zip',
    ],
  },
  custom: {
    'tscpaths': { '@': '.' },
    'webpack': {
      webpackConfig: './webpack.config.ts', // Path to your webpack configuration file
      packager: 'yarn', // Packager that will be used to package your external modules
      includeModules: true,
      keepOutputDirectory: false, // useful to debug when true
      packagerOptions: {
        // used to generate the prisma types in the webpack bundle
        scripts: ['yarn add prisma', 'yarn prisma generate'],
      },
    },
    'bundle': {
      externals: ['viem'],
      forceExclude: ['aws-sdk'],
    },
    // configure serverless-offline
    'serverless-offline': slsOfflineConfig,
  },
  plugins: ['serverless-dotenv-plugin', 'serverless-offline', 'serverless-tscpaths', 'serverless-webpack'],
}

module.exports = serverlessConfiguration
