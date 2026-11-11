import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { MajorListVO, MajorDetailVO, MajorCategoryStatVO, MajorQueryDTO, MajorRankingQueryDTO } from '@/types/major'
import type { CompetitionBriefVO } from '@/types/certificate'
import type { PostgradMajorDirectionBriefVO } from '@/types/postgrad-major'

const PREFIX = '/api/v1/app/major'

export const getMajorList = (params: MajorQueryDTO) =>
  request.get<R<PageResult<MajorListVO>>>(`${PREFIX}/list`, { params })

export const getMajorDetail = (majorId: string) =>
  request.get<R<MajorDetailVO>>(`${PREFIX}/${majorId}/detail`)

export const getMajorCategoryStats = () =>
  request.get<R<MajorCategoryStatVO[]>>(`${PREFIX}/category-stats`)

/**
 * 授予学位候选值：入参与 /list 一致（后端继承 BasePageQueryDTO，size 必须落在 [10,100]），
 * 按当前其它筛选条件跨全量去重返回。注意不要带上 degreeAwarded 自身，
 * 否则后端的 eq 条件会把候选值锁死成当前选中项。
 */
export const getDegreeAwardedOptions = (params: MajorQueryDTO) =>
  request.get<R<string[]>>(`${PREFIX}/degree-awarded/options`, { params })

export const getMajorRanking = (params: MajorRankingQueryDTO) =>
  request.get<R<PageResult<MajorListVO>>>(`${PREFIX}/ranking`, { params })

export const getMajorCompetitions = (majorId: string, params: { page: number; size: number }) =>
  request.get<R<PageResult<CompetitionBriefVO>>>(`${PREFIX}/${majorId}/competitions`, { params })

export const getMajorPostgradDirections = (majorId: string, params: { page: number; size: number }) =>
  request.get<R<PageResult<PostgradMajorDirectionBriefVO>>>(`${PREFIX}/${majorId}/postgrad-directions`, { params })
