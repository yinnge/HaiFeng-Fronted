import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  ChannelListVO,
  ChannelDetailVO,
  ChannelQueryDTO,
  ChannelAddDTO,
  ChannelUpdateDTO,
} from '@/types/special/channel'

const PREFIX = '/api/v1/admin/special/channel'

export const getChannelPage = (params: ChannelQueryDTO) => {
  return request.get<R<PageResult<ChannelListVO>>>(`${PREFIX}/page`, { params })
}

export const getChannelDetail = (id: string) => {
  return request.get<R<ChannelDetailVO>>(`${PREFIX}/${id}`)
}

export const addChannel = (data: ChannelAddDTO) => {
  return request.post<R<void>>(PREFIX, data)
}

export const updateChannel = (id: string, data: ChannelUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const toggleChannelStatus = (id: string) => {
  return request.put<R<void>>(`${PREFIX}/${id}/toggle`)
}

export const deleteChannel = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}

export const batchDeleteChannel = (ids: string[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, { ids })
}
