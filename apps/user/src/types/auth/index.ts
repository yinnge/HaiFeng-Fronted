/** 登录请求 DTO */
export interface LoginDTO {
  phone: string
  password: string
  captchaCode: string
  uuid: string
}

/** 注册请求 DTO */
export interface RegisterDTO {
  username: string
  phone: string
  password: string
  captchaCode: string
  uuid: string
  referrerCode?: string
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

/** 刷新 Token 请求 DTO */
export interface RefreshTokenDTO {
  refreshToken: string
}
