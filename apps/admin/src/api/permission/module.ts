// apps/admin/src/api/permission/module.ts
import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type {
  ModuleTreeVO,
  ModuleQueryDTO,
  ModuleAddDTO,
  ModuleUpdateDTO,
} from '@/types/permission/module'

const PREFIX = '/api/v1/admin/permission/modules'

/** 模块列表（树形） */
export const getModuleTree = (params?: ModuleQueryDTO) => {
  return request.get<R<ModuleTreeVO[]>>(PREFIX, { params })
}

/** 新增模块 */
export const addModule = (data: ModuleAddDTO) => {
  return request.post<R<void>>(PREFIX, data)
}

/** 更新模块 */
export const updateModule = (id: string, data: ModuleUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

/** 删除模块 */
export const deleteModule = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

/** 切换模块状�?*/
export const toggleModuleStatus = (id: string) => {
  return request.put<R<void>>(`${PREFIX}/${id}/toggle-status`)
}
