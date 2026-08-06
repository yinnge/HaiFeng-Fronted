import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  ConstraintDictListVO,
  ConstraintDictDetailVO,
  ConstraintDictAddDTO,
  ConstraintDictUpdateDTO,
  MajorConstraintListVO,
  MajorConstraintDetailVO,
  MajorConstraintQueryDTO,
  MajorConstraintAddDTO,
  SafetyLevelListVO,
  SafetyLevelDetailVO,
  SafetyLevelAddDTO,
  SafetyLevelUpdateDTO,
} from '@/types/algorithm/constraint'
import type { AxiosResponse } from 'axios'

// ========== 约束字典 ==========
const DICT_PREFIX = '/api/v1/admin/algorithm/constraint/dict'

export const getDictPage = (params: { page: number; size: number; name?: string }): Promise<AxiosResponse<R<PageResult<ConstraintDictListVO>>>> =>
  request.get(`${DICT_PREFIX}/page`, { params })

export const getDictDetail = (code: string): Promise<AxiosResponse<R<ConstraintDictDetailVO>>> =>
  request.get(`${DICT_PREFIX}/${code}`)

export const addDict = (data: ConstraintDictAddDTO): Promise<AxiosResponse<R<void>>> =>
  request.post(DICT_PREFIX, data)

export const updateDict = (code: string, data: ConstraintDictUpdateDTO): Promise<AxiosResponse<R<void>>> =>
  request.put(`${DICT_PREFIX}/${code}`, data)

export const toggleDictStatus = (code: string): Promise<AxiosResponse<R<void>>> =>
  request.put(`${DICT_PREFIX}/${code}/toggle`)

export const deleteDict = (code: string): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${DICT_PREFIX}/${code}`)

export const batchDeleteDict = (codes: string[]): Promise<AxiosResponse<R<void>>> =>
  request.post(`${DICT_PREFIX}/batch-delete`, { codes })

// ========== 专业约束关联 ==========
const MAJOR_PREFIX = '/api/v1/admin/algorithm/constraint/major'

export const getMajorPage = (params: MajorConstraintQueryDTO): Promise<AxiosResponse<R<PageResult<MajorConstraintListVO>>>> =>
  request.get(`${MAJOR_PREFIX}/page`, { params })

export const getMajorDetail = (id: string): Promise<AxiosResponse<R<MajorConstraintDetailVO>>> =>
  request.get(`${MAJOR_PREFIX}/${id}`)

export const addMajor = (data: MajorConstraintAddDTO): Promise<AxiosResponse<R<string>>> =>
  request.post(MAJOR_PREFIX, data)

export const deleteMajor = (id: string): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${MAJOR_PREFIX}/${id}`)

export const batchDeleteMajor = (ids: string[]): Promise<AxiosResponse<R<void>>> =>
  request.post(`${MAJOR_PREFIX}/batch-delete`, { ids })

export const toggleMajorStatus = (id: string): Promise<AxiosResponse<R<void>>> =>
  request.put(`${MAJOR_PREFIX}/${id}/toggle`)

export const importMajorExcel = (file: File): Promise<AxiosResponse<R<number>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${MAJOR_PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// ========== 安全系数 ==========
const SAFETY_PREFIX = '/api/v1/admin/algorithm/constraint/safety-level'

export const getSafetyPage = (params: { page: number; size: number; isDeleted?: boolean | null }): Promise<AxiosResponse<R<PageResult<SafetyLevelListVO>>>> =>
  request.get(`${SAFETY_PREFIX}/page`, { params })

export const getSafetyDetail = (level: number): Promise<AxiosResponse<R<SafetyLevelDetailVO>>> =>
  request.get(`${SAFETY_PREFIX}/${level}`)

export const addSafety = (data: SafetyLevelAddDTO): Promise<AxiosResponse<R<void>>> =>
  request.post(SAFETY_PREFIX, data)

export const updateSafety = (level: number, data: SafetyLevelUpdateDTO): Promise<AxiosResponse<R<void>>> =>
  request.put(`${SAFETY_PREFIX}/${level}`, data)

export const toggleSafetyStatus = (level: number): Promise<AxiosResponse<R<void>>> =>
  request.put(`${SAFETY_PREFIX}/${level}/status`)

export const deleteSafety = (level: number): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${SAFETY_PREFIX}/${level}`)

export const batchDeleteSafety = (levels: number[]): Promise<AxiosResponse<R<void>>> =>
  request.post(`${SAFETY_PREFIX}/batch-delete`, { levels })
