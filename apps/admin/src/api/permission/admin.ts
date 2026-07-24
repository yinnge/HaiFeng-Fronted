// apps/admin/src/api/permission/admin.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  AdminVO,
  AdminQueryDTO,
  AdminAddDTO,
  AdminUpdateDTO,
} from '@/types/permission/admin'

const PREFIX = '/api/v1/admin/permission/admins'

/** 管理员列表（分页�?*/
export const getAdminPage = (params: AdminQueryDTO) => {
  return request.get<R<PageResult<AdminVO>>>(PREFIX, { params })
}

/** 管理员详�?*/
export const getAdminDetail = (id: string) => {
  return request.get<R<AdminVO>>(`${PREFIX}/${id}`)
}

/** 新增管理�?*/
export const addAdmin = (data: AdminAddDTO) => {
  return request.post<R<void>>(PREFIX, data)
}

/** 更新管理�?*/
export const updateAdmin = (id: string, data: AdminUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

/** 删除管理�?*/
export const deleteAdmin = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

/** 切换管理员状�?*/
export const toggleAdminStatus = (id: string) => {
  return request.put<R<void>>(`${PREFIX}/${id}/toggle-status`)
}
