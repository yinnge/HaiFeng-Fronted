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
