/**
 * 订单状态枚举
 */
export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REVOKED = 'revoked',
}

export const OrderStatusLabel: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '待支付',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消',
  [OrderStatus.REVOKED]: '已撤销',
}

export const OrderStatusTagClass: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'status-pending',
  [OrderStatus.COMPLETED]: 'status-completed',
  [OrderStatus.CANCELLED]: 'status-cancelled',
  [OrderStatus.REVOKED]: 'status-revoked',
}
