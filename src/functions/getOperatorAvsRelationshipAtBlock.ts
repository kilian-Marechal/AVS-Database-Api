import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { httpResponse } from '../core/utils/response'
import { Gravity, sendDiscordReport } from '../core/modules/discord'
import { log } from '../core/modules/logger'
import { prisma } from '../core/environment/prisma'
import { sanitizeAddress } from '../core/utils/sanitizeAddress'
import { Address } from 'viem'
import { OperatorAvsRegistrationType } from '../core/types'

type RequestBodyType = {
  blockNumber: number
  avsAddress?: Address
  operatorAddress?: Address
  status?: boolean
}
type ResponseBodyType = {
  status: 'success'
  results: OperatorAvsRegistrationType[]
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const functionOrigin = '/getOperatorAvsRelationshipAtBlock'

  let parsedBody: RequestBodyType

  try {
    // try to parse JSON body
    try {
      parsedBody = JSON.parse(event.body || '') as RequestBodyType
    } catch (err) {
      return httpResponse({
        statusCode: 400,
        headers: {
          'Content-Type': 'text/plain',
        },
        body: 'Bad Request',
      })
    }

    const { blockNumber, avsAddress, operatorAddress, status } = parsedBody

    // Sanitize the addresses if provided
    const sanitizedAvsAddress = avsAddress ? sanitizeAddress(avsAddress) : undefined
    const sanitizedOperatorAddress = operatorAddress ? sanitizeAddress(operatorAddress) : undefined

    // Build the where condition with optional filters
    const whereCondition: any = {
      blockNumber: {
        lte: blockNumber,
      },
    }

    if (typeof status === 'boolean') {
      whereCondition.status = status
    }

    // Fetch the operators and AVS ids based on the provided addresses
    if (sanitizedAvsAddress !== undefined) {
      const avs = await prisma.avs.findUnique({
        where: { address: sanitizedAvsAddress },
        select: { id: true },
      })
      if (!avs) throw new Error('AVS not found')
      whereCondition.avsId = avs.id
    }
    if (sanitizedOperatorAddress !== undefined) {
      const operator = await prisma.operator.findUnique({
        where: { address: sanitizedOperatorAddress },
        select: { id: true },
      })
      if (!operator) throw new Error('Operator not found')
      whereCondition.operatorId = operator.id
    }

    // Fetch all unique pairs of operator and AVS
    const operatorAvsPairs = await prisma.operatorAvsRegistration.findMany({
      where: whereCondition,
      select: {
        operatorId: true,
        avsId: true,
      },
      distinct: ['operatorId', 'avsId'],
    })

    const results = []

    for (const pair of operatorAvsPairs) {
      const { operatorId, avsId } = pair

      // Add operatorId and avsId to the where condition
      whereCondition.operatorId = operatorId
      whereCondition.avsId = avsId

      // Fetch the latest OperatorAvsRegistration up to the given blockNumber for the current pair
      const latestRegistration = await prisma.operatorAvsRegistration.findFirst({
        where: whereCondition,
        orderBy: {
          blockNumber: 'desc',
        },
      })

      if (latestRegistration) {
        const operator = await prisma.operator.findUnique({
          where: { id: operatorId },
          select: { address: true },
        })

        const avs = await prisma.avs.findUnique({
          where: { id: avsId },
          select: { address: true },
        })

        if (operator && avs) {
          results.push({
            operator: operator.address,
            avs: avs.address,
            status: latestRegistration.status,
            blockNumber: latestRegistration.blockNumber,
            blockTimestamp: latestRegistration.blockTimestamp,
            transactionHash: latestRegistration.transactionHash,
          })
        }
      }
    }

    return httpResponse({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'success',
        results,
      } satisfies ResponseBodyType),
    })
  } catch (error: any) {
    log.pinoError(error.message, {
      endpoint: functionOrigin,
      additionalData: {
        action: handler.name,
        error,
      },
    })

    await sendDiscordReport(functionOrigin, error, Gravity.High)

    return httpResponse({
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
      body: 'Internal Server Error',
    })
  }
}
