import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { httpResponse } from '../core/utils/response'
import { sendDiscordReport } from '../core/modules/discord'
import { log } from '../core/modules/logger'
import { prisma } from '../core/environment/prisma'
import { sanitizeAddress } from '../core/utils/sanitizeAddress'

// TODO Define, also rename endpoint
type RequestBodyType = {
  data: {
    operatorAVSRegistrationStatusUpdateds: {
      id: string
      operator: string
      avs: string
      status: number
      blockNumber: string
      blockTimestamp: string
      transactionHash: string
      __typename: string
    }[]
  }
}

type ResponseBodyType = {
  status: 'success'
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

    const { operatorAVSRegistrationStatusUpdateds } = parsedBody.data

    // // TODO Verify request parameters
    // if (
    //   1 === 1
    //   // !parsedBody.address ||
    //   // typeof parsedBody.address !== 'string' ||
    //   // !/^0x[0-9a-fA-F]{40}$/.test(parsedBody.address)
    // ) {
    //   return httpResponse({
    //     statusCode: 400,
    //     headers: {
    //       'Content-Type': 'text/plain',
    //     },
    //     body: 'Bad Request',
    //   })
    // }

    // Iterate through the entries and upsert into the database
    for (const _entry of operatorAVSRegistrationStatusUpdateds) {
      const { id, operator, avs, status, blockNumber, blockTimestamp, transactionHash } = _entry

      const sanitizedOperatorAddress = sanitizeAddress(operator)
      const sanitizedAvsAddress = sanitizeAddress(avs)

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

      const operatorId = operatorEntry.id
      const avsId = avsEntry.id

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
      additionalData: {
        action: 'postEndpointError',
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
