import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { httpResponse } from '../core/utils/response'
import { log } from '../core/modules/logger'
import { computeTotalStakersByOperatorForBlock } from '../core/utils/computeTotalStakersByOperator'
import { StakerDelegated, StakerUndelegated, StakerForceUndelegated } from '../core/types'
import { prisma } from '../core/environment/prisma'
import { provider } from '../core/environment/provider'
import { sanitizeAddress } from '../core/utils/sanitizeAddress'
import { Gravity, sendDiscordReport } from '../core/modules/discord'

type ResponseBodyType = {
  status: 'success'
  stakerCountsByWeek: Record<number, number>
}

const START_BLOCK_NUMBER = 17445563
const BLOCKS_PER_WEEK = Math.floor((60 * 60 * 24 * 7) / 12) // Approximate number of blocks in a week

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const functionOrigin = '/getWeeklyRestaskerCountForOperator'

  try {
    const { operatorAddress } = JSON.parse(event.body || '{}')

    if (!operatorAddress) {
      return httpResponse({
        statusCode: 400,
        headers: {
          'Content-Type': 'text/plain',
        },
        body: 'Bad Request: operatorAddress is required',
      })
    }

    const sanitizedOperatorAddress = sanitizeAddress(operatorAddress)
    const latestKnownBlockNumber = await provider(1).getBlockNumber()

    const delegations = await prisma.stakerOperatorDelegations.findMany({
      where: {
        operator: {
          address: sanitizedOperatorAddress,
        },
      },
      include: {
        operator: {
          select: {
            id: true,
            address: true,
          },
        },
        restaker: {
          select: {
            id: true,
            address: true,
          },
        },
      },
    })
    const undelegations = await prisma.stakerOperatorUndelegations.findMany({
      where: {
        operator: {
          address: sanitizedOperatorAddress,
        },
      },
      include: {
        operator: {
          select: {
            id: true,
            address: true,
          },
        },
        restaker: {
          select: {
            id: true,
            address: true,
          },
        },
      },
    })
    const forceUndelegations = await prisma.stakerOperatorForceUndelegations.findMany({
      where: {
        operator: {
          address: sanitizedOperatorAddress,
        },
      },
      include: {
        operator: {
          select: {
            id: true,
            address: true,
          },
        },
        restaker: {
          select: {
            id: true,
            address: true,
          },
        },
      },
    })

    // Map the results to include operator and restaker addresses
    const mappedDelegations: StakerDelegated[] = delegations.map((_d) => ({
      id: _d.graphId,
      staker: _d.restaker.address,
      operator: _d.operator.address,
      blockNumber: _d.blockNumber.toString(),
      blockTimestamp: _d.blockTimestamp.toString(),
      transactionHash: _d.transactionHash,
    }))
    const mappedUndelegations: StakerUndelegated[] = undelegations.map((_u) => ({
      id: _u.graphId,
      staker: _u.restaker.address,
      operator: _u.operator.address,
      blockNumber: _u.blockNumber.toString(),
      blockTimestamp: _u.blockTimestamp.toString(),
      transactionHash: _u.transactionHash,
    }))
    const mappedForceUndelegations: StakerForceUndelegated[] = forceUndelegations.map((f) => ({
      id: f.graphId,
      staker: f.restaker.address,
      operator: f.operator.address,
      blockNumber: f.blockNumber.toString(),
      blockTimestamp: f.blockTimestamp.toString(),
      transactionHash: f.transactionHash,
    }))

    // Initialize the current block number
    let currentBlockNumber = START_BLOCK_NUMBER

    // Initialize the map to store the results
    const stakerCountsByWeek: Record<number, number> = {}

    // Process weekly updates
    while (true) {
      const stakersByOperator = computeTotalStakersByOperatorForBlock(
        mappedDelegations,
        mappedUndelegations,
        mappedForceUndelegations,
        currentBlockNumber,
      )

      log.pinoInfo('Stakers by operator', {
        endpoint: '/updateTotalStakersByOperator',
        additionalData: {
          action: handler.name,
          blockNumber: currentBlockNumber,
          stakersByOperator: stakersByOperator.size,
        },
      })

      // Add the result to the map for the current operator
      const restakerCount = stakersByOperator.get(sanitizedOperatorAddress) || 0
      stakerCountsByWeek[currentBlockNumber] = restakerCount

      // Move to the next week's block number
      currentBlockNumber += BLOCKS_PER_WEEK

      // Exit the loop if the current block number exceeds the latest known block number
      log.pinoInfo('latestKnownBlockNumber', {
        endpoint: '/updateTotalStakersByOperator',
        additionalData: {
          action: handler.name,
          latestKnownBlockNumber,
        },
      })
      if (currentBlockNumber > latestKnownBlockNumber) break
    }

    return httpResponse({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'success',
        stakerCountsByWeek,
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
