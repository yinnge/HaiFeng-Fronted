import type { BasePageQuery } from '@haifeng/shared'

/** 管理员列表 VO */
export interface AdminVO {
  id: number
  username: string
  realName?: string
  phone: string
  email?: string
  avatar?: string
  roleId: number
  roleName: string
  status: number
  isTotpEnabled: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

/** 管理员查询 DTO */
export interface AdminQueryDTO extends BasePageQuery {
  username?: string
  phone?: string
  realName?: string
  status?: number
}

/** 管理员新增 DTO */
export interface AdminAddDTO {
  username: string
  password: string
  realName?: string
  phone: string
  email?: string
  avatar?: string
  roleId: number
}

/** 管理员更新 DTO */
export interface AdminUpdateDTO {
  username: string
  password?: string
  realName?: string
  phone: string
  email?: string
  avatar?: string
  roleId: number
  status?: number
}
