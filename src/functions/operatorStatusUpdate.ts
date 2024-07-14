import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { httpResponse } from '../core/utils/response'
import { sendDiscordReport } from '../core/modules/discord'
import { log } from '../core/modules/logger'
import { prisma } from '../core/environment/prisma'
import { sanitizeAddress } from '../core/utils/sanitizeAddress'
import { OperatorAVSRegistrationStatusUpdated } from '../core/types'
import { getLatestIndexation } from '../core/utils/getLatestIndexation'
import { fetchOperatorAvsStatusUpdates } from '../core/services/fetchOperatorAvsStatusUpdates'

type ResponseBodyType = {
  status: 'success'
  statusChangeEvents: number
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const entityType = 'operatorAvsRegistration'
    const latestIndexation = await getLatestIndexation(entityType)
    console.log('----- latestIndexation', latestIndexation)

    const operatorStatusUpdates: OperatorAVSRegistrationStatusUpdated[] = await fetchOperatorAvsStatusUpdates(
      latestIndexation ?? 0,
    )

    if (operatorStatusUpdates.length === 0)
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
    for (const _entry of operatorStatusUpdates) {
      const { id, operator, avs, status, blockNumber, blockTimestamp, transactionHash } = _entry

      const sanitizedOperatorAddress = sanitizeAddress(operator)
      const sanitizedAvsAddress = sanitizeAddress(avs)

      // Fetch or create the avs entry
      const avsEntry = await prisma.avs.upsert({
        where: {
          address: sanitizedAvsAddress,
        },
        create: {
          address: sanitizedAvsAddress,
        },
        update: {},
      })

      // Fetch or create the operator entry
      const operatorEntry = await prisma.operator.upsert({
        where: {
          address: sanitizedOperatorAddress,
        },
        create: {
          address: sanitizedOperatorAddress,
        },
        update: {},
      })

      const operatorId = operatorEntry.id
      const avsId = avsEntry.id

      // Connect the operator to the avs
      await prisma.operator.update({
        where: { id: operatorId },
        data: {
          avss: {
            connect: { id: avsId },
          },
        },
      })

      // Connect the avs to the operator
      await prisma.avs.update({
        where: { id: avsId },
        data: {
          operators: {
            connect: { id: operatorId },
          },
        },
      })

      // Upsert the entry into the database
      await prisma.operatorAvsRegistration.upsert({
        where: { graphId: id },
        create: {
          graphId: id,
          status: status === 1,
          blockNumber: parseInt(blockNumber),
          blockTimestamp: parseInt(blockTimestamp),
          transactionHash,
          operatorId,
          avsId,
        },
        update: {},
      })
    }

    // Update the latest block number in the Indexations table
    const newlatestBlockNumber = Math.max(...operatorStatusUpdates.map((update) => parseInt(update.blockNumber)))
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
        statusChangeEvents: operatorStatusUpdates.length,
      } satisfies ResponseBodyType),
    })
  } catch (err: any) {
    log.pinoError(err.message, {
      endpoint: '/operatorStatusUpdate',
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
