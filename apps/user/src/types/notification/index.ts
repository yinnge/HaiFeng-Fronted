import type { BasePageQuery } from '@haifeng/shared'

export interface NotificationListVO {
  id: string
  notificationType: string
  title: string
  content: string
  isRead: boolean
  createdAt: string
  readAt: string | null
}

export interface NotificationQueryDTO extends BasePageQuery {
  notificationType?: string
  isRead?: boolean
}

export interface NotificationDetailVO {
  id: string
  notificationType: string
  title: string
  content: string
  isRead: boolean
  createdAt: string
  readAt: string | null
}

export interface UnreadCountVO {
  unreadCount: number
}
