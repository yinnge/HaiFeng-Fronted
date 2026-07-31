import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  NoticeListVO,
  NoticeDetailVO,
  NoticeQueryDTO,
  NoticeAddDTO,
  NoticeUpdateDTO,
  StatusDTO,
} from '@/types/employment/notice'

const PREFIX = '/api/v1/admin/employment/content-management/notice'

export const getNoticePage = (params: NoticeQueryDTO) => {
  return request.get<R<PageResult<NoticeListVO>>>(`${PREFIX}/list`, { params })
}

export const getNoticeDetail = (id: string) => {
  return request.get<R<NoticeDetailVO>>(`${PREFIX}/${id}/detail`)
}

export const addNotice = (data: NoticeAddDTO) => {
  return request.post<R<number>>(`${PREFIX}/create`, data)
}

export const updateNotice = (id: string, data: NoticeUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/update`, data)
}

export const deleteNotice = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}/delete`)
}

export const updateNoticeStatus = (id: string, data: StatusDTO) => {
  return request.patch<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const batchDeleteNotice = (ids: number[]) => {
  return request.post<R<void>>(`${PREFIX}/batch-delete`, ids)
}
