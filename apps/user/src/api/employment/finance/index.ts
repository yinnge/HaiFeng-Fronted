import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { FinancePositionListVO, FinancePositionDetailVO, FinanceQueryDTO } from '@/types/employment/finance'

export const getFinanceList = (params: FinanceQueryDTO) => {
  return request.get<R<PageResult<FinancePositionListVO>>>('/api/v1/app/employment/finance/list', { params })
}

export const getFinanceDetail = (id: number) => {
  return request.get<R<FinancePositionDetailVO>>(`/api/v1/app/employment/finance/${id}/detail`)
}
