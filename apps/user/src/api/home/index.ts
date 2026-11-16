import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type {
  SiteInfoVO, HomePageResult, AnnouncementListVO, AnnouncementDetailVO,
  PlannerListVO, PlannerDetailVO, PlannerAppointmentVO,
  InstitutionListVO, InstitutionDetailVO, InstitutionAppointmentVO,
  HomeArticleNewsVO, HomeArticleDetailVO,
} from '@/types/home'

const PREFIX = '/api/v1/app/home'
const ARTICLE_PREFIX = '/api/v1/app/home/article'

export const getSiteInfo = () =>
  request.get<R<SiteInfoVO>>(`${PREFIX}/site-info`)

export const getAnnouncements = (params: { page?: number; size?: number; tag?: string }) =>
  request.get<R<HomePageResult<AnnouncementListVO>>>(`${PREFIX}/announcements`, { params })

export const getAnnouncementDetail = (id: string) =>
  request.get<R<AnnouncementDetailVO>>(`${PREFIX}/announcements/${id}`)

/** 规划师列表（serviceTarget 必填：高考/考研；province 可选筛选） */
export const getPlanners = (params: { page?: number; size?: number; serviceTarget: string; province?: string }) =>
  request.get<R<HomePageResult<PlannerListVO>>>(`${PREFIX}/planners`, { params })

/** 该服务对象下实际存在的省份（供筛选按钮） */
export const getPlannerProvinces = (serviceTarget: string) =>
  request.get<R<string[]>>(`${PREFIX}/planners/provinces`, { params: { serviceTarget } })

export const getPlannerDetail = (id: string) =>
  request.get<R<PlannerDetailVO>>(`${PREFIX}/planners/${id}`)

/** 规划师预约信息（头像+姓名+联系方式，直连 DB 不缓存） */
export const getPlannerAppointment = (id: string) =>
  request.get<R<PlannerAppointmentVO>>(`${PREFIX}/planners/${id}/appointment`)

/** 机构列表（category 可选：高中冲刺小班/考公考编机构/央国企培训/职业培训机构；province 可选） */
export const getInstitutions = (params: { page?: number; size?: number; name?: string; category?: string; province?: string }) =>
  request.get<R<HomePageResult<InstitutionListVO>>>(`${PREFIX}/institutions`, { params })

export const getInstitutionDetail = (id: string) =>
  request.get<R<InstitutionDetailVO>>(`${PREFIX}/institutions/${id}`)

/** 机构预约信息（机构名+联系方式） */
export const getInstitutionAppointment = (id: string) =>
  request.get<R<InstitutionAppointmentVO>>(`${PREFIX}/institutions/${id}/appointment`)

/** 主页资讯（全部模块，按时间倒序，最新在前）：轻量列表，返回 模块名/标题/专栏名/年份/发布时间 */
export const getHomeArticleNews = (params: { page?: number; size?: number; moduleName?: string }) =>
  request.get<R<HomePageResult<HomeArticleNewsVO>>>(`${ARTICLE_PREFIX}/news`, { params })

/** 跨模块资讯详情（免登录，不限定模块；下架/不存在一律 404），正文为 HTML */
export const getHomeArticleDetail = (id: string | number) =>
  request.get<R<HomeArticleDetailVO>>(`${ARTICLE_PREFIX}/${id}`)
