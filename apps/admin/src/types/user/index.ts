import type { BasePageQuery } from '@haifeng/shared'

/** 用户列表 VO */
export interface MemberListVO {
  id: string
  username: string
  phone: string
  memberType: 'normal' | 'pro' | 'vip'
  wechatId: string
  status: 'active' | 'disabled'
  lastLoginAt: string
  lastLoginIp: string
  createdAt: string
}

/** 用户详情 VO */
export interface MemberDetailVO extends MemberListVO {
  avatar: string
  inviteCode: string
  expireAt: string
  referrerId: string
  referrerUsername: string
  commissionBalance: number
  commissionTotalEarned: number
  commissionTotalPaid: number
  updatedAt: string
}

/** 用户查询 DTO */
export interface MemberQueryDTO extends BasePageQuery {
  phone?: string
  memberType?: 'normal' | 'pro' | 'vip'
  wechatId?: string
  status?: 'active' | 'disabled'
  inviteCode?: string
}

/** 用户状态修�?DTO */
export interface MemberStatusDTO {
  status: 'active' | 'disabled'
}

/** 会员升级 DTO */
export interface MemberUpgradeDTO {
  targetType: 'pro' | 'vip'
  durationMonths: number
  amount?: number
  remark?: string
}
