import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { SiteInfoVO, HomePageResult, AnnouncementListVO, AnnouncementDetailVO, PlannerListVO, PlannerDetailVO, InstitutionListVO, InstitutionDetailVO } from '@/types/home'

const PREFIX = '/api/v1/app/home'

export const getSiteInfo = () =>
  request.get<R<SiteInfoVO>>(`${PREFIX}/site-info`)

export const getAnnouncements = (params: { page?: number; size?: number; tag?: string }) =>
  request.get<R<HomePageResult<AnnouncementListVO>>>(`${PREFIX}/announcements`, { params })

export const getAnnouncementDetail = (id: string) =>
  request.get<R<AnnouncementDetailVO>>(`${PREFIX}/announcements/${id}`)

export const getPlanners = (params: { page?: number; size?: number; region?: string }) =>
  request.get<R<HomePageResult<PlannerListVO>>>(`${PREFIX}/planners`, { params })

export const getPlannerDetail = (id: string) =>
  request.get<R<PlannerDetailVO>>(`${PREFIX}/planners/${id}`)

export const getInstitutions = (params: { page?: number; size?: number; name?: string }) =>
  request.get<R<HomePageResult<InstitutionListVO>>>(`${PREFIX}/institutions`, { params })

export const getInstitutionDetail = (id: string) =>
  request.get<R<InstitutionDetailVO>>(`${PREFIX}/institutions/${id}`)
