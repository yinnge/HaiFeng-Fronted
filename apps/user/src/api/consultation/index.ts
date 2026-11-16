import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type {
  ConsultationDetailVO,
  ConsultationListVO,
  ConsultationQueryDTO,
  ConsultationUnhandledCountVO,
} from '@/types/consultation'

const PREFIX = '/api/v1/app/teacher/consultations'

/** 我收到的留言 */
export const getConsultationPage = (params: ConsultationQueryDTO) => {
  return request.get<R<PageResult<ConsultationListVO>>>(PREFIX, { params })
}

/** 留言详情（非本人留言 404） */
export const getConsultationDetail = (id: string) => {
  return request.get<R<ConsultationDetailVO>>(`${PREFIX}/${id}`)
}

/** 标记已联系（幂等） */
export const markConsultationHandled = (id: string) => {
  return request.put<R<void>>(`${PREFIX}/${id}/handled`)
}

/** 未处理留言数（角标） */
export const getConsultationUnhandledCount = () => {
  return request.get<R<ConsultationUnhandledCountVO>>(`${PREFIX}/unhandled-count`)
}
