// **** Operator Registrations / Unregistrations **** \\
export type OperatorAVSRegistrationStatusUpdated = {
  id: string
  operator: string
  avs: string
  status: number
  blockNumber: string
  blockTimestamp: string
  transactionHash: string
  __typename: string
}

export type GraphOperatorRegistrationBody = {
  data: {
    operatorAVSRegistrationStatusUpdateds: OperatorAVSRegistrationStatusUpdated[]
  }
  errors: {
    message: string
  }[]
}

export type OperatorAvsRegistrationType = {
  operator: string
  avs: string
  status: boolean
  blockNumber: number
  blockTimestamp: number
  transactionHash: string
}

// **** Staker Delegations / Undelegations **** \\
export type StakerDelegated = {
  id: string
  staker: string
  operator: string
  blockNumber: string
  blockTimestamp: string
  transactionHash: string
}
export type GraphStakerDelegationBody = {
  data: {
    stakerDelegateds: StakerDelegated[]
  }
  errors: {
    message: string
  }[]
}
export type StakerUndelegated = StakerDelegated
export type GraphStakerUndelegationBody = Omit<GraphStakerDelegationBody, 'data'> & {
  data: {
    stakerUndelegateds: StakerUndelegated[]
  }
}
export type StakerForceUndelegated = StakerUndelegated
export type GraphStakerForceUndelegationBody = Omit<GraphStakerUndelegationBody, 'data'> & {
  data: {
    stakerForceUndelegateds: StakerForceUndelegated[]
  }
}

// **** Operator Shares Increased / Decreased **** \\
export type OperatorSharesIncreased = {
  id: string
  staker: string
  operator: string
  strategy: string
  shares: string
  blockNumber: string
  blockTimestamp: string
  transactionHash: string
}
export type GraphOperatorSharesIncreasedBody = {
  data: {
    operatorSharesIncreaseds: OperatorSharesIncreased[]
  }
  errors: {
    message: string
  }[]
}
export type OperatorSharesDecreased = OperatorSharesIncreased
export type GraphOperatorSharesDecreasedBody = Omit<GraphOperatorSharesIncreasedBody, 'data'> & {
  data: {
    operatorSharesDecreaseds: OperatorSharesDecreased[]
  }
}
