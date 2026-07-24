import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  ChannelUnivListVO,
  ChannelUnivDetailVO,
  ChannelUnivQueryDTO,
  ChannelUnivAddDTO,
  ChannelUnivUpdateDTO,
} from '@/types/special/channel-univ'

const PREFIX = '/api/v1/admin/special/channel-univ'

export const getChannelUnivPage = (params: ChannelUnivQueryDTO) => {
  return request.get<R<PageResult<ChannelUnivListVO>>>(`${PREFIX}/page`, { params })
}

export const getChannelUnivDetail = (id: string) => {
  return request.get<R<ChannelUnivDetailVO>>(`${PREFIX}/${id}`)
}

export const addChannelUniv = (data: ChannelUnivAddDTO) => {
  return request.post<R<void>>(PREFIX, data)
}

export const updateChannelUniv = (id: string, data: ChannelUnivUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const toggleChannelUnivStatus = (id: string) => {
  return request.put<R<void>>(`${PREFIX}/${id}/toggle`)
}

export const deleteChannelUniv = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

export const batchDeleteChannelUniv = (ids: string[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, { ids })
}
