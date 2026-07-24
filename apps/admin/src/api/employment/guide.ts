import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  ExamGuideListVO,
  ExamGuideDetailVO,
  ExamGuideQueryDTO,
  ExamGuideUpdateDTO,
  StatusDTO,
} from '@/types/employment/guide'

const PREFIX = '/api/v1/admin/employment/content-management/exam-guide'

export const getExamGuidePage = (params: ExamGuideQueryDTO) => {
  return request.get<R<PageResult<ExamGuideListVO>>>(`${PREFIX}/list`, { params })
}

export const getExamGuideDetail = (id: string) => {
  return request.get<R<ExamGuideDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const updateExamGuide = (id: string, data: ExamGuideUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteExamGuide = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateExamGuideStatus = (id: string, data: StatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteExamGuide = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}
