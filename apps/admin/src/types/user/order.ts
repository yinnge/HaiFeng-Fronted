import type { BasePageQuery } from '@haifeng/shared'

export interface OrderListVO {
  id: string
  orderNo: string
  memberName: string
  phone: string
  wechatId: string
  orderType: 'new' | 'renewal'
  beforeType: 'normal' | 'pro' | 'vip'
  afterType: 'normal' | 'pro' | 'vip'
  durationMonths: number
  amount: number
  createdAt: string
}

export interface OrderDetailVO extends OrderListVO {
  memberId: string
  beforeExpireAt: string | null
  afterExpireAt: string
  operatorId: string
  operatorName: string
  remark: string | null
  updatedAt: string
}

export interface OrderQueryDTO extends BasePageQuery {
  phone?: string
  wechatId?: string
  operatorName?: string
  orderType?: 'new' | 'renewal'
}
