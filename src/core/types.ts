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
    OperatorAVSRegistrationStatusUpdateds: OperatorAVSRegistrationStatusUpdated[]
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
  __typename: string
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
