import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { httpResponse } from '../core/utils/response'
import { sendDiscordReport } from '../core/modules/discord'
import { log } from '../core/modules/logger'
import { prisma } from '../core/environment/prisma'
import { sanitizeAddress } from '../core/utils/sanitizeAddress'
import { getLatestIndexation } from '../core/utils/getLatestIndexation'
import { fetchStakerDelegationUpdates } from '../core/services/fetchStakerDelegationUpdates'

type ResponseBodyType = {
  status: 'success'
  statusChangeEvents: number
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const entityType = 'stakerOperatorDelegations'
    const latestIndexation = await getLatestIndexation(entityType)
    console.log('----- latestIndexation', latestIndexation)

    // TODO if hasMore, use step-function to recursively continue the indexation
    const { results: stakerOperatorDelegations, hasMore } = await fetchStakerDelegationUpdates(latestIndexation ?? 0)

    if (stakerOperatorDelegations.length === 0)
      return httpResponse({
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'success',
          statusChangeEvents: 0,
        } satisfies ResponseBodyType),
      })

    // Iterate through the entries and upsert into the database
    for (const _entry of stakerOperatorDelegations) {
      const { id, staker, operator, blockNumber, blockTimestamp, transactionHash } = _entry

      const sanitizedStakerAddress = sanitizeAddress(staker)
      const sanitizedOperatorAddress = sanitizeAddress(operator)

      // Fetch or create the restaker entry
      const restakerEntry = await prisma.restaker.upsert({
        where: {
          address: sanitizedStakerAddress,
        },
        create: {
          address: sanitizedStakerAddress,
        },
        update: {},
      })

      // Fetch or create the operator entry (and connect)
      const operatorEntry = await prisma.operator.upsert({
        where: {
          address: sanitizedOperatorAddress,
        },
        create: {
          address: sanitizedOperatorAddress,
          restakers: {
            connect: {
              address: sanitizedStakerAddress,
            },
          },
        },
        update: {
          restakers: {
            connect: { address: sanitizedStakerAddress },
          },
        },
      })

      const operatorId = operatorEntry.id
      const restakerId = restakerEntry.id

      // Upsert the entry into the database
      await prisma.stakerOperatorDelegations.upsert({
        where: { graphId: id },
        create: {
          graphId: id,
          blockNumber: parseInt(blockNumber),
          blockTimestamp: parseInt(blockTimestamp),
          transactionHash,
          operatorId,
          restakerId,
        },
        update: {},
      })
    }

    // Update the latest block number in the Indexations table
    const newlatestBlockNumber = Math.max(...stakerOperatorDelegations.map((update) => parseInt(update.blockNumber)))
    log.pinoInfo('newlatestIndexation', {
      endpoint: '/stakerDelegationsUpdate',
      additionalData: {
        action: handler.name,
        newlatestBlockNumber,
      },
    })

    await prisma.indexations.upsert({
      where: { entity: entityType },
      create: {
        entity: entityType,
        latestBlockNumber: newlatestBlockNumber,
      },
      update: {
        latestBlockNumber: newlatestBlockNumber ?? latestIndexation,
      },
    })

    return httpResponse({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'success',
        statusChangeEvents: stakerOperatorDelegations.length,
      } satisfies ResponseBodyType),
    })
  } catch (err: any) {
    log.pinoError(err.message, {
      endpoint: '/stakerDelegationsUpdate',
      additionalData: {
        action: handler.name,
        error: (err as Error).message,
      },
    })

    await sendDiscordReport(err as Error)

    return httpResponse({
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
      body: 'Internal Server Error',
    })
  }
}
