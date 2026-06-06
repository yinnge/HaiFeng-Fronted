// apps/admin/src/api/auth/index.ts
import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type {
  LoginDTO,
  RegisterDTO,
  TotpLoginDTO,
  TokenVO,
  CaptchaVO,
  PreAuthVO,
  RefreshTokenDTO,
} from '@/types/auth'

const ADMIN_PREFIX = '/api/v1/admin/auth'
const APP_PREFIX = '/api/v1/app/auth'

/** 获取管理员验证码 */
export const getAdminCaptcha = () => {
  return request.get<R<CaptchaVO>>(`${ADMIN_PREFIX}/captcha`)
}

/** 管理员登录 */
export const adminLogin = (data: LoginDTO) => {
  return request.post<R<TokenVO | PreAuthVO>>(`${ADMIN_PREFIX}/login`, data)
}

/** 管理员 TOTP 登录 */
export const adminTotpLogin = (data: TotpLoginDTO) => {
  return request.post<R<TokenVO>>(`${ADMIN_PREFIX}/login/totp`, data)
}

/** 管理员刷新 Token */
export const adminRefreshToken = (data: RefreshTokenDTO) => {
  return request.post<R<TokenVO>>(`${ADMIN_PREFIX}/refresh`, data)
}

/** 管理员登出 */
export const adminLogout = () => {
  return request.post<R<null>>(`${ADMIN_PREFIX}/logout`)
}

/** 获取用户验证码 */
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

/** 用户刷新 Token */
export const appRefreshToken = (data: RefreshTokenDTO) => {
  return request.post<R<TokenVO>>(`${APP_PREFIX}/refresh`, data)
}

/** 用户登出 */
export const appLogout = () => {
  return request.post<R<null>>(`${APP_PREFIX}/logout`)
}
