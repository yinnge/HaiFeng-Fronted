/**
 * 高考热点资讯（C 端免登录接口）
 * 对应后端: com.haifeng.app.controller.algorithm.article.GaokaoArticleController
 * 列表按省份精准查询（省份取自用户高考档案，档案变更后需重新拉取）
 */
import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'

const PREFIX = '/api/v1/app/algorithm/article/gaokao'

/** C 端列表 VO（无发布时间，前端按 columnName 归类排版） */
export interface GaokaoArticleListVO {
  id: string
  columnName: string
  title: string
  summary: string | null
}

/** C 端详情 VO（含富文本正文） */
export interface GaokaoArticleDetailVO {
  province: string | null
  year: number | null
  columnName: string
  title: string
  summary: string | null
  content: string
  viewCount: number
  publishTime: string | null
}

/**
 * 分页查询高考热点资讯（province 必填）
 * 注意：后端 BasePageQueryDTO 强约束 size ∈ [10, 100]，首页展示 4 条时请求 size=10 后前端截取
 */
export const getGaokaoArticlePage = (params: { province: string; page: number; size: number }) =>
  request.get<R<{ records: GaokaoArticleListVO[]; total: number }>>(`${PREFIX}/list`, { params })

/** 高考热点资讯详情（含富文本正文，免登录） */
export const getGaokaoArticleDetail = (id: string) =>
  request.get<R<GaokaoArticleDetailVO>>(`${PREFIX}/${id}`)
