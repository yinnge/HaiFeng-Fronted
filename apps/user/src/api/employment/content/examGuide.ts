import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { ExamGuideListVO, ExamGuideDetailVO, ExamGuideQueryDTO } from '@/types/employment/content/examGuide'

export const getExamGuideList = (params: ExamGuideQueryDTO) => {
  return request.get<R<PageResult<ExamGuideListVO>>>('/api/v1/app/employment/content/exam-guide/list', { params })
}

export const getExamGuideDetail = (id: number) => {
  return request.get<R<ExamGuideDetailVO>>(`/api/v1/app/employment/content/exam-guide/${id}`)
}
