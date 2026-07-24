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
export const getRoleDetail = (id: string) => {
  return request.get<R<RoleVO>>(`${PREFIX}/${id}`)
}

/** 新增角色 */
export const addRole = (data: RoleAddDTO) => {
  return request.post<R<void>>(PREFIX, data)
}

/** 更新角色 */
export const updateRole = (id: string, data: RoleUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

/** 删除角色 */
export const deleteRole = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

/** 切换角色状�?*/
export const toggleRoleStatus = (id: string) => {
  return request.put<R<void>>(`${PREFIX}/${id}/toggle-status`)
}

/** 角色绑定模块 */
export const bindRoleModules = (id: string, data: RoleBindModulesDTO) => {
  return request.post<R<void>>(`${PREFIX}/${id}/modules`, data)
}
