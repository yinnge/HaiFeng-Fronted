import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  PlannerListVO,
  PlannerDetailVO,
  PlannerQueryDTO,
  PlannerAddDTO,
  PlannerUpdateDTO,
} from '@/types/home/planner'
import type { StatusDTO } from '@/types/home/announcement'

const PREFIX = '/api/v1/admin/home/planner'

export const getPlannerPage = (params: PlannerQueryDTO) => {
  return request.get<R<PageResult<PlannerListVO>>>(`${PREFIX}/list`, { params })
}

export const getPlannerDetail = (id: string) => {
  return request.get<R<PlannerDetailVO>>(`${PREFIX}/${id}`)
}

export const addPlanner = (data: PlannerAddDTO) => {
  return request.post<R<number>>(PREFIX, data)
}

export const updatePlanner = (id: string, data: PlannerUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const updatePlannerStatus = (id: string, data: StatusDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const deletePlanner = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}
