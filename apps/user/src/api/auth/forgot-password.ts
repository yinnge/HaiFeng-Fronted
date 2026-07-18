import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { CaptchaVO, SendCodeDTO, ResetPasswordDTO } from '@/types/auth/forgot-password'

/** 获取图形验证码 */
export const getCaptcha = () => {
  return request.get<R<CaptchaVO>>('/api/v1/app/auth/captcha')
}

/** 发送短信验证码（忘记密码） */
export const sendResetCode = (data: SendCodeDTO) => {
  return request.post<R<null>>('/api/v1/app/auth/forgot-password/send-code', data)
}

/** 重置密码 */
export const resetPassword = (data: ResetPasswordDTO) => {
  return request.post<R<null>>('/api/v1/app/auth/forgot-password/reset', data)
}
