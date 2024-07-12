import { Address, Hex } from 'viem'

export function sanitizeAddress(address: Hex | Address | string): Hex {
  return `0x${address.slice(address.length - 40).toLowerCase()}`
}

export function sanitizeContractAddress(address: Hex | Address | string): Hex {
  return address.toLowerCase() as Hex
}
