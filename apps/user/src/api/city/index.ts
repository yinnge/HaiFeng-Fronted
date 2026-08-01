import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { CityListVO, CityQueryDTO, CityDetailVO } from '@/types/city'

const PREFIX = '/api/v1/app/city'

export const getCityList = (params: CityQueryDTO) =>
  request.get<R<PageResult<CityListVO>>>(`${PREFIX}/list`, { params })

export const getCityDetail = (cityId: string) =>
  request.get<R<CityDetailVO>>(`${PREFIX}/${cityId}/detail`)
