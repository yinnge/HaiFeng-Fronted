import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { NotificationListVO, NotificationQueryDTO, BroadcastDTO } from '@/types/user/notification'

const PREFIX = '/api/v1/admin/user/notification'

export const getNotificationPage = (params: NotificationQueryDTO) =>
  request.get<R<PageResult<NotificationListVO>>>(`${PREFIX}/list`, { params })

export const broadcastNotification = (data: BroadcastDTO) =>
  request.post<R<string>>(`${PREFIX}/broadcast`, data)

export const deleteNotification = (id: string) =>
  request.delete<R<void>>(`${PREFIX}/${id}`)

export const hardDeleteNotification = (id: string) =>
  request.delete<R<void>>(`${PREFIX}/${id}/hard`)

export const restoreNotification = (id: string) =>
  request.put<R<void>>(`${PREFIX}/${id}/restore`)
