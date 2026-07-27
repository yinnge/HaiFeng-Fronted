import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { DashboardStatsVO } from '@/types/dashboard'

const PREFIX = '/api/v1/admin/dashboard'

/** 获取仪表盘统计数据 */
export const getDashboardStats = () => {
  return request.get<R<DashboardStatsVO>>(`${PREFIX}/stats`)
}
