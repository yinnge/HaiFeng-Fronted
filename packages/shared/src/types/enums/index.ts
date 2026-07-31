/**
 * 会员类型枚举
 */
export enum MemberType {
  NORMAL = 'normal',
  PRO = 'pro',
  VIP = 'vip',
}

export const MemberTypeLabel: Record<MemberType, string> = {
  [MemberType.NORMAL]: '普通用户',
  [MemberType.PRO]: '专业版',
  [MemberType.VIP]: 'VIP会员',
}

export const MemberTypeTag: Record<MemberType, 'info' | 'warning' | 'success'> = {
  [MemberType.NORMAL]: 'info',
  [MemberType.PRO]: 'warning',
  [MemberType.VIP]: 'success',
}

/**
 * 通用状态枚举
 */
export enum Status {
  DISABLED = 0,
  ENABLED = 1,
}

export const StatusLabel: Record<Status, string> = {
  [Status.DISABLED]: '禁用',
  [Status.ENABLED]: '启用',
}

export const StatusTag: Record<Status, 'danger' | 'success'> = {
  [Status.DISABLED]: 'danger',
  [Status.ENABLED]: 'success',
}

/**
 * 用户状态枚举
 */
export enum UserStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

export const UserStatusLabel: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: '正常',
  [UserStatus.DISABLED]: '禁用',
}

export const UserStatusTag: Record<UserStatus, 'success' | 'danger'> = {
  [UserStatus.ACTIVE]: 'success',
  [UserStatus.DISABLED]: 'danger',
}

// 身份枚举
export * from './identity'
// 性别枚举
export * from './gender'
// 省份枚举
export * from './province'
// 通知类型枚举
export * from './notification'
// 订单状态枚举
export * from './order'
