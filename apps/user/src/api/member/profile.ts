import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { MemberProfileVO, MemberProfileUpdateDTO } from '@/types/member/profile'

const PREFIX = '/api/v1/app/member'

/**
 * 获取用户资料
 */
export const getProfile = () => {
  return request.get<R<MemberProfileVO>>(`${PREFIX}/profile`)
}

/**
 * 更新用户资料
 */
export const updateProfile = (data: MemberProfileUpdateDTO) => {
  return request.put<R<null>>(`${PREFIX}/profile`, data)
}
