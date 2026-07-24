import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  AnnouncementListVO,
  AnnouncementDetailVO,
  AnnouncementQueryDTO,
  AnnouncementAddDTO,
  AnnouncementUpdateDTO,
  StatusDTO,
} from '@/types/home/announcement'

const PREFIX = '/api/v1/admin/home/announcement'

export const getAnnouncementPage = (params: AnnouncementQueryDTO) => {
  return request.get<R<PageResult<AnnouncementListVO>>>(`${PREFIX}/list`, { params })
}

export const getAnnouncementDetail = (id: string) => {
  return request.get<R<AnnouncementDetailVO>>(`${PREFIX}/${id}`)
}

export const addAnnouncement = (data: AnnouncementAddDTO) => {
  return request.post<R<number>>(PREFIX, data)
}

export const updateAnnouncement = (id: string, data: AnnouncementUpdateDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}`, data)
}

export const updateAnnouncementStatus = (id: string, data: StatusDTO) => {
  return request.put<R<void>>(`${PREFIX}/${id}/status`, data)
}

export const deleteAnnouncement = (id: string) => {
  return request.delete<R<void>>(`${PREFIX}/${id}`)
}
