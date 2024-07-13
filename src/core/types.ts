export type operatorAVSRegistrationStatusUpdated = {
  id: string
  graphId?: string
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
    operatorAVSRegistrationStatusUpdateds: operatorAVSRegistrationStatusUpdated[]
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
