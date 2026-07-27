import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type {
  LoginDTO,
  RegisterDTO,
  TokenVO,
  CaptchaVO,
  RefreshTokenDTO,
} from '@/types/auth'

const APP_PREFIX = '/api/v1/app/auth'

/** 获取图形验证码 */
export const getAppCaptcha = () => {
  return request.get<R<CaptchaVO>>(`${APP_PREFIX}/captcha`)
}

/** 用户登录 */
export const appLogin = (data: LoginDTO) => {
  return request.post<R<TokenVO>>(`${APP_PREFIX}/login`, data)
}

/** 用户注册 */
export const appRegister = (data: RegisterDTO) => {
  return request.post<R<TokenVO>>(`${APP_PREFIX}/register`, data)
}

/** 刷新 Token */
export const appRefreshToken = (data: RefreshTokenDTO) => {
  return request.post<R<TokenVO>>(`${APP_PREFIX}/refresh`, data)
}

/** 用户登出 */
export const appLogout = () => {
  return request.post<R<null>>(`${APP_PREFIX}/logout`)
}
