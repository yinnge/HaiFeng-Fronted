import type { BasePageQuery } from '@haifeng/shared'

export interface NotificationListVO {
  id: string
  memberId: string
  memberName: string
  notificationType: string
  title: string
  content: string
  isRead: boolean
  createdAt: string
  readAt: string | null
  recipientCount?: number
  broadcastId?: string
  disabledCount?: number
  disabled?: boolean
}

export interface NotificationQueryDTO extends BasePageQuery {
  memberId?: number
  notificationType?: string
  isRead?: boolean
  showDisabled?: boolean
}

export interface BroadcastDTO {
  title: string
  content: string
}
