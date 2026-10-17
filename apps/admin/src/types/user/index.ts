import type { BasePageQuery } from '@haifeng/shared'

/** 用户列表 VO */
export interface MemberListVO {
  id: string
  username: string
  phone: string
  memberType: 'normal' | 'vip'
  /** 是否老师身份（叠加角色，独立于会员档位） */
  teacher?: boolean
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
  memberType?: 'normal' | 'vip'
  wechatId?: string
  status?: 'active' | 'disabled'
  inviteCode?: string
  /** 老师身份筛选：true=仅老师 / false=仅非老师 / 不传=全部 */
  teacher?: boolean
}

/** 用户状态修�?DTO */
export interface MemberStatusDTO {
  status: 'active' | 'disabled'
}

/** 会员升级 DTO */
export interface MemberUpgradeDTO {
  targetType: 'vip'
  durationMonths: number
  amount?: number
  remark?: string
}
