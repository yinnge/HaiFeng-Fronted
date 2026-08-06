import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { NoticeDetailVO, NoticeQueryDTO } from '@/types/employment/content/notice'

export const getNoticeList = (params: NoticeQueryDTO) => {
  return request.get<R<PageResult<NoticeDetailVO>>>('/api/v1/app/employment/content/notice/list', { params })
}

export const getNoticeDetail = (id: string) => {
  return request.get<R<NoticeDetailVO>>(`/api/v1/app/employment/content/notice/${id}`)
}

export const recordNoticeView = (id: string) => {
  return request.get<R<null>>(`/api/v1/app/employment/content/notice/${id}/view`)
}
