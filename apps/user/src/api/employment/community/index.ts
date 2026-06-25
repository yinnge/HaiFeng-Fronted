import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type { CommunityPositionListVO, CommunityPositionDetailVO, CommunityQueryDTO } from '@/types/employment/community'

export const getCommunityList = (params: CommunityQueryDTO) => {
  return request.get<R<PageResult<CommunityPositionListVO>>>('/api/v1/app/employment/grassroots/community/list', { params })
}

export const getCommunityDetail = (id: number) => {
  return request.get<R<CommunityPositionDetailVO>>(`/api/v1/app/employment/grassroots/community/${id}/detail`)
}
