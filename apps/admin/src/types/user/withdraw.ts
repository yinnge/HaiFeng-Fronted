import type { BasePageQuery } from '@haifeng/shared'

export interface WithdrawListVO {
  id: string
  memberId: string
  memberName: string
  phone: string
  wechatId: string
  amount: number
  status: 'pending' | 'paid' | 'rejected'
  operatorName: string | null
  remark: string | null
  createdAt: string
  updatedAt: string | null
}

export interface WithdrawQueryDTO extends BasePageQuery {
  memberName?: string
  phone?: string
  wechatId?: string
  status?: 'pending' | 'paid' | 'rejected'
}

export interface WithdrawProcessDTO {
  action: 'paid' | 'rejected'
  remark?: string
}
