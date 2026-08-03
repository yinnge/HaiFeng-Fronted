import { request } from '@haifeng/shared'
import type { R, PageResult } from '@haifeng/shared'
import type {
  MajorListVO,
  MajorDetailVO,
  MajorQueryDTO,
  MajorAddDTO,
  MajorUpdateDTO,
  MajorDetailUpdateDTO,
  PostgradMajorListVO,
  PostgradMajorDetailVO,
  PostgradMajorQueryDTO,
  PostgradMajorAddDTO,
  PostgradMajorUpdateDTO,
  PostgradUnivListVO,
  PostgradUnivQueryDTO,
  PostgradUnivAddDTO,
  MajorPostgradDirectionListVO,
  MajorPostgradDirectionDetailVO,
  MajorPostgradDirectionQueryDTO,
  MajorPostgradDirectionAddDTO,
  MajorPostgradDirectionUpdateDTO,
} from '@/types/major'

export interface BatchDeleteDTO {
  ids: number[]
}

export interface ImportResultVO {
  total: number
  success: number
  failed: number
  errors: string[]
}

// ========== 专业管理 ==========

export const getMajorPage = (params: MajorQueryDTO) => {
  return request.get<R<PageResult<MajorListVO>>>('/api/v1/admin/major/list', { params })
}

export const getMajorDetail = (id: string) => {
  return request.get<R<MajorDetailVO>>(`/api/v1/admin/major/${id}`)
}

export const addMajor = (data: MajorAddDTO) => {
  return request.post<R<number>>('/api/v1/admin/major', data)
}

export const updateMajor = (id: string, data: MajorUpdateDTO) => {
  return request.put<R<void>>(`/api/v1/admin/major/${id}`, data)
}

export const updateMajorDetail = (id: string, data: MajorDetailUpdateDTO) => {
  return request.put<R<void>>(`/api/v1/admin/major/${id}/detail`, data)
}

export const updateMajorStatus = (id: string, status: number) => {
  return request.put<R<void>>(`/api/v1/admin/major/${id}/status`, { status })
}

export const deleteMajor = (id: string) => {
  return request.delete<R<void>>(`/api/v1/admin/major/${id}`)
}

export const hardDeleteMajor = (id: string) => {
  return request.delete<R<void>>(`/api/v1/admin/major/${id}/hard`)
}

export const batchSoftDeleteMajor = (data: BatchDeleteDTO) => {
  return request.post<R<void>>('/api/v1/admin/major/batch-soft-delete', data)
}

export const batchHardDeleteMajor = (data: BatchDeleteDTO) => {
  return request.post<R<void>>('/api/v1/admin/major/batch-hard-delete', data)
}

export const importMajor = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<ImportResultVO>>('/api/v1/admin/major/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importMajorDetail = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<ImportResultVO>>('/api/v1/admin/major/import-detail', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const restoreMajor = (id: string) => {
  return request.put<R<void>>(`/api/v1/admin/major/${id}/restore`)
}

// ========== 考研专业管理 ==========

export const getPostgradMajorPage = (params: PostgradMajorQueryDTO) => {
  return request.get<R<PageResult<PostgradMajorListVO>>>('/api/v1/admin/postgrad-major/list', { params })
}

export const getPostgradMajorDetail = (id: string) => {
  return request.get<R<PostgradMajorDetailVO>>(`/api/v1/admin/postgrad-major/${id}`)
}

export const addPostgradMajor = (data: PostgradMajorAddDTO) => {
  return request.post<R<number>>('/api/v1/admin/postgrad-major', data)
}

export const updatePostgradMajor = (id: string, data: PostgradMajorUpdateDTO) => {
  return request.put<R<void>>(`/api/v1/admin/postgrad-major/${id}`, data)
}

export const updatePostgradMajorStatus = (id: string, status: number) => {
  return request.put<R<void>>(`/api/v1/admin/postgrad-major/${id}/status`, { status })
}

export const deletePostgradMajor = (id: string) => {
  return request.delete<R<void>>(`/api/v1/admin/postgrad-major/${id}`)
}

export const hardDeletePostgradMajor = (id: string) => {
  return request.delete<R<void>>(`/api/v1/admin/postgrad-major/${id}/hard`)
}

export const batchSoftDeletePostgradMajor = (data: BatchDeleteDTO) => {
  return request.post<R<void>>('/api/v1/admin/postgrad-major/batch-soft-delete', data)
}

export const batchHardDeletePostgradMajor = (data: BatchDeleteDTO) => {
  return request.post<R<void>>('/api/v1/admin/postgrad-major/batch-hard-delete', data)
}

export const importPostgradMajor = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<ImportResultVO>>('/api/v1/admin/postgrad-major/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const restorePostgradMajor = (id: string) => {
  return request.put<R<void>>(`/api/v1/admin/postgrad-major/${id}/restore`)
}

// ========== 考研专业-大学关联管理 ==========

export const getPostgradUnivPage = (params: PostgradUnivQueryDTO) => {
  return request.get<R<PageResult<PostgradUnivListVO>>>('/api/v1/admin/postgrad-major-university/list', { params })
}

export const addPostgradUniv = (data: PostgradUnivAddDTO) => {
  return request.post<R<number>>('/api/v1/admin/postgrad-major-university', data)
}

export const deletePostgradUniv = (id: string) => {
  return request.delete<R<void>>(`/api/v1/admin/postgrad-major-university/${id}`)
}

export const hardDeletePostgradUniv = (id: string) => {
  return request.delete<R<void>>(`/api/v1/admin/postgrad-major-university/${id}/hard`)
}

export const batchSoftDeletePostgradUniv = (data: BatchDeleteDTO) => {
  return request.post<R<void>>('/api/v1/admin/postgrad-major-university/batch-soft-delete', data)
}

export const batchHardDeletePostgradUniv = (data: BatchDeleteDTO) => {
  return request.post<R<void>>('/api/v1/admin/postgrad-major-university/batch-hard-delete', data)
}

export const importPostgradUniv = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<ImportResultVO>>('/api/v1/admin/postgrad-major-university/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const restorePostgradUniv = (id: string) => {
  return request.put<R<void>>(`/api/v1/admin/postgrad-major-university/${id}/restore`)
}

// ========== 考研专业关联管理 ==========

export const getMajorPostgradDirectionPage = (params: MajorPostgradDirectionQueryDTO) => {
  return request.get<R<PageResult<MajorPostgradDirectionListVO>>>('/api/v1/admin/major-postgrad-direction/list', { params })
}

export const getMajorPostgradDirectionDetail = (id: string) => {
  return request.get<R<MajorPostgradDirectionDetailVO>>(`/api/v1/admin/major-postgrad-direction/${id}`)
}

export const addMajorPostgradDirection = (data: MajorPostgradDirectionAddDTO) => {
  return request.post<R<void>>('/api/v1/admin/major-postgrad-direction/add', data)
}

export const updateMajorPostgradDirection = (id: string, data: MajorPostgradDirectionUpdateDTO) => {
  return request.put<R<void>>(`/api/v1/admin/major-postgrad-direction/${id}`, data)
}

export const deleteMajorPostgradDirection = (id: string) => {
  return request.delete<R<void>>(`/api/v1/admin/major-postgrad-direction/${id}`)
}

export const batchDeleteMajorPostgradDirection = (data: BatchDeleteDTO) => {
  return request.post<R<void>>('/api/v1/admin/major-postgrad-direction/batch-delete', data)
}

export const importMajorPostgradDirection = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<ImportResultVO>>('/api/v1/admin/major-postgrad-direction/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
