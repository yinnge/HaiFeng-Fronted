import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { WelfarePositionListVO, WelfarePositionDetailVO, WelfareQueryDTO } from '@/types/employment/welfare'

export const getWelfareList = (params: WelfareQueryDTO) => {
  return request.get<R<PageResult<WelfarePositionListVO>>>('/api/v1/app/employment/grassroots/welfare/list', { params })
}

export const getWelfareDetail = (id: number) => {
  return request.get<R<WelfarePositionDetailVO>>(`/api/v1/app/employment/grassroots/welfare/${id}/detail`)
}
