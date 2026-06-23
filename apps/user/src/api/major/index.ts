import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { MajorListVO, MajorDetailVO, MajorCategoryStatVO, MajorQueryDTO, MajorRankingQueryDTO } from '@/types/major'
import type { CompetitionBriefVO } from '@/types/certificate'
import type { PostgradMajorDirectionBriefVO } from '@/types/postgrad-major'

const PREFIX = '/api/v1/app/major'

export const getMajorList = (params: MajorQueryDTO) =>
  request.get<R<PageResult<MajorListVO>>>(`${PREFIX}/list`, { params })

export const getMajorDetail = (majorId: number) =>
  request.get<R<MajorDetailVO>>(`${PREFIX}/${majorId}/detail`)

export const getMajorCategoryStats = () =>
  request.get<R<MajorCategoryStatVO[]>>(`${PREFIX}/category-stats`)

export const getMajorRanking = (params: MajorRankingQueryDTO) =>
  request.get<R<PageResult<MajorListVO>>>(`${PREFIX}/ranking`, { params })

export const getMajorCompetitions = (majorId: number, params: { page: number; size: number }) =>
  request.get<R<PageResult<CompetitionBriefVO>>>(`${PREFIX}/${majorId}/competitions`, { params })

export const getMajorPostgradDirections = (majorId: number, params: { page: number; size: number }) =>
  request.get<R<PageResult<PostgradMajorDirectionBriefVO>>>(`${PREFIX}/${majorId}/postgrad-directions`, { params })
