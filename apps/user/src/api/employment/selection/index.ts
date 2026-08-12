import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { SelectionPositionListVO, SelectionPositionDetailVO, SelectionPositionSearchDTO } from '@/types/employment/selection'

export const getSelectionList = (params: SelectionPositionSearchDTO) => {
  return request.get<R<PageResult<SelectionPositionListVO>>>('/api/v1/app/employment/civil-service/selection/list', { params })
}

/** 获取所有不重复的年份（倒序），供年份筛选下拉 */
export const getSelectionYears = () => {
  return request.get<R<string[]>>('/api/v1/app/employment/civil-service/selection/years')
}

export const getSelectionDetail = (id: string) => {
  return request.get<R<SelectionPositionDetailVO>>(`/api/v1/app/employment/civil-service/selection/${id}/detail`)
}
