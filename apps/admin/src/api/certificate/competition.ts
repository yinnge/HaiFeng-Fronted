import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  CompetitionListVO,
  CompetitionDetailVO,
  CompetitionQueryDTO,
  CompetitionAddDTO,
  CompetitionUpdateDTO,
} from '@/types/certificate/competition'

const PREFIX = '/api/v1/admin/competition'

export const getCompetitionPage = (params: CompetitionQueryDTO) => {
  return request.get<R<PageResult<CompetitionListVO>>>(`${PREFIX}/list`, { params })
}

export const getCompetitionDetail = (id: string) => {
  return request.get<R<CompetitionDetailVO>>(`${PREFIX}/${id}`)
}

export const addCompetition = (data: CompetitionAddDTO) => {
  return request.post<R<number>>(`${PREFIX}/add`, data)
}

export const updateCompetition = (data: CompetitionUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/update`, data)
}

export const enableCompetition = (id: string) => {
  return request.put<R<void>>(`${PREFIX}/${id}/enable`)
}

export const softDeleteCompetition = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/soft/${id}`)
}

export const hardDeleteCompetition = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/hard/${id}`)
}

export const batchDeleteCompetition = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch/delete`, { ids })
}
