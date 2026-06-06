// apps/admin/src/types/auth/index.ts

/** 登录请求 DTO */
export interface LoginDTO {
  phone: string
  password: string
  captchaCode: string
  uuid: string
}

/** 用户注册请求 DTO */
export interface RegisterDTO {
  phone: string
  password: string
  captchaCode: string
  uuid: string
  referrerCode?: string
}

/** TOTP 登录请求 DTO */
export interface TotpLoginDTO {
  preAuthToken: string
  totpCode: string
}

/** Token 响应 VO */
export interface TokenVO {
  accessToken: string
  refreshToken: string
  accessTokenExpire: number
  refreshTokenExpire: number
  tokenType: string
}

/** 验证码响应 VO */
export interface CaptchaVO {
  uuid: string
  image: string
}

/** 预认证响应 VO (TOTP) */
export interface PreAuthVO {
  preAuthToken: string
}

/** 刷新 Token 请求 DTO */
export interface RefreshTokenDTO {
  refreshToken: string
}
