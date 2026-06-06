// apps/admin/src/api/permission/role.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  RoleVO,
  RoleQueryDTO,
  RoleAddDTO,
  RoleUpdateDTO,
  RoleBindModulesDTO,
} from '@/types/permission/role'

const PREFIX = '/api/v1/admin/permission/roles'

/** 角色列表（分页） */
export const getRolePage = (params: RoleQueryDTO) => {
  return request.get<R<PageResult<RoleVO>>>(PREFIX, { params })
}

/** 角色详情 */
export const getRoleDetail = (id: number) => {
  return request.get<R<RoleVO>>(`${PREFIX}/${id}`)
}

/** 新增角色 */
export const addRole = (data: RoleAddDTO) => {
  return request.post<R<void>>(PREFIX, data)
}

/** 更新角色 */
export const updateRole = (id: number, data: RoleUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

/** 删除角色 */
export const deleteRole = (id: number) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

/** 切换角色状态 */
export const toggleRoleStatus = (id: number) => {
  return request.put<R<void>>(`${PREFIX}/${id}/toggle-status`)
}

/** 角色绑定模块 */
export const bindRoleModules = (id: number, data: RoleBindModulesDTO) => {
  return request.post<R<void>>(`${PREFIX}/${id}/modules`, data)
}
