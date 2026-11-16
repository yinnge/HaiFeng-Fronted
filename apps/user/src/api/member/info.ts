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
 * 修改头像（选择内置头像 / 切回历史上传头像）
 */
export const updateAvatar = (avatar: string) => {
  return request.put<R<null>>(`${PREFIX}/avatar`, { avatar })
}

/**
 * 上传自定义头像（写入头像专用公共读 bucket，按 memberId 固定 key 覆盖更新）
 *
 * <p>后端限制：仅 JPG / PNG，≤2MB，边长 64~2048px，宽高比 1:2~2:1。
 * 后端上传成功后会直接把当前头像改为新 URL。
 */
export const uploadAvatar = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/profile/avatar/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
}
