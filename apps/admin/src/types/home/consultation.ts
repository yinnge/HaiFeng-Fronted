import type { BasePageQuery } from '@haifeng/shared'

/** Admin 端咨询留言列表项 */
export interface ConsultationListVO {
  id: string
  bizType: 'planner' | 'institution'
  bizTypeDesc: string
  bizId: string
  bizName: string
  teacherMemberId: string
  teacherUsername: string | null
  senderMemberId: string | null
  message: string
  wechat: string | null
  phone: string
  /** 0-待处理 1-已处理 */
  status: number
  statusDesc: string
  createdAt: string
}

/** Admin 端咨询留言详情 */
export interface ConsultationDetailVO extends ConsultationListVO {
  clientIp: string | null
  updatedAt: string
}

/** Admin 端查询参数（ID 用字符串，避免雪花 ID 精度丢失） */
export interface ConsultationQueryDTO extends BasePageQuery {
  teacherMemberId?: string
  bizType?: 'planner' | 'institution'
  bizId?: string
  status?: number
  phone?: string
}
