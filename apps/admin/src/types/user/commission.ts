import type { BasePageQuery } from '@haifeng/shared'

export interface CommissionListVO {
  id: string
  referrerName: string
  referrerPhone: string
  refereeName: string
  refereePhone: string
  orderId: string
  orderAmount: number
  commissionRate: number
  commissionAmount: number
  createdAt: string
}

export interface CommissionQueryDTO extends BasePageQuery {
  referrerPhone?: string
  referrerName?: string
  refereePhone?: string
  refereeName?: string
  orderNo?: string
}
