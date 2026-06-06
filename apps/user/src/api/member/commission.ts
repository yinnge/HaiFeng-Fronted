import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { CommissionVO, WithdrawDTO, ReferrerPreviewVO, BindReferrerDTO } from '@/types/member/commission'

const PREFIX = '/api/v1/app/member'

/**
 * 获取佣金信息
 */
export const getCommission = () => {
  return request.get<R<CommissionVO>>(`${PREFIX}/commission`)
}

/**
 * 申请提现
 */
export const withdraw = (data: WithdrawDTO) => {
  return request.post<R<number>>(`${PREFIX}/withdraw`, data)
}

/**
 * 预览推荐人信息
 */
export const previewReferrer = (inviteCode: string) => {
  return request.get<R<ReferrerPreviewVO>>(`${PREFIX}/referrer/preview`, {
    params: { inviteCode },
  })
}

/**
 * 绑定推荐人
 */
export const bindReferrer = (data: BindReferrerDTO) => {
  return request.post<R<null>>(`${PREFIX}/referrer/bind`, data)
}
