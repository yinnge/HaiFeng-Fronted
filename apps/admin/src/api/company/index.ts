import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  EnterpriseListVO,
  EnterpriseDetailVO,
  EnterpriseQueryDTO,
  EnterpriseAddDTO,
  EnterpriseUpdateDTO,
  StatusDTO,
  EnterpriseIndustryListVO,
  EnterpriseIndustryDetailVO,
  EnterpriseIndustryQueryDTO,
  PositionVO,
  EnterprisePositionAddDTO,
  EnterprisePositionUpdateDTO,
  EnterprisePositionQueryDTO,
} from '@/types/company'

const ENTERPRISE_PREFIX = '/api/v1/admin/company/enterprise'
const INDUSTRY_PREFIX = '/api/v1/admin/company/enterprise-industry'

// ---- 企业列表 ----

export const getEnterprisePage = (params: EnterpriseQueryDTO) => {
  return request.get<R<PageResult<EnterpriseListVO>>>(`${ENTERPRISE_PREFIX}/list`, { params })
}

export const getEnterpriseDetail = (id: string) => {
  return request.get<R<EnterpriseDetailVO>>(`${ENTERPRISE_PREFIX}/${id}`)
}

export const addEnterprise = (data: EnterpriseAddDTO) => {
  return request.post<R<string>>(ENTERPRISE_PREFIX, data)
}

export const updateEnterprise = (id: string, data: EnterpriseUpdateDTO) => {
  return request.put<R<void>>(`${ENTERPRISE_PREFIX}/${id}`, data)
}

export const updateEnterpriseStatus = (id: string, data: StatusDTO) => {
  return request.put<R<void>>(`${ENTERPRISE_PREFIX}/${id}/status`, data)
}

export const deleteEnterprise = (id: string) => {
  return request.delete<R<void>>(`${ENTERPRISE_PREFIX}/${id}`)
}

export const batchDeleteEnterprise = (ids: string[]) => {
  return request.post<R<void>>(`${ENTERPRISE_PREFIX}/batch/delete`, { ids })
}

export const importEnterprise = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${ENTERPRISE_PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// ---- 企业-行业关联 ----

export const getEnterpriseIndustryPage = (params: EnterpriseIndustryQueryDTO) => {
  return request.get<R<PageResult<EnterpriseIndustryListVO>>>(`${INDUSTRY_PREFIX}/list`, { params })
}

export const getEnterpriseIndustryDetail = (id: string) => {
  return request.get<R<EnterpriseIndustryDetailVO>>(`${INDUSTRY_PREFIX}/${id}`)
}

export const deleteEnterpriseIndustry = (id: string) => {
  return request.delete<R<void>>(`${INDUSTRY_PREFIX}/${id}`)
}

export const batchDeleteEnterpriseIndustry = (ids: string[]) => {
  return request.post<R<void>>(`${INDUSTRY_PREFIX}/batch/delete`, { ids })
}

export const importEnterpriseIndustry = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${INDUSTRY_PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// ---- 企业岗位（嵌套子资源：/enterprise/{enterpriseId}/position）----

const positionPrefix = (enterpriseId: string) => `${ENTERPRISE_PREFIX}/${enterpriseId}/position`

export const getEnterprisePositionPage = (enterpriseId: string, params: EnterprisePositionQueryDTO) => {
  return request.get<R<PageResult<PositionVO>>>(`${positionPrefix(enterpriseId)}/list`, { params })
}

export const getEnterprisePositionDetail = (enterpriseId: string, id: string) => {
  return request.get<R<PositionVO>>(`${positionPrefix(enterpriseId)}/${id}`)
}

export const addEnterprisePosition = (enterpriseId: string, data: EnterprisePositionAddDTO) => {
  return request.post<R<string>>(positionPrefix(enterpriseId), data)
}

export const updateEnterprisePosition = (enterpriseId: string, id: string, data: EnterprisePositionUpdateDTO) => {
  return request.put<R<void>>(`${positionPrefix(enterpriseId)}/${id}`, data)
}

export const deleteEnterprisePosition = (enterpriseId: string, id: string) => {
  return request.delete<R<void>>(`${positionPrefix(enterpriseId)}/${id}`)
}

export const batchDeleteEnterprisePosition = (enterpriseId: string, ids: string[]) => {
  return request.post<R<void>>(`${positionPrefix(enterpriseId)}/batch/delete`, { ids })
}
