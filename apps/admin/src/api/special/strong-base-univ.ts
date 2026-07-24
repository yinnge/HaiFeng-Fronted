import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  StrongBaseUnivListVO,
  StrongBaseUnivDetailVO,
  StrongBaseUnivQueryDTO,
  StrongBaseUnivAddDTO,
  StrongBaseUnivUpdateDTO,
} from '@/types/special/strong-base-univ'

const PREFIX = '/api/v1/admin/special/strong-base-univ'

export const getStrongBaseUnivPage = (params: StrongBaseUnivQueryDTO) => {
  return request.get<R<PageResult<StrongBaseUnivListVO>>>(`${PREFIX}/page`, { params })
}

export const getStrongBaseUnivDetail = (id: string) => {
  return request.get<R<StrongBaseUnivDetailVO>>(`${PREFIX}/${id}`)
}

export const addStrongBaseUniv = (data: StrongBaseUnivAddDTO) => {
  return request.post<R<void>>(PREFIX, data)
}

export const updateStrongBaseUniv = (id: string, data: StrongBaseUnivUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const deleteStrongBaseUniv = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

export const batchDeleteStrongBaseUniv = (ids: string[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, { ids })
}
