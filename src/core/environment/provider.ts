import { createPublicClient, Hex, http } from 'viem'
import { arbitrum, mainnet } from 'viem/chains'

if (process.env.ETH_RPC_URL === undefined || process.env.ARB_RPC_URL === undefined)
  throw new Error('provider env error')

function getChain(chainId: number) {
  if (chainId === 1) return { viemChain: mainnet, rpcUrl: process.env.ETH_RPC_URL }
  if (chainId === 42161) return { viemChain: arbitrum, rpcUrl: process.env.ARB_RPC_URL }
  throw new Error(`Unknown chain ${chainId}`)
}

// this object is used to cache initialised providers to avoid initialising them over and
// over each time we need to use a provider
const initialisedProviders: { [chainId: number]: ReturnType<typeof createPublicClient> } = {}

// used to get a provider for a particular chain
export function provider(chainId: number): ReturnType<typeof createPublicClient> {
  if (initialisedProviders[chainId] !== undefined) return initialisedProviders[chainId]

  const { viemChain, rpcUrl } = getChain(chainId)

  if (rpcUrl === undefined || viemChain === undefined) throw new Error('Invalid createPublicClient params')

  const _provider = createPublicClient({
    batch: {
      multicall: true,
    },
    chain: viemChain,
    transport: http(rpcUrl),
  })

  initialisedProviders[chainId] = _provider

  return _provider
}
