import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  CityListVO,
  CityQueryDTO,
  CityDetailVO,
  CityStatsVO,
  CityRankItem,
  CityRankQuery,
} from '@/types/city'

const PREFIX = '/api/v1/app/city'

export const getCityList = (params: CityQueryDTO) =>
  request.get<R<PageResult<CityListVO>>>(`${PREFIX}/list`, { params })

export const getCityDetail = (cityId: string) =>
  request.get<R<CityDetailVO>>(`${PREFIX}/${cityId}/detail`)

/** 城市数据概览（全国城市数 / 高校数 / 常住人口 / GDP 总量） */
export const getCityStats = () => request.get<R<CityStatsVO>>(`${PREFIX}/stats`)

/** 城市排行榜（按指标取 Top N） */
export const getCityRank = (params: CityRankQuery) =>
  request.get<R<CityRankItem[]>>(`${PREFIX}/rank`, { params })
