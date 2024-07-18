import { OperatorSharesIncreased, OperatorSharesDecreased, TokensByOperator } from '../types'

type Event = {
  operator: {
    address: string
  }
  strategy: {
    address: string
  }
} & {
  id: number
  graphId: string
  blockNumber: number
  blockTimestamp: number
  transactionHash: string
  shares: string
  operatorId: number
  restakerId: number
  strategyId: number
}

export function computeTotalSharesByOperatorForBlock(
  sharesIncreased: Event[],
  sharesDecreased: Event[],
  blockNumber?: number,
): TokensByOperator {
  // Filter the events to only include those up to the given blockNumber, if blockNumber is defined
  const filteredSharesIncreased = blockNumber
    ? sharesIncreased.filter((event) => BigInt(event.blockNumber) <= BigInt(blockNumber))
    : sharesIncreased

  const filteredSharesDecreased = blockNumber
    ? sharesDecreased.filter((event) => BigInt(event.blockNumber) <= BigInt(blockNumber))
    : sharesDecreased

  // Create a nested map to store the final shares for each operator by strategy
  const sharesByOperator = new Map<string, Map<string, bigint>>()

  // Process shares increased
  filteredSharesIncreased.forEach((event) => {
    const operator = event.operator.address
    const strategy = event.strategy.address
    const shares = BigInt(event.shares)

    if (!sharesByOperator.has(operator)) {
      sharesByOperator.set(operator, new Map())
    }
    const strategyMap = sharesByOperator.get(operator)!

    if (!strategyMap.has(strategy)) {
      strategyMap.set(strategy, 0n)
    }
    strategyMap.set(strategy, strategyMap.get(strategy)! + shares)
  })

  // Process shares decreased
  filteredSharesDecreased.forEach((event) => {
    const operator = event.operator.address
    const strategy = event.strategy.address
    const shares = BigInt(event.shares)

    if (sharesByOperator.has(operator)) {
      const strategyMap = sharesByOperator.get(operator)!
      if (strategyMap.has(strategy)) {
        strategyMap.set(strategy, strategyMap.get(strategy)! - shares)
      }
    }
  })

  // Convert the total shares to tokens
  const tokensByOperator = new Map<string, Map<string, number>>()
  const conversionFactor = 10n ** 18n

  sharesByOperator.forEach((strategyMap, operator) => {
    const tokenStrategyMap = new Map<string, number>()
    strategyMap.forEach((shares, strategy) => {
      const tokens = Number(shares) / Number(conversionFactor)
      tokenStrategyMap.set(strategy, tokens)
    })
    tokensByOperator.set(operator, tokenStrategyMap)
  })

  return tokensByOperator
}
