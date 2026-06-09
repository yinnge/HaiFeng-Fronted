import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { LaboratoryListVO, LaboratoryDetailVO } from '@/types/university/laboratory'

const PREFIX = '/api/v1/app/university'

export const getLaboratoryPage = (universityId: number, params: { page?: number; size?: number }) =>
  request.get<R<PageResult<LaboratoryListVO>>>(`${PREFIX}/${universityId}/laboratories`, { params })

export const getLaboratoryDetail = (labId: number) =>
  request.get<R<LaboratoryDetailVO>>(`${PREFIX}/laboratories/${labId}`)
