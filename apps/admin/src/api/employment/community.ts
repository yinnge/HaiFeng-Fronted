import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  CommunityListVO,
  CommunityDetailVO,
  CommunityQueryDTO,
  CommunityUpdateDTO,
  CommunityAddDTO,
  PositionStatusDTO,
} from '@/types/employment/community'

const PREFIX = '/api/v1/admin/employment/grassroots-position/community'

export const getCommunityPage = (params: CommunityQueryDTO) => {
  return request.get<R<PageResult<CommunityListVO>>>(`${PREFIX}/list`, { params })
}

export const getCommunityDetail = (id: string) => {
  return request.get<R<CommunityDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const addCommunity = (data: CommunityAddDTO) => {
  return request.post<R<number>>(`${PREFIX}/create`, data)
}

export const updateCommunity = (id: string, data: CommunityUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteCommunity = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateCommunityStatus = (id: string, data: PositionStatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteCommunity = (ids: string[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}

export const preValidateCommunity = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<string>>(`${PREFIX}/pre-validate`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const importCommunity = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<R<void>>(`${PREFIX}/import`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
