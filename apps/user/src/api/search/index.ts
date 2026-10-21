import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { SearchItem, BizArticleSearchItem } from '@/types/search'

const PREFIX = '/api/v1/app/search'

/**
 * 跨模块资讯标题搜索（免登录）。
 * moduleName 传 null/'' = 查全部类型；传「高考/中考/考公/考研/英语四六级」则仅查该模块。
 */
export const searchArticle = (moduleName: string | null, keyword: string, limit = 10) => {
  return request.get<R<BizArticleSearchItem[]>>(`/api/v1/app/home/article/search`, {
    params: { keyword, moduleName: moduleName || undefined, limit },
  })
}

/**
 * 搜索大学
 */
export const searchUniversity = (keyword: string, limit = 10) => {
  return request.get<R<SearchItem[]>>(`${PREFIX}/university`, {
    params: { keyword, limit },
  })
}

/**
 * 搜索城市
 */
export const searchCity = (keyword: string, limit = 10) => {
  return request.get<R<SearchItem[]>>(`${PREFIX}/city`, {
    params: { keyword, limit },
  })
}

/**
 * 搜索专业
 */
export const searchMajor = (keyword: string, limit = 10) => {
  return request.get<R<SearchItem[]>>(`${PREFIX}/major`, {
    params: { keyword, limit },
  })
}
