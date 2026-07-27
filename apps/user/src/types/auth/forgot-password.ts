import type { CaptchaVO } from './index'

export type { CaptchaVO }

export interface SendCodeDTO {
  phone: string
  captchaCode: string
  uuid: string
}

export interface ResetPasswordDTO {
  phone: string
  code: string
  password: string
}
