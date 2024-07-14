import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { httpResponse } from '../core/utils/response'
import { sendDiscordReport } from '../core/modules/discord'
import { log } from '../core/modules/logger'
import { prisma } from '../core/environment/prisma'
import { sanitizeAddress } from '../core/utils/sanitizeAddress'
import { Address } from 'viem'

type RequestBodyType = {
  operatorAddress: Address
}
type ResponseBodyType = {
  status: 'success'
  restakers: number
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

    const { operatorAddress } = parsedBody

    const sanitizedOperatorAddress = sanitizeAddress(operatorAddress)

    const operatorEntry = await prisma.operator.findFirst({
      where: { address: sanitizedOperatorAddress },
      select: {
        restakerCount: true,
      },
    })

    if (!operatorEntry) throw new Error('Could not find requested operator')

    return httpResponse({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'success',
        restakers: operatorEntry.restakerCount,
      } satisfies ResponseBodyType),
    })
  } catch (err: any) {
    log.pinoError(err.message, {
      endpoint: '/getSpecificOperatorAvsRegistrationEvents',
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
