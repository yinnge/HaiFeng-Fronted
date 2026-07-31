import type { BasePageQuery } from '@haifeng/shared'

/** 管理员列�?VO */
export interface AdminVO {
  id: string
  username: string
  realName?: string
  phone: string
  email?: string
  avatar?: string
  roleId: string
  roleName: string
  roleCode?: string
  status: number
  isTotpEnabled: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

/** 管理员查�?DTO */
export interface AdminQueryDTO extends BasePageQuery {
  username?: string
  phone?: string
  realName?: string
  status?: number
}

/** 管理员新�?DTO */
export interface AdminAddDTO {
  username: string
  password: string
  realName?: string
  phone: string
  email?: string
  avatar?: string
  roleId: string
}

/** 管理员更�?DTO */
export interface AdminUpdateDTO {
  username: string
  password?: string
  realName?: string
  phone: string
  email?: string
  avatar?: string
  roleId: string
  status?: number
}
