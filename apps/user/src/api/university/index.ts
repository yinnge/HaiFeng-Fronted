import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  UniversityListVO,
  UniversityQueryDTO,
  UniversityStatsVO,
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

/** 院校统计概览（985/211/双一流/本科数量），免登录，不受列表筛选影响 */
export const getUniversityStats = () => request.get<R<UniversityStatsVO>>(`${PREFIX}/stats`)

/** 招生类型筛选下拉选项（t_special_channel，is_active=true，按 sort_order 升序） */
export const getSpecialChannelOptions = () =>
  request.get<R<ChannelOptionVO[]>>(`${PREFIX}/special-channel-options`)

export const getUniversityDetail = (id: string) =>
  request.get<R<UniversityDetailVO>>(`${PREFIX}/${id}/detail`)

export const getGuideOverview = (id: string) =>
  request.get<R<GuideOverviewVO>>(`${PREFIX}/guides/${id}/overview`)

export const getGuideSurvival = (id: string) =>
  request.get<R<GuideCategoryVO>>(`${PREFIX}/guides/${id}/survival`)

export const getGuideAcademic = (id: string) =>
  request.get<R<GuideCategoryVO>>(`${PREFIX}/guides/${id}/academic`)

export const getGuideSocial = (id: string) =>
  request.get<R<GuideCategoryVO>>(`${PREFIX}/guides/${id}/social`)

export const getGuideSafety = (id: string) =>
  request.get<R<GuideCategoryVO>>(`${PREFIX}/guides/${id}/safety`)

export const getGuideLife = (id: string) =>
  request.get<R<GuideCategoryVO>>(`${PREFIX}/guides/${id}/life`)

export const getCampusGallery = (id: string, params: { page?: number; size?: number; imageType?: string }) =>
  request.get<R<PageResult<GalleryItemVO>>>(`${PREFIX}/${id}/gallery`, { params })

export const getGalleryTypes = (id: string) =>
  request.get<R<string[]>>(`${PREFIX}/${id}/gallery/types`)

// === 通道-大学关联 ===
export const getUniversityChannels = (universityId: string, params: ChannelQueryDTO) =>
  request.get<R<PageResult<ChannelListVO>>>(`${PREFIX}/${universityId}/channels`, { params })

export const getChannelOptions = () =>
  request.get<R<ChannelOptionVO[]>>(`${PREFIX}/channel-options`)

// === 录取专业组 ===
export const getAdmissionGroupPage = (universityId: string, params: AdmissionGroupQueryDTO) =>
  request.get<R<PageResult<AdmissionGroupListVO>>>(`${PREFIX}/admission-group/${universityId}`, { params })

export const getAdmissionGroupDetail = (groupId: string) =>
  request.get<R<AdmissionGroupDetailVO>>(`${PREFIX}/admission-group/${groupId}/detail`)

export const getMajorScores = (groupId: string) =>
  request.get<R<MajorScoreVO[]>>(`${PREFIX}/admission-group/${groupId}/scores`)
