import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  UniversityListVO,
  UniversityQueryDTO,
  UniversityDetailVO,
  GuideOverviewVO,
  GuideCategoryVO,
  GalleryItemVO,
  ChannelListVO,
  ChannelOptionVO,
  ChannelQueryDTO,
  AdmissionGroupListVO,
  AdmissionGroupDetailVO,
  AdmissionGroupQueryDTO,
  MajorScoreVO,
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

// === 通道-大学关联 ===
export const getUniversityChannels = (universityId: number, params: ChannelQueryDTO) =>
  request.get<R<PageResult<ChannelListVO>>>(`${PREFIX}/${universityId}/channels`, { params })

export const getChannelOptions = () =>
  request.get<R<ChannelOptionVO[]>>(`${PREFIX}/channel-options`)

// === 录取专业组 ===
export const getAdmissionGroupPage = (universityId: number, params: AdmissionGroupQueryDTO) =>
  request.get<R<PageResult<AdmissionGroupListVO>>>(`${PREFIX}/admission-group/${universityId}`, { params })

export const getAdmissionGroupDetail = (groupId: number) =>
  request.get<R<AdmissionGroupDetailVO>>(`${PREFIX}/admission-group/${groupId}/detail`)

export const getMajorScores = (groupId: number) =>
  request.get<R<MajorScoreVO[]>>(`${PREFIX}/admission-group/${groupId}/scores`)
