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

/** 系统信息 VO */
export interface SystemInfoVO {
  appVersion: string
  springVersion: string
  javaVersion: string
  siteName: string
  aiProvider: string
  aiModel: string
  adminCount: number
}

/** 待处理订单项 */
export interface PendingOrderItem {
  id: number
  orderNo: string
  memberName: string
  amount: number
  createdAt: string
}

/** 待处理提现项 */
export interface PendingWithdrawItem {
  id: number
  memberName: string
  amount: number
  createdAt: string
}

/** 待办事项 VO */
export interface TodoListVO {
  pendingOrderCount: number
  pendingOrders: PendingOrderItem[]
  pendingWithdrawCount: number
  pendingWithdraws: PendingWithdrawItem[]
}

/** 仪表盘概览 VO */
export interface DashboardOverviewVO {
  systemInfo: SystemInfoVO
  todoList: TodoListVO
}

/** 系统资源（CPU / 内存）使用情况 VO
 *  数值字段可能因后端序列化表现为 number 或 string，前端统一按 number | string 处理
 */
export interface SystemResourceVO {
  osName: string | null
  osArch: string | null
  cpuCores: number | string | null
  totalMemoryGb: number | string | null
  usedMemoryGb: number | string | null
  freeMemoryGb: number | string | null
  /** 内存使用率（%，0~100） */
  memoryUsageRate: number | string | null
  /** CPU 使用率（%，0~100）；部分容器/JDK 环境不支持时为空 */
  cpuUsageRate: number | string | null
  /** 采样时间戳（毫秒） */
  timestamp: number | string | null
}
