import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  InstitutionListVO,
  InstitutionDetailVO,
  InstitutionQueryDTO,
  InstitutionAddDTO,
  InstitutionUpdateDTO,
  InstitutionOptionVO,
  InstitutionStatus,
} from '@/types/home/institution'
import type { TeacherOptionVO } from '@/types/home/planner'

const PREFIX = '/api/v1/admin/home/institution'

export const getInstitutionPage = (params: InstitutionQueryDTO) => {
  return request.get<R<PageResult<InstitutionListVO>>>(`${PREFIX}/list`, { params })
}

export const getInstitutionDetail = (id: string) => {
  return request.get<R<InstitutionDetailVO>>(`${PREFIX}/${id}`)
}

/** 教师身份会员下拉选项（绑定机构管理账号用） */
export const getInstitutionTeachers = () => {
  return request.get<R<TeacherOptionVO[]>>(`${PREFIX}/teachers`)
}

/** 机构分类下拉选项（4 个固定中文分类） */
export const getInstitutionCategories = () => {
  return request.get<R<InstitutionOptionVO[]>>(`${PREFIX}/categories`)
}

export const addInstitution = (data: InstitutionAddDTO) => {
  return request.post<R<number>>(PREFIX, data)
}

export const updateInstitution = (id: string, data: InstitutionUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

/** 修改上下架状态：1=上架，0=下架 */
export const updateInstitutionStatus = (id: string, status: InstitutionStatus) => {
  return request.put<R<void>>(`${PREFIX}/${id}/status`, { status })
}

/** 删除机构（物理删除，不可恢复） */
export const deleteInstitution = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}
