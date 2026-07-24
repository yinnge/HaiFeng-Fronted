import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  TeacherListVO,
  TeacherDetailVO,
  TeacherQueryDTO,
  TeacherUpdateDTO,
  PositionStatusDTO,
} from '@/types/employment/teacher'

const PREFIX = '/api/v1/admin/employment/industry-position/teacher'

export const getTeacherPage = (params: TeacherQueryDTO) => {
  return request.get<R<PageResult<TeacherListVO>>>(`${PREFIX}/list`, { params })
}

export const getTeacherDetail = (id: string) => {
  return request.get<R<TeacherDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const updateTeacher = (id: string, data: TeacherUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteTeacher = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateTeacherStatus = (id: string, data: PositionStatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteTeacher = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const preValidateTeacher = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/pre-validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importTeacher = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
