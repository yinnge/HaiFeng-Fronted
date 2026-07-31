import type { MemberType } from '@haifeng/shared'

/**
 * 用户信息 VO
 */
export interface MemberInfoVO {
  username: string
  phone: string
  avatar: string | null
  hasWechat: boolean
  inviteCode: string
  commissionBalance: number
  commissionTotalEarned: number
  commissionTotalPaid: number
  memberType: MemberType
  expireAt: string | null
  /** 挂起的会员类型（VIP活跃时，显示待恢复的Pro） */
  suspendedMemberType: string | null
  /** 挂起会员的恢复日期（VIP到期日） */
  suspendedExpireAt: string | null
}

/**
 * 用户信息更新 DTO
 */
export interface MemberInfoUpdateDTO {
  username?: string
  phone?: string
  avatar?: string
}

/**
 * 密码修改 DTO
 */
export interface PasswordUpdateDTO {
  oldPassword: string
  newPassword: string
}
