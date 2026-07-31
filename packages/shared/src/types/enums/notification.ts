/**
 * 通知类型枚举
 */
export enum NotificationType {
  MEMBER_EXPIRE_SOON = 'member_expire_soon',
  MEMBER_EXPIRED = 'member_expired',
  COMMISSION_EARNED = 'commission_earned',
  COMMISSION_PAID = 'commission_paid',
  COMMISSION_REJECTED = 'commission_rejected',
  SYSTEM_NOTICE = 'system_notice',
  MEMBER_RENEWED = 'member_renewed',
  MEMBER_ACTIVATION_SUCCESS = 'member_activation_success',
  MEMBER_REVOKED = 'member_revoked',
  COMMISSION_REVERSED = 'commission_reversed',
}

export const NotificationTypeLabel: Record<NotificationType, string> = {
  [NotificationType.MEMBER_EXPIRE_SOON]: '会员即将到期',
  [NotificationType.MEMBER_EXPIRED]: '会员已过期',
  [NotificationType.COMMISSION_EARNED]: '佣金到账',
  [NotificationType.COMMISSION_PAID]: '佣金已发放',
  [NotificationType.COMMISSION_REJECTED]: '提现被拒绝',
  [NotificationType.SYSTEM_NOTICE]: '系统公告',
  [NotificationType.MEMBER_RENEWED]: '会员续费成功',
  [NotificationType.MEMBER_ACTIVATION_SUCCESS]: '会员开通成功',
  [NotificationType.MEMBER_REVOKED]: '会员已撤销',
  [NotificationType.COMMISSION_REVERSED]: '佣金已撤回',
}

export const NotificationTypeTag: Record<NotificationType, 'info' | 'warning' | 'success' | 'danger'> = {
  [NotificationType.MEMBER_EXPIRE_SOON]: 'warning',
  [NotificationType.MEMBER_EXPIRED]: 'danger',
  [NotificationType.COMMISSION_EARNED]: 'success',
  [NotificationType.COMMISSION_PAID]: 'success',
  [NotificationType.COMMISSION_REJECTED]: 'danger',
  [NotificationType.SYSTEM_NOTICE]: 'info',
  [NotificationType.MEMBER_RENEWED]: 'success',
  [NotificationType.MEMBER_ACTIVATION_SUCCESS]: 'success',
  [NotificationType.MEMBER_REVOKED]: 'warning',
  [NotificationType.COMMISSION_REVERSED]: 'danger',
}

export const NotificationTypeOptions = Object.values(NotificationType).map((value) => ({
  value,
  label: NotificationTypeLabel[value],
}))
