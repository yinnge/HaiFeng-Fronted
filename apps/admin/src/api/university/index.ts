import { request } from '@haifeng/shared'
import type { R, PageResult, BasePageQuery } from '@haifeng/shared'

// ========== 类型定义 ==========

export interface UniversityListVO {
  id: string
  name: string
  code: string
  provinceId: number
  cityId: number
  type: string
  level: string
  is985: boolean
  is211: boolean
  status: number
  createdAt: string
}

export interface UniversityDetailVO extends UniversityListVO {
  description: string
  logo: string
  website: string
  address: string
  phone: string
}

export interface UniversityQueryDTO extends BasePageQuery {
  name?: string
  provinceId?: number
  type?: string
  is985?: boolean
  is211?: boolean
}

export interface UniversityAddDTO {
  name: string
  code: string
  provinceId: number
  cityId: number
  type: string
  level: string
  is985: boolean
  is211: boolean
  description?: string
}

export interface UniversityUpdateDTO extends Partial<UniversityAddDTO> {
  id: string
}

// ========== API 接口 ==========

/**
 * 分页查询院校列表
 */
export function getUniversityPage(params: UniversityQueryDTO) {
  return request.get<R<PageResult<UniversityListVO>>>('/api/v1/admin/university/page', { params })
}

/**
 * 获取院校详情
 */
export function getUniversityDetail(id: string) {
  return request.get<R<UniversityDetailVO>>(`/api/v1/admin/university/${id}`)
}

/**
 * 新增院校
 */
export function addUniversity(data: UniversityAddDTO) {
  return request.post<R<void>>('/api/v1/admin/university', data)
}

/**
 * 更新院校
 */
export function updateUniversity(id: string, data: UniversityUpdateDTO) {
  return request.put<R<void>>(`/api/v1/admin/university/${id}`, data)
}

/**
 * 删除院校
 */
export function deleteUniversity(id: string) {
  return request.delete<R<void>>(`/api/v1/admin/university/${id}`)
}
