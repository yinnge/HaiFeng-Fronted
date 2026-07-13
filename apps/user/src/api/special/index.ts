// apps/user/src/api/special/index.ts
import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared/types/api'
import type {
  SpecialChannelListVO,
  SpecialChannelQueryDTO,
  SpecialChannelDetailVO,
  ChannelUniversityListVO,
  ChannelUniversityQueryDTO,
  ChannelUniversityDetailVO,
  StrongBaseScoreListVO,
  StrongBaseScoreQueryDTO,
  StrongBaseScoreDetailVO,
  StrongBaseUniversityDetailVO,
} from '@/types/special'

// 1.1 通道列表
export const getChannelList = (params: SpecialChannelQueryDTO) => {
  return request.get<R<PageResult<SpecialChannelListVO>>>('/api/v1/app/special/channel/list', { params })
}

// 1.2 通道详情
export const getChannelDetail = (id: number) => {
  return request.get<R<SpecialChannelDetailVO>>(`/api/v1/app/special/channel/${id}`)
}

// 2.1 关联大学列表
export const getChannelUniversityList = (params: ChannelUniversityQueryDTO) => {
  return request.get<R<PageResult<ChannelUniversityListVO>>>('/api/v1/app/special/channel-univ/list', { params })
}

// 2.2 关联大学详情
export const getChannelUniversityDetail = (id: number) => {
  return request.get<R<ChannelUniversityDetailVO>>(`/api/v1/app/special/channel-univ/${id}`)
}

// 3.1 强基数据列表
export const getStrongBaseScoreList = (params: StrongBaseScoreQueryDTO) => {
  return request.get<R<PageResult<StrongBaseScoreListVO>>>('/api/v1/app/special/strong-base-score/list', { params })
}

// 3.2 强基数据详情
export const getStrongBaseScoreDetail = (id: number) => {
  return request.get<R<StrongBaseScoreDetailVO>>(`/api/v1/app/special/strong-base-score/${id}`)
}

// 4.1 强基院校配置
export const getStrongBaseUniversityDetail = (universityId: number) => {
  return request.get<R<StrongBaseUniversityDetailVO>>(`/api/v1/app/special/strong-base-univ/${universityId}`)
}
