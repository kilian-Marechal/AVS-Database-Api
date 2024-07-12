import { APIGatewayProxyResult } from 'aws-lambda'
import { versionHeaders } from './headers'

export function httpResponse(response: APIGatewayProxyResult): APIGatewayProxyResult {
  return {
    statusCode: response.statusCode,
    headers: {
      ...versionHeaders,
      ...response.headers,
    },
    multiValueHeaders: response.multiValueHeaders,
    isBase64Encoded: response.isBase64Encoded,
    body: response.body,
  }
}
