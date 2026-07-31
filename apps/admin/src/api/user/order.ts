import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { OrderListVO, OrderDetailVO, OrderQueryDTO, OrderCreateDTO } from '@/types/user/order'

const PREFIX = '/api/v1/admin/user/order'

export const getOrderPage = (params: OrderQueryDTO) =>
  request.get<R<PageResult<OrderListVO>>>(`${PREFIX}/list`, { params })

export const getOrderDetail = (id: string) =>
  request.get<R<OrderDetailVO>>(`${PREFIX}/${id}`)

export const getOrderWechat = (id: string) =>
  request.get<R<string>>(`${PREFIX}/${id}/wechat`)

export const hardDeleteOrder = (id: string) =>
  request.delete<R<void>>(`${PREFIX}/${id}/hard`)

export const createOrder = (data: OrderCreateDTO) =>
  request.post<R<number>>(`${PREFIX}/create`, data)

export const confirmOrder = (id: string) =>
  request.put<R<void>>(`${PREFIX}/${id}/confirm`)

export const cancelOrder = (id: string) =>
  request.put<R<void>>(`${PREFIX}/${id}/cancel`)

export const revokeOrder = (id: string, remark?: string) =>
  request.put<R<void>>(`${PREFIX}/${id}/revoke`, null, { params: { remark } })
