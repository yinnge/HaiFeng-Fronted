import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { SearchItem } from '@/types/search'

const PREFIX = '/api/v1/app/search'

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
