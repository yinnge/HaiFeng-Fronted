import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { GradeStatVO, SubjectEvaluationVO } from '@/types/university/subject-evaluation'

const PREFIX = '/api/v1/app/university'

export const getGradeStats = (universityId: number) =>
  request.get<R<GradeStatVO[]>>(`${PREFIX}/${universityId}/subject-evaluations/grade-stats`)

export const getSubjectEvaluationPage = (universityId: number, params: { page?: number; size?: number }) =>
  request.get<R<PageResult<SubjectEvaluationVO>>>(`${PREFIX}/${universityId}/subject-evaluations`, { params })
