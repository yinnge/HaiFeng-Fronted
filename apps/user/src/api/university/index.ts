import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  UniversityListVO,
  UniversityQueryDTO,
  UniversityDetailVO,
  GuideOverviewVO,
  GuideCategoryVO,
  GalleryItemVO,
} from '@/types/university'

const PREFIX = '/api/v1/app/university'

export const getUniversityList = (params: UniversityQueryDTO) =>
  request.get<R<PageResult<UniversityListVO>>>(`${PREFIX}/list`, { params })

export const getUniversityDetail = (id: number) =>
  request.get<R<UniversityDetailVO>>(`${PREFIX}/${id}/detail`)

export const getGuideOverview = (id: number) =>
  request.get<R<GuideOverviewVO>>(`${PREFIX}/guides/${id}/overview`)

export const getGuideSurvival = (id: number) =>
  request.get<R<GuideCategoryVO>>(`${PREFIX}/guides/${id}/survival`)

export const getGuideAcademic = (id: number) =>
  request.get<R<GuideCategoryVO>>(`${PREFIX}/guides/${id}/academic`)

export const getGuideSocial = (id: number) =>
  request.get<R<GuideCategoryVO>>(`${PREFIX}/guides/${id}/social`)

export const getGuideSafety = (id: number) =>
  request.get<R<GuideCategoryVO>>(`${PREFIX}/guides/${id}/safety`)

export const getGuideLife = (id: number) =>
  request.get<R<GuideCategoryVO>>(`${PREFIX}/guides/${id}/life`)

export const getCampusGallery = (id: number, params: { page?: number; size?: number; imageType?: string }) =>
  request.get<R<PageResult<GalleryItemVO>>>(`${PREFIX}/${id}/gallery`, { params })
