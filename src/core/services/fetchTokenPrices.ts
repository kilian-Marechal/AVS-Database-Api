import { erc20_pricer_api_url } from '../environment/tokenPricer'
import { ERC20PricerRequestBody, ERC20PricerResponseBody, TokenPrice } from '../types'

export async function fetchTokenPrices(tokenAddresses: string[], chainId: number): Promise<TokenPrice[]> {
  try {
    const requestBody: ERC20PricerRequestBody = { chainId, tokenAddresses }

    console.log('ERC20 pricer request body ', requestBody)

    const response = await fetch(`${erc20_pricer_api_url}/getPrices` ?? '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const responseBody = (await response.json()) as ERC20PricerResponseBody

    console.log('ERC20 pricer response body ', JSON.stringify(responseBody))

    return responseBody.map((item) => ({
      tokenAddress: item.token,
      dollarPrice:
        item.status === 'no_pool_found'
          ? { price: '0', decimals: 0 }
          : {
              price: item.dollarPrice.price,
              decimals: item.dollarPrice.decimals,
            },
      enoughLiquidity: item.enoughLiquidity,
    }))
  } catch (error) {
    throw new Error(`Failed to fetch token price: ${error}`)
  }
}
