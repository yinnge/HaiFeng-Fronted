import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { ImportResultVO } from '@/types/certificate/certificate'
import type {
  CertificateListVO,
  CertificateDetailVO,
  CertificateQueryDTO,
  CertificateAddDTO,
  CertificateUpdateDTO,
} from '@/types/certificate/certificate'

const PREFIX = '/api/v1/admin/certificate'

export const getCertificatePage = (params: CertificateQueryDTO) => {
  return request.get<R<PageResult<CertificateListVO>>>(`${PREFIX}/list`, { params })
}

export const getCertificateDetail = (id: string) => {
  return request.get<R<CertificateDetailVO>>(`${PREFIX}/${id}`)
}

export const addCertificate = (data: CertificateAddDTO) => {
  return request.post<R<number>>(`${PREFIX}/add`, data)
}

export const updateCertificate = (data: CertificateUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/update`, data)
}

export const updateCertificateStatus = (id: string, isDeleted: boolean) => {
  return request.put<R<void>>(`${PREFIX}/${id}/status`, { isDeleted })
}

export const softDeleteCertificate = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/soft/${id}`)
}

export const hardDeleteCertificate = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/hard/${id}`)
}

export const batchDeleteCertificate = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch/delete`, { ids })
}

export const batchUpdateCertificateStatus = (ids: number[], isDeleted: boolean) => {
  return request.put<R<void>>(`${PREFIX}/batch/status`, { ids, isDeleted })
}

/**
 * 批量导入证书（EasyExcel，单文件上传；多文件由前端逐个调用）
 */
export const importCertificate = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<ImportResultVO>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  })
}
