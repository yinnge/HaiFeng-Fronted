import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { CityBriefVO, UniversityBriefVO, MajorBriefVO } from '@/types/gaokao/brief'

/** 根据城市名称获取城市简要信息 */
export const getCityBriefByName = (name: string) =>
  request.get<R<CityBriefVO>>('/api/v1/app/city/brief', { params: { name } })

/** 根据院校名称获取院校简要信息 */
export const getUniversityBriefByName = (name: string) =>
  request.get<R<UniversityBriefVO>>('/api/v1/app/university/brief', { params: { name } })

/** 根据专业名称获取专业简要信息 */
export const getMajorBriefByName = (name: string) =>
  request.get<R<MajorBriefVO>>('/api/v1/app/major/brief', { params: { name } })
