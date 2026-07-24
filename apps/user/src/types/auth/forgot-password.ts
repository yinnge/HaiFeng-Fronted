export interface CaptchaVO {
  uuid: string
  image: string
}

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
