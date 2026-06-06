// apps/admin/src/types/profile/index.ts

/** 管理员个人信息 VO */
export interface ProfileVO {
  id: number
  username: string
  realName: string | null
  phone: string
  email: string | null
  avatar: string | null
  roleName: string
  isTotpEnabled: boolean
  lastLoginAt: string
  createdAt: string
}

/** 修改个人信息 DTO */
export interface ProfileUpdateDTO {
  username?: string
  phone?: string
  email?: string
  avatar?: string
}

/** 修改密码 DTO */
export interface PasswordUpdateDTO {
  oldPassword: string
  newPassword: string
}

/** TOTP 开启响应 VO */
export interface TotpEnableVO {
  secret: string
  qrCodeImage: string
}

/** TOTP 验证 DTO */
export interface TotpVerifyDTO {
  code: string
}

/** TOTP 关闭 DTO */
export interface TotpDisableDTO {
  password: string
}
