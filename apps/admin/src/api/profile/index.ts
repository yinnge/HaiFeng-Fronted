// apps/admin/src/api/profile/index.ts
import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type {
  ProfileVO,
  ProfileUpdateDTO,
  PasswordUpdateDTO,
  TotpEnableVO,
  TotpVerifyDTO,
  TotpDisableDTO,
} from '@/types/profile'

const PREFIX = '/api/v1/admin/profile'

/** 获取当前管理员信息 */
export const getProfile = () => {
  return request.get<R<ProfileVO>>(PREFIX)
}

/** 修改个人信息 */
export const updateProfile = (data: ProfileUpdateDTO) => {
  return request.put<R<null>>(PREFIX, data)
}

/** 修改密码 */
export const updatePassword = (data: PasswordUpdateDTO) => {
  return request.put<R<null>>(`${PREFIX}/password`, data)
}

/** 开启 TOTP (生成密钥和二维码) */
export const enableTotp = () => {
  return request.post<R<TotpEnableVO>>(`${PREFIX}/totp/enable`)
}

/** 验证并确认绑定 TOTP */
export const verifyTotp = (data: TotpVerifyDTO) => {
  return request.post<R<null>>(`${PREFIX}/totp/verify`, data)
}

/** 关闭 TOTP */
export const disableTotp = (data: TotpDisableDTO) => {
  return request.post<R<null>>(`${PREFIX}/totp/disable`, data)
}

/** 获取当前 TOTP 二维码 */
export const getTotpQrcode = () => {
  return request.get<R<TotpEnableVO>>(`${PREFIX}/totp/qrcode`)
}
