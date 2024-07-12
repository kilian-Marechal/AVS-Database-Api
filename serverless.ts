import * as dotenv from 'dotenv'
// Load environment variables from the appropriate .env file
dotenv.config({ path: '.env' })
dotenv.config({ path: `.env.${process.env.NODE_ENV}`, override: true })

import { version } from './src/core/environment/version'
import { stage } from './src/core/environment/environment'
import { log } from './src/core/modules/logger'
import validateEnv from './src/core/environment/envalid'
import { allowedOrigins } from './src/core/utils/headers'
import { versionTag, serviceName, awsRegion } from './src/core/environment/aws'
import type { AWS } from '@serverless/typescript'

log.pinoInfo(`Deploying with NODE_ENV=${process.env.NODE_ENV}`, {
  additionalData: {
    action: 'deployment',
    allowedOrigins, // Remove if not using Cors
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
    profile: 'nefture-security',
    stage: `${stage}-${versionTag}`,
    tags: {
      // [TEMPLATE] add tags
      type: 'template',
    },
    // [TEMPLATE] setup the VPC
    vpc: {
      securityGroupIds: ['sg-072c511e659f6ed7b'],
      subnetIds: ['subnet-0196a83aeedb924be'],
    },
    // [TEMPLATE] setup IAM roles if needed
    iamRoleStatements: [],
    environment: {
      SERVICE_VERSION: version,
    },
  },
  functions: {
    postEndpoint: {
      name: `postEndpoint-${stage}-${versionTag}-${serviceName}`,
      handler: 'src/functions/postEndpoint.handler', // Path to worker function
      timeout: 1, // Timeout in seconds
      events: [
        {
          http: {
            path: `postEndpoint`,
            method: 'post',
            // [TEMPLATE] remove if not needing cors headers
            cors: {
              allowCredentials: true,
              headers: ['Content-Type', 'X-API-KEY'],
              maxAge: 86400,
              methods: ['POST', 'OPTIONS'],
              origins: allowedOrigins,
            },
          },
        },
      ],
    },
    awsEventRequest: {
      name: `awsEventRequest-${stage}-${versionTag}-${serviceName}`,
      handler: 'src/functions/awsEventRequest.handler', // Path to worker function
      timeout: 1, // Timeout in seconds
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
