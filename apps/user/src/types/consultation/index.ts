import type { BasePageQuery } from '@haifeng/shared'

/** 咨询留言业务类型 */
export type ConsultationBizType = 'planner' | 'institution'

/** C 端提交咨询留言 */
export interface ConsultationAddDTO {
  message: string
  wechat?: string
  phone: string
}

/** 教师端留言列表项 */
export interface ConsultationListVO {
  id: string
  bizType: ConsultationBizType
  bizTypeDesc: string
  bizId: string
  bizName: string
  message: string
  wechat: string | null
  phone: string
  /** 0-待处理 1-已处理 */
  status: number
  statusDesc: string
  createdAt: string
}

/** 教师端留言详情 */
export interface ConsultationDetailVO extends ConsultationListVO {
  senderMemberId: string | null
  clientIp: string | null
  updatedAt: string
}

/** 教师端收件箱查询 */
export interface ConsultationQueryDTO extends BasePageQuery {
  status?: number
  bizType?: ConsultationBizType
}

/** 教师端未处理留言数 */
export interface ConsultationUnhandledCountVO {
  unhandledCount: number
}
