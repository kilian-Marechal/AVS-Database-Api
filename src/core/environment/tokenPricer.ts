if (process.env.ERC20_PRICER_API_URL === undefined) throw new Error('process.env.ERC20_PRICER_API_URL  is undefined')

export const erc20_pricer_api_url = process.env.ERC20_PRICER_API_URL
