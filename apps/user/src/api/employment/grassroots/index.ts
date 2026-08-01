import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { GrassrootsPositionListVO, GrassrootsPositionDetailVO, GrassrootsQueryDTO } from '@/types/employment/grassroots'

export const getGrassrootsList = (params: GrassrootsQueryDTO) => {
  return request.get<R<PageResult<GrassrootsPositionListVO>>>('/api/v1/app/employment/grassroots/project/list', { params })
}

export const getGrassrootsDetail = (id: string) => {
  return request.get<R<GrassrootsPositionDetailVO>>(`/api/v1/app/employment/grassroots/project/${id}/detail`)
}
