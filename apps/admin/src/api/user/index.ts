import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  MemberListVO,
  MemberDetailVO,
  MemberQueryDTO,
  MemberStatusDTO,
  MemberUpgradeDTO,
} from '@/types/user'

const PREFIX = '/api/v1/admin/user'

/** 分页查询用户列表 */
export const getUserPage = (params: MemberQueryDTO) => {
  return request.get<R<PageResult<MemberListVO>>>(`${PREFIX}/list`, { params })
}

/** 获取用户详情 */
export const getUserDetail = (id: string) => {
  return request.get<R<MemberDetailVO>>(`${PREFIX}/${id}`)
}

/** 修改用户状态 */
export const updateUserStatus = (id: string, data: MemberStatusDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/status`, data)
}

/** 查看用户微信明文 */
export const getUserWechat = (id: string) => {
  return request.get<R<string>>(`${PREFIX}/${id}/wechat`)
}

/** 会员升级 */
export const upgradeUser = (id: string, data: MemberUpgradeDTO) => {
  return request.post<R<number>>(`${PREFIX}/${id}/upgrade`, data)
}
