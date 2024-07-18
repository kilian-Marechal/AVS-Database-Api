import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { httpResponse } from '../core/utils/response'
import { sendDiscordReport } from '../core/modules/discord'
import { log } from '../core/modules/logger'
import { prisma } from '../core/environment/prisma'
import { sanitizeAddress } from '../core/utils/sanitizeAddress'
import { getLatestIndexation } from '../core/utils/getLatestIndexation'
import { fetchOperatorSharesDecreasedUpdates } from '../core/services/fetchOperatorSharesDecreasedUpdates'
import { relaunchLambda } from '../core/services/aws'

type ResponseBodyType = {
  status: 'success'
  statusChangeEvents: number
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const entityType = 'operatorSharesDecreased'
    const latestIndexation = await getLatestIndexation(entityType)
    console.log('----- latestIndexation', latestIndexation)

    // TODO if hasMore, use step-function to recursively continue the indexation
    const { results: operatorSharesDecreased, hasMore } = await fetchOperatorSharesDecreasedUpdates(
      latestIndexation ?? 0,
    )

    if (hasMore) {
      await sendDiscordReport(new Error('operatorSharesDecreasedUpdates has more'))
    }

    if (operatorSharesDecreased.length === 0)
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
    for (const _entry of operatorSharesDecreased) {
      const { id, staker, operator, strategy, shares, blockNumber, blockTimestamp, transactionHash } = _entry

      const sanitizedStakerAddress = sanitizeAddress(staker)
      const sanitizedOperatorAddress = sanitizeAddress(operator)
      const sanitizedStrategyAddress = sanitizeAddress(strategy)

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

      // Fetch or create the strategy entry
      const strategyEntry = await prisma.strategy.upsert({
        where: {
          address: sanitizedStrategyAddress,
        },
        create: {
          address: sanitizedStrategyAddress,
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
          strategies: {
            connect: {
              address: sanitizedStrategyAddress,
            },
          },
        },
        update: {
          restakers: {
            connect: { address: sanitizedStakerAddress },
          },
          strategies: {
            connect: {
              address: sanitizedStrategyAddress,
            },
          },
        },
      })

      const operatorId = operatorEntry.id
      const restakerId = restakerEntry.id
      const strategyId = strategyEntry.id

      // Upsert the entry into the database
      await prisma.operatorSharesDecreased.upsert({
        where: { graphId: id },
        create: {
          graphId: id,
          shares: shares,
          blockNumber: parseInt(blockNumber),
          blockTimestamp: parseInt(blockTimestamp),
          transactionHash,
          operatorId,
          restakerId,
          strategyId,
        },
        update: {},
      })
    }

    // Update the latest block number in the Indexations table
    const newlatestBlockNumber = Math.max(...operatorSharesDecreased.map((update) => parseInt(update.blockNumber)))
    log.pinoInfo('newlatestIndexation', {
      endpoint: '/operatorSharesDecreasedUpdate',
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
        statusChangeEvents: operatorSharesDecreased.length,
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
