import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { MemberInfoVO, MemberInfoUpdateDTO, PasswordUpdateDTO } from '@/types/member/info'

const PREFIX = '/api/v1/app/member'

/**
 * 获取用户信息
 */
export const getMemberInfo = () => {
  return request.get<R<MemberInfoVO>>(`${PREFIX}/info`)
}

/**
 * 更新用户信息
 */
export const updateMemberInfo = (data: MemberInfoUpdateDTO) => {
  return request.put<R<null>>(`${PREFIX}/info`, data)
}

/**
 * 获取微信号（解密）
 */
export const getWechatId = () => {
  return request.get<R<string>>(`${PREFIX}/wechat`)
}

/**
 * 修改微信号
 */
export const updateWechatId = (wechatId: string) => {
  return request.put<R<null>>(`${PREFIX}/wechat`, { wechatId })
}

/**
 * 修改密码
 */
export const updatePassword = (data: PasswordUpdateDTO) => {
  return request.put<R<null>>(`${PREFIX}/password`, data)
}

/**
 * 修改头像
 */
export const updateAvatar = (avatar: string) => {
  return request.put<R<null>>(`${PREFIX}/avatar`, { avatar })
}
