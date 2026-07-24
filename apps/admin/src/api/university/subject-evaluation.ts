import request from '@haifeng/shared/utils/request'
import type {
  SubjectEvaluationListVO,
  SubjectEvaluationDetailVO,
  SubjectEvaluationQueryDTO,
  SubjectEvaluationAddDTO,
  SubjectEvaluationUpdateDTO,
} from '@/types/university/subject-evaluation'
import type { R, PageResponse } from '@haifeng/shared'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/university/subject-evaluation'

export const getSubjectEvaluationPage = (
  params: SubjectEvaluationQueryDTO,
): Promise<AxiosResponse<PageResponse<SubjectEvaluationListVO>>> =>
  request.get(`${PREFIX}/list`, { params })

export const getSubjectEvaluationDetail = (
  id: string,
): Promise<AxiosResponse<R<SubjectEvaluationDetailVO>>> =>
  request.get(`${PREFIX}/${id}`)

export const addSubjectEvaluation = (
  data: SubjectEvaluationAddDTO,
): Promise<AxiosResponse<R<number>>> =>
  request.post(PREFIX, data)

export const updateSubjectEvaluation = (
  id: string,
  data: SubjectEvaluationUpdateDTO,
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}`, data)

export const updateSubjectEvaluationStatus = (
  id: string,
  data: { status: number },
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}/status`, data)

export const deleteSubjectEvaluation = (id: string): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}`)

export const hardDeleteSubjectEvaluation = (
  id: string,
): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}/hard`)

export const batchDeleteSubjectEvaluation = (
  ids: number[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-delete`, { ids })

export const batchHardDeleteSubjectEvaluation = (
  ids: number[],
): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-hard-delete`, { ids })

export const importSubjectEvaluation = (file: File): Promise<AxiosResponse<R<void>>> => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
