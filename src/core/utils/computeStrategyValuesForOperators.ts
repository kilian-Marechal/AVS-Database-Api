import { fetchTokenPrices } from '../services/fetchTokenPrices'
import { StrategyValues, TokenPrice, TokensByOperator } from '../types'

export async function computeStrategyValuesForOperators(
  tokensByOperator: TokensByOperator,
  chainId: number,
): Promise<Map<string, Map<string, StrategyValues>>> {
  // Extract all strategies from the tokensByOperator map
  const strategies = new Set<string>()
  tokensByOperator.forEach((strategyMap) => {
    strategyMap.forEach((_, strategy) => strategies.add(strategy))
  })

  // Fetch token prices for all strategies
  const tokenPrices = await fetchTokenPrices(Array.from(strategies), chainId)

  // Create a nested map to store the USD values of each strategy for each operator
  const operatorStrategyValuesMap = new Map<string, Map<string, StrategyValues>>()

  // Create a map for quick lookup of token prices by token address
  const tokenPriceMap = new Map<string, TokenPrice>()
  tokenPrices.forEach((price) => {
    tokenPriceMap.set(price.tokenAddress, price)
  })

  tokensByOperator.forEach((strategyMap, operator) => {
    if (!operatorStrategyValuesMap.has(operator)) {
      operatorStrategyValuesMap.set(operator, new Map())
    }
    const operatorValuesMap = operatorStrategyValuesMap.get(operator)!

    strategyMap.forEach((tokens, strategy) => {
      const tokenPrice = tokenPriceMap.get(strategy)
      if (tokenPrice) {
        let usdValue = 0
        const { price: tokenDollarPrice, decimals: tokenDecimals } = tokenPrice.dollarPrice
        if (tokenDollarPrice && tokens !== null && tokenDecimals !== undefined) {
          usdValue =
            Number(
              (10n ** 2n * (BigInt(tokenDollarPrice) * BigInt(tokens))) / 10n ** 18n / 10n ** BigInt(tokenDecimals),
            ) /
            10 ** 2
        }

        operatorValuesMap.set(strategy, { usdValue })
      }
    })
  })

  return operatorStrategyValuesMap
}
