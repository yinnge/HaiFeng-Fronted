import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { MajorListVO, MajorDetailVO, MajorCategoryStatVO, MajorQueryDTO, MajorRankingQueryDTO } from '@/types/major'

const PREFIX = '/api/v1/app/major'

export const getMajorList = (params: MajorQueryDTO) =>
  request.get<R<PageResult<MajorListVO>>>(`${PREFIX}/list`, { params })

export const getMajorDetail = (majorId: number) =>
  request.get<R<MajorDetailVO>>(`${PREFIX}/${majorId}/detail`)

export const getMajorCategoryStats = () =>
  request.get<R<MajorCategoryStatVO[]>>(`${PREFIX}/category-stats`)

export const getMajorRanking = (params: MajorRankingQueryDTO) =>
  request.get<R<PageResult<MajorListVO>>>(`${PREFIX}/ranking`, { params })
