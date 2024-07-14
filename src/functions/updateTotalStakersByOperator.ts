import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { httpResponse } from '../core/utils/response'
import { sendDiscordReport } from '../core/modules/discord'
import { log } from '../core/modules/logger'
import { computeTotalStakersByOperatorForBlock } from '../core/utils/computeTotalStakersByOperator'
import { StakerDelegated, StakerUndelegated, StakerForceUndelegated } from '../core/types'
import { prisma } from '../core/environment/prisma'

type ResponseBodyType = {
  status: 'success'
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const delegations = await prisma.stakerOperatorDelegations.findMany({
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

    const stakersByOperator = computeTotalStakersByOperatorForBlock(
      mappedDelegations,
      mappedUndelegations,
      mappedForceUndelegations,
    )

    log.pinoInfo('Stakers by operator', {
      endpoint: '/updateTotalStakersByOperator',
      additionalData: {
        action: handler.name,
        stakersByOperator: stakersByOperator.size,
      },
    })

    // Update restakerCount for each operator
    for (const [operatorAddress, restakerCount] of stakersByOperator) {
      await prisma.operator.update({
        where: { address: operatorAddress },
        data: { restakerCount },
      })
    }

    return httpResponse({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'success',
      } satisfies ResponseBodyType),
    })
  } catch (err: any) {
    log.pinoError(err.message, {
      endpoint: '/stakerDelegationsUpdate',
      additionalData: {
        action: handler.name,
        err,
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
