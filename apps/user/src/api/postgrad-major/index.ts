import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { PostgradMajorListVO, PostgradMajorDetailVO, PostgradMajorQueryDTO, PostgradMajorBriefVO, UniversityBriefForPostgradVO } from '@/types/postgrad-major'
import type { UndergraduateMajorDirectionBriefVO } from '@/types/major'

const PREFIX = '/api/v1/app/postgrad-major'

export const getPostgradMajorList = (params: PostgradMajorQueryDTO) =>
  request.get<R<PageResult<PostgradMajorListVO>>>(`${PREFIX}/list`, { params })

export const getPostgradMajorDetail = (majorId: string) =>
  request.get<R<PostgradMajorDetailVO>>(`${PREFIX}/${majorId}/detail`)

export const getPostgradMajorsByUniversity = (universityId: string, params: { page?: number; size?: number; degreeType?: string }) =>
  request.get<R<PageResult<PostgradMajorBriefVO>>>(`/api/v1/app/university/${universityId}/postgrad-majors`, { params })

export const getUniversitiesByPostgradMajor = (majorId: string, params: { page?: number; size?: number; category?: string }) =>
  request.get<R<PageResult<UniversityBriefForPostgradVO>>>(`${PREFIX}/${majorId}/universities`, { params })

export const getPostgradMajorUndergraduateMajors = (postgradMajorId: string, params: { page: number; size: number }) =>
  request.get<R<PageResult<UndergraduateMajorDirectionBriefVO>>>(`/api/v1/app/postgrad-major/${postgradMajorId}/undergraduate-majors`, { params })

export const getPostgradMajorDisciplineCategories = () =>
  request.get<R<string[]>>(`${PREFIX}/discipline-categories`)
