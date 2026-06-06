/**
 * 佣金信息 VO
 */
export interface CommissionVO {
  inviteCode: string
  commissionBalance: number
  commissionTotalEarned: number
  commissionTotalPaid: number
  referralCount: number
  referrerInviteCode: string | null
}

/**
 * 提现 DTO
 */
export interface WithdrawDTO {
  amount: 50 | 100
}

/**
 * 推荐人预览 VO
 */
export interface ReferrerPreviewVO {
  username: string
  phone: string
}

/**
 * 绑定推荐人 DTO
 */
export interface BindReferrerDTO {
  inviteCode: string
}
