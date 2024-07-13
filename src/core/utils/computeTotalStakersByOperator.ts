import { StakerDelegated, StakerUndelegated, StakerForceUndelegated } from '../types'

export function computeTotalStakersByOperatorForBlock(
  delegations: StakerDelegated[],
  undelegations: StakerUndelegated[],
  forceUndelegations: StakerForceUndelegated[],
  blockNumber?: number,
) {
  // Filter the events to only include those up to the given blockNumber, if blockNumber is defined
  const filteredDelegations = blockNumber
    ? delegations.filter((delegation) => parseInt(delegation.blockNumber) <= blockNumber)
    : delegations

  const filteredUndelegations = blockNumber
    ? undelegations.filter((undelegation) => parseInt(undelegation.blockNumber) <= blockNumber)
    : undelegations

  const filteredForceUndelegations = blockNumber
    ? forceUndelegations.filter((forceUndelegation) => parseInt(forceUndelegation.blockNumber) <= blockNumber)
    : forceUndelegations

  // Create a map to store the final stakers for each operator
  const stakerCountByOperator = new Map<string, Set<string>>()

  // Process delegations
  filteredDelegations.forEach((_delegation) => {
    if (!stakerCountByOperator.has(_delegation.operator)) {
      stakerCountByOperator.set(_delegation.operator, new Set())
    }
    stakerCountByOperator.get(_delegation.operator)!.add(_delegation.staker)
  })

  // Process undelegations
  filteredUndelegations.forEach((_undelegation) => {
    if (stakerCountByOperator.has(_undelegation.operator)) {
      stakerCountByOperator.get(_undelegation.operator)!.delete(_undelegation.staker)
    }
  })

  // Process force undelegations
  filteredForceUndelegations.forEach((_forceUndelegation) => {
    if (stakerCountByOperator.has(_forceUndelegation.operator)) {
      stakerCountByOperator.get(_forceUndelegation.operator)!.delete(_forceUndelegation.staker)
    }
  })

  // Convert the map of sets to a map of numbers
  const finalStakerCountByOperator = new Map<string, number>()
  for (const [operator, stakers] of stakerCountByOperator.entries()) {
    finalStakerCountByOperator.set(operator, stakers.size)
  }

  return finalStakerCountByOperator
}
