import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { TeacherPositionListVO, TeacherPositionDetailVO, TeacherQueryDTO } from '@/types/employment/teacher'

export const getTeacherList = (params: TeacherQueryDTO) => {
  return request.get<R<PageResult<TeacherPositionListVO>>>('/api/v1/app/employment/teacher/list', { params })
}

export const getTeacherDetail = (id: number) => {
  return request.get<R<TeacherPositionDetailVO>>(`/api/v1/app/employment/teacher/${id}/detail`)
}
