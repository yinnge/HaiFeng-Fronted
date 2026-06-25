import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { SelectionPositionListVO, SelectionPositionDetailVO, SelectionPositionSearchDTO } from '@/types/employment/selection'

export const getSelectionList = (params: SelectionPositionSearchDTO) => {
  return request.get<R<PageResult<SelectionPositionListVO>>>('/api/v1/app/employment/civil-service/selection/list', { params })
}

export const getSelectionDetail = (id: number) => {
  return request.get<R<SelectionPositionDetailVO>>(`/api/v1/app/employment/civil-service/selection/${id}/detail`)
}
