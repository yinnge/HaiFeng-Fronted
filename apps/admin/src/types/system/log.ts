import type { BasePageQuery } from '@haifeng/shared'

/** 操作日志列表 VO */
export interface AdminLogListVO {
  id: string
  adminName: string
  operation: string
  requestMethod: string
  result: 'SUCCESS' | 'FAIL'
  ip: string
  createdAt: string
}

/** 操作日志详情 VO */
export interface AdminLogDetailVO extends AdminLogListVO {
  adminId: string
  requestPath: string
  requestParams: string
  errorMsg?: string
}

/** 操作日志查询 DTO */
export interface AdminLogQueryDTO extends BasePageQuery {
  adminName?: string
  result?: 'SUCCESS' | 'FAIL'
  requestMethod?: string
}

/** 操作日志批量删除 DTO */
export interface AdminLogBatchDeleteDTO {
  type: 'ids' | 'lastMonth' | 'all'
  ids?: string[]
}
