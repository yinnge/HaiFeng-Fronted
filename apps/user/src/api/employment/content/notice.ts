import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { NoticeListVO, NoticeDetailVO, NoticeQueryDTO } from '@/types/employment/content/notice'

export const getNoticeList = (params: NoticeQueryDTO) => {
  return request.get<R<PageResult<NoticeListVO>>>('/api/v1/app/employment/content/notice/list', { params })
}

export const getNoticeDetail = (id: string) => {
  return request.get<R<NoticeDetailVO>>(`/api/v1/app/employment/content/notice/${id}`)
}
