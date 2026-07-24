export interface AiBalanceVO {
  providerName: string
  models: string[]
  isAvailable: boolean
  currency: string
  totalBalance: number | null
  grantedBalance: number | null
  toppedUpBalance: number | null
}
