import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { WithdrawListVO, WithdrawQueryDTO, WithdrawProcessDTO } from '@/types/user/withdraw'

const PREFIX = '/api/v1/admin/user/withdraw'

export const getWithdrawPage = (params: WithdrawQueryDTO) =>
  request.get<R<PageResult<WithdrawListVO>>>(`${PREFIX}/list`, { params })

export const getWithdrawWechat = (id: string) =>
  request.get<R<string>>(`${PREFIX}/${id}/wechat`)

export const processWithdraw = (id: string, data: WithdrawProcessDTO) =>
  request.put<R<void>>(`${PREFIX}/${id}/process`, data)

export const deleteWithdraw = (id: string) =>
  request.delete<R<void>>(`${PREFIX}/${id}`)

export const hardDeleteWithdraw = (id: string) =>
  request.delete<R<void>>(`${PREFIX}/${id}/hard`)

export const restoreWithdraw = (id: string) =>
  request.put<R<void>>(`${PREFIX}/${id}/restore`)
