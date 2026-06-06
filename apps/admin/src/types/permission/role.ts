import type { BasePageQuery } from '@haifeng/shared'

/** 角色列表 VO */
export interface RoleVO {
  id: number
  roleName: string
  roleCode: string
  description?: string
  status: number
  createdAt: string
  updatedAt: string
}

/** 角色查询 DTO */
export interface RoleQueryDTO extends BasePageQuery {
  roleName?: string
  status?: number
}

/** 角色新增 DTO */
export interface RoleAddDTO {
  roleName: string
  roleCode: string
  description?: string
}

/** 角色更新 DTO */
export interface RoleUpdateDTO {
  roleName: string
  roleCode: string
  description?: string
}

/** 角色绑定模块 DTO */
export interface RoleBindModulesDTO {
  moduleIds: number[]
}
