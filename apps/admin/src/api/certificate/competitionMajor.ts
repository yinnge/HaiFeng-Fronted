import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  CompetitionMajorListVO,
  CompetitionMajorQueryDTO,
  CompetitionMajorAddDTO,
} from '@/types/certificate/competitionMajor'

const PREFIX = '/api/v1/admin/competition-major'

export const getCompetitionMajorPage = (params: CompetitionMajorQueryDTO) => {
  return request.get<R<PageResult<CompetitionMajorListVO>>>(`${PREFIX}/list`, { params })
}

export const getByCompetitionId = (competitionId: number) => {
  return request.get<R<CompetitionMajorListVO[]>>(`${PREFIX}/by-competition/${competitionId}`)
}

export const getByMajorId = (majorId: number) => {
  return request.get<R<CompetitionMajorListVO[]>>(`${PREFIX}/by-major/${majorId}`)
}

export const addCompetitionMajor = (data: CompetitionMajorAddDTO) => {
  return request.post<R<number>>(`${PREFIX}/add`, data)
}

export const deleteCompetitionMajor = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

export const enableCompetitionMajor = (id: string) => {
  return request.put<R<void>>(`${PREFIX}/${id}/enable`)
}

export const hardDeleteCompetitionMajor = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/hard/${id}`)
}

export const batchDeleteCompetitionMajor = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch/delete`, { ids })
}
