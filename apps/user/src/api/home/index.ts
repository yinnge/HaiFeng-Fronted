import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { SiteInfoVO, HomePageResult, AnnouncementListVO, AnnouncementDetailVO, PlannerListVO, PlannerDetailVO, InstitutionListVO, InstitutionDetailVO, HomeArticleNewsVO, HomeArticleDetailVO } from '@/types/home'

const PREFIX = '/api/v1/app/home'
const ARTICLE_PREFIX = '/api/v1/app/home/article'

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

/** 主页资讯（全部模块，按时间倒序，最新在前）：轻量列表，返回 模块名/标题/专栏名/年份/发布时间 */
export const getHomeArticleNews = (params: { page?: number; size?: number; moduleName?: string }) =>
  request.get<R<HomePageResult<HomeArticleNewsVO>>>(`${ARTICLE_PREFIX}/news`, { params })

/** 跨模块资讯详情（免登录，不限定模块；下架/不存在一律 404），正文为 HTML */
export const getHomeArticleDetail = (id: string | number) =>
  request.get<R<HomeArticleDetailVO>>(`${ARTICLE_PREFIX}/${id}`)
