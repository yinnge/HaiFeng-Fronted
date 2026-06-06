import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  AdminLogListVO,
  AdminLogDetailVO,
  AdminLogQueryDTO,
  AdminLogBatchDeleteDTO,
} from '@/types/system/log'

const PREFIX = '/api/v1/admin/system/logs'

/** 分页查询操作日志 */
export const getLogPage = (params: AdminLogQueryDTO) => {
  return request.get<R<PageResult<AdminLogListVO>>>(`${PREFIX}/list`, { params })
}

/** 获取操作日志详情 */
export const getLogDetail = (id: number) => {
  return request.get<R<AdminLogDetailVO>>(`${PREFIX}/${id}`)
}

/** 批量删除操作日志 */
export const batchDeleteLogs = (data: AdminLogBatchDeleteDTO) => {
  return request.delete<R<number>>(`${PREFIX}/batch`, { data })
}
