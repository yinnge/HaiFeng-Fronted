/**
 * 统一响应结构 (与后端 R<T> 对应)
 */
export interface R<T = any> {
  code: number | string
  msg: string
  data: T
  timestamp: number
}

/**
 * 分页查询基类
 */
export interface BasePageQuery {
  page: number
  size: number
}

/**
 * 分页响应结构
 */
export interface PageResult<T> {
  total: number
  records: T[]
}

/**
 * 列表查询响应 (分页)
 */
export type PageResponse<T> = R<PageResult<T>>
