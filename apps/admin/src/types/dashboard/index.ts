/** 用户统计 */
export interface MemberStats {
  totalMembers: number
  proMembers: number
  vipMembers: number
}

/** 订单统计 */
export interface OrderStats {
  pendingOrders: number
  totalAmount: number
}

/** 实体统计 */
export interface EntityStats {
  universityCount: number
  majorCount: number
  industryCount: number
  enterpriseCount: number
  admissionGroupCount: number
  admissionMajorScoreCount: number
}

/** 仪表盘统计数据 VO */
export interface DashboardStatsVO {
  memberStats: MemberStats
  orderStats: OrderStats
  entityStats: EntityStats
}

/** 趋势数据 VO */
export interface TrendDataVO {
  dates: string[]
  values: number[]
}
