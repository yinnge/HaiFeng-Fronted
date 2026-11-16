import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  PlannerListVO,
  PlannerDetailVO,
  PlannerQueryDTO,
  PlannerAddDTO,
  PlannerUpdateDTO,
  PlannerStatus,
  TeacherOptionVO,
} from '@/types/home/planner'

const PREFIX = '/api/v1/admin/home/planner'

export const getPlannerPage = (params: PlannerQueryDTO) => {
  return request.get<R<PageResult<PlannerListVO>>>(`${PREFIX}/list`, { params })
}

export const getPlannerDetail = (id: string) => {
  return request.get<R<PlannerDetailVO>>(`${PREFIX}/${id}`)
}

/** 教师身份会员下拉选项（新增/编辑弹窗绑定规划师账号用） */
export const getPlannerTeachers = () => {
  return request.get<R<TeacherOptionVO[]>>(`${PREFIX}/teachers`)
}

export const addPlanner = (data: PlannerAddDTO) => {
  return request.post<R<number>>(PREFIX, data)
}

export const updatePlanner = (id: string, data: PlannerUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

/**
 * 修改上下架状态
 * 规划师无 status 列：1=上线（is_deleted=false），0=下线（is_deleted=true）
 */
export const updatePlannerStatus = (id: string, status: PlannerStatus) => {
  return request.put<R<void>>(`${PREFIX}/${id}/status`, { status })
}

/** 彻底删除规划师（物理删除，不可恢复） */
export const deletePlanner = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}
