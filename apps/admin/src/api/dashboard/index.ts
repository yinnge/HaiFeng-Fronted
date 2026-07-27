import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { DashboardStatsVO, TrendDataVO } from '@/types/dashboard'

const PREFIX = '/api/v1/admin/dashboard'

/** 获取仪表盘统计数据 */
export const getDashboardStats = () => {
  return request.get<R<DashboardStatsVO>>(`${PREFIX}/stats`)
}

/** 获取用户增长趋势 */
export const getMemberTrend = (days: number) => {
  return request.get<R<TrendDataVO>>(`${PREFIX}/member-trend`, { params: { days } })
}

/** 获取订单趋势 */
export const getOrderTrend = (days: number) => {
  return request.get<R<TrendDataVO>>(`${PREFIX}/order-trend`, { params: { days } })
}
