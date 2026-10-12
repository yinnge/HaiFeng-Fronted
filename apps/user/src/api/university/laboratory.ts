import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { LaboratoryListVO, LaboratoryDetailVO } from '@/types/university/laboratory'

const PREFIX = '/api/v1/app/university'

export const getLaboratoryPage = (
  universityId: string,
  params: { page?: number; size?: number; labType?: string }
) =>
  request.get<R<PageResult<LaboratoryListVO>>>(`${PREFIX}/${universityId}/laboratories`, {
    params,
  })

/** 实验室类型清单（去重，用于筛选按钮，全量返回不受分页影响） */
export const getLaboratoryTypes = (universityId: string) =>
  request.get<R<string[]>>(`${PREFIX}/${universityId}/laboratories/types`)

export const getLaboratoryDetail = (labId: string) =>
  request.get<R<LaboratoryDetailVO>>(`${PREFIX}/laboratories/${labId}`)
