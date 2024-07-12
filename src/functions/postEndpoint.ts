import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { corsHeaders } from '../core/utils/headers'
import { httpResponse } from '../core/utils/response'
import { sendDiscordReport } from '../core/modules/discord'
import { log } from '../core/modules/logger'

type RequestBodyType = {
  password: string
  address: string
  metadata: boolean
}

type ResponseBodyType = {
  status: 'success'
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  let parsedBody: RequestBodyType

  // remove if not needing cors headers
  const origin = event.headers.origin

  try {
    // try to parse JSON body
    try {
      parsedBody = JSON.parse(event.body || '') as RequestBodyType
    } catch (err) {
      return httpResponse(
        {
          statusCode: 400,
          headers: {
            'Content-Type': 'text/plain',
          },
          body: 'Bad Request',
        },
        // remove if not needing cors headers
        {
          ...(origin && { cors: { origin } }),
        },
      )
    }

    // Verify request parameters
    if (
      !parsedBody.address ||
      typeof parsedBody.address !== 'string' ||
      !/^0x[0-9a-fA-F]{40}$/.test(parsedBody.address)
    ) {
      return httpResponse(
        {
          statusCode: 400,
          headers: {
            'Content-Type': 'text/plain',
          },
          body: 'Bad Request',
        },
        // remove if not needing cors headers
        {
          ...(origin && { cors: { origin } }),
        },
      )
    }

    return httpResponse(
      {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'success',
        } satisfies ResponseBodyType),
      },
      // remove if not needing cors headers
      {
        ...(origin && { cors: { origin } }),
      },
    )
  } catch (err: any) {
    log.pinoError(err.message, {
      additionalData: {
        action: 'postEndpointError',
      },
    })

    await sendDiscordReport(err as Error)

    return httpResponse(
      {
        statusCode: 500,
        headers: {
          'Content-Type': 'text/plain',
        },
        body: 'Internal Server Error',
      },
      // remove if not needing cors headers
      {
        ...(origin && { cors: { origin } }),
      },
    )
  }
}
