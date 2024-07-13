import { avs_directory_subgraph_url } from '../environment/theGraph'
import { GraphOperatorRegistrationBody } from '../types'

export async function fetchOperatorAvsStatusUpdates(latestBlockNumber: number) {
  if (!avs_directory_subgraph_url) throw new Error('avs_directory_subgraph_url is undefined')

  const QUERY = `
    query FetchOperatorAVSRegistrations($blockNumber: Int!, $first: Int!, $skip: Int!) {
      OperatorAVSRegistrationStatusUpdateds(
        where: { blockNumber_gt: $blockNumber }
        first: $first
        skip: $skip
        orderBy: blockNumber
        orderDirection: asc
      ) {
        id
        operator
        avs
        status
        blockNumber
        blockTimestamp
        transactionHash
        __typename
      }
    }
  `

  let hasMore = true
  let skip = 0
  const first = 100
  const results = []

  while (hasMore) {
    const response = await fetch(avs_directory_subgraph_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: QUERY,
        variables: {
          blockNumber: latestBlockNumber,
          first,
          skip,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const { data, errors } = (await response.json()) as GraphOperatorRegistrationBody

    if (errors) {
      throw new Error(`GraphQL error: ${errors.map((error: any) => error.message).join(', ')}`)
    }

    const { OperatorAVSRegistrationStatusUpdateds } = data

    if (OperatorAVSRegistrationStatusUpdateds.length < first) {
      hasMore = false
    } else {
      skip += first
    }

    results.push(...OperatorAVSRegistrationStatusUpdateds)
  }

  return results
}
