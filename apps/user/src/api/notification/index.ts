import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { NotificationListVO, NotificationDetailVO, NotificationQueryDTO, UnreadCountVO } from '@/types/notification'

const PREFIX = '/api/v1/app/member/notification'

export const getRecentNotifications = () => {
  return request.get<R<NotificationListVO[]>>(`${PREFIX}/recent`)
}

export const getNotificationPage = (params: NotificationQueryDTO) => {
  return request.get<R<PageResult<NotificationListVO>>>(`${PREFIX}/list`, { params })
}

export const getUnreadCount = () => {
  return request.get<R<UnreadCountVO>>(`${PREFIX}/unread-count`)
}

export const getNotificationDetail = (id: string) => {
  return request.get<R<NotificationDetailVO>>(`${PREFIX}/${id}`)
}

export const markAsRead = (id: string) => {
  return request.put<R<void>>(`${PREFIX}/${id}/read`)
}

export const markAllAsRead = () => {
  return request.put<R<void>>(`${PREFIX}/read-all`)
}

export const deleteNotification = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

export const cleanExpired = () => {
  return request.delete<R<number>>(`${PREFIX}/clean-expired`)
}
