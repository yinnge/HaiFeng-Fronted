import request from '@haifeng/shared/utils/request'
import type {
  DepartmentListVO,
  DepartmentDetailVO,
  DepartmentQueryDTO,
  DepartmentAddDTO,
  DepartmentUpdateDTO,
} from '@/types/university/department'
import type { R, PageResponse } from '@haifeng/shared'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/university/department'

export const getDepartmentPage = (
  params: DepartmentQueryDTO,
): Promise<AxiosResponse<PageResponse<DepartmentListVO>>> =>
  request.get(`${PREFIX}/list`, { params })

export const getDepartmentDetail = (
  id: string,
): Promise<AxiosResponse<R<DepartmentDetailVO>>> =>
  request.get(`${PREFIX}/${id}`)

export const addDepartment = (
  data: DepartmentAddDTO,
): Promise<AxiosResponse<R<number>>> =>
  request.post(PREFIX, data)

export const updateDepartment = (
  id: string,
  data: DepartmentUpdateDTO,
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}`, data)

export const updateDepartmentStatus = (
  id: string,
  data: { status: number },
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}/status`, data)

export const deleteDepartment = (id: string): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}`)

export const hardDeleteDepartment = (
  id: string,
): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}/hard`)

export const batchDeleteDepartment = (
  ids: number[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-delete`, { ids })

export const batchHardDeleteDepartment = (
  ids: number[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-hard-delete`, { ids })

export const importDepartment = (file: File): Promise<AxiosResponse<R<void>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // 导入需逐行查院校/院系并写入（N+1），主表上限 1000 行；
    // 默认 60s 会导致前端先超时提示失败，而后端事务照常提交（假失败 → 重复上传触发「仅补空不覆盖」）
    timeout: 300000,
  })
}

/**
 * 导入院系报告数据（后端 importDepartmentReports）：
 * 读取「院系主表」+ 11 个报告分类 Sheet，按主表院系名回填报告字段（仅补 NULL，不覆盖已有数据）。
 * 与 importDepartment 的区别：本接口会校验「报告 Sheet 中的院系名必须存在于主表」，否则整单回滚。
 */
export const importDepartmentReports = (file: File): Promise<AxiosResponse<R<void>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import-report`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // 需解析 11 个报告 Sheet + 逐行查院校/院系/报告再写入，比主表导入更慢
    timeout: 300000,
  })
}
