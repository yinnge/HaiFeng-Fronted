import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { CommissionListVO, CommissionQueryDTO } from '@/types/user/commission'

const PREFIX = '/api/v1/admin/user/commission'

export const getCommissionPage = (params: CommissionQueryDTO) =>
  request.get<R<PageResult<CommissionListVO>>>(`${PREFIX}/list`, { params })

export const deleteCommission = (id: string) =>
  request.delete<R<void>>(`${PREFIX}/${id}`)

export const hardDeleteCommission = (id: string) =>
  request.delete<R<void>>(`${PREFIX}/${id}/hard`)

export const restoreCommission = (id: string) =>
  request.put<R<void>>(`${PREFIX}/${id}/restore`)
