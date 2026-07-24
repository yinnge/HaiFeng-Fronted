import request from '@haifeng/shared/utils/request'
import type {
  DepartmentListVO,
  DepartmentDetailVO,
  DepartmentQueryDTO,
  DepartmentAddDTO,
  DepartmentUpdateDTO,
} from '@/types/university/department'
import type { R, PageResponse } from '@haifeng/shared'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/university/department'

export const getDepartmentPage = (
  params: DepartmentQueryDTO,
): Promise<AxiosResponse<PageResponse<DepartmentListVO>>> =>
  request.get(`${PREFIX}/list`, { params })

export const getDepartmentDetail = (
  id: string,
): Promise<AxiosResponse<R<DepartmentDetailVO>>> =>
  request.get(`${PREFIX}/${id}`)

export const addDepartment = (
  data: DepartmentAddDTO,
): Promise<AxiosResponse<R<number>>> =>
  request.post(PREFIX, data)

export const updateDepartment = (
  id: string,
  data: DepartmentUpdateDTO,
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}`, data)

export const updateDepartmentStatus = (
  id: string,
  data: { status: number },
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}/status`, data)

export const deleteDepartment = (id: string): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}`)

export const hardDeleteDepartment = (
  id: string,
): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}/hard`)

export const batchDeleteDepartment = (
  ids: number[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-delete`, { ids })

export const batchHardDeleteDepartment = (
  ids: number[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-hard-delete`, { ids })

export const importDepartment = (file: File): Promise<AxiosResponse<R<void>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
