import { APIGatewayProxyResult } from 'aws-lambda'
import { corsHeaders, versionHeaders } from './headers'

type Params = { cors?: { origin: string } }

export function httpResponse(response: APIGatewayProxyResult, params?: Params): APIGatewayProxyResult {
  return {
    statusCode: response.statusCode,
    headers: {
      ...(params?.cors !== undefined && corsHeaders(params.cors.origin)),
      ...versionHeaders,
      ...response.headers,
    },
    multiValueHeaders: response.multiValueHeaders,
    isBase64Encoded: response.isBase64Encoded,
    body: response.body,
  }
}
