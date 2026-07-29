import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { ProvinceConfigListVO, ProvinceConfigDetailVO, ProvinceConfigUpdateDTO } from '@/types/algorithm/config/province'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/algorithm/config/province-config'

export const getProvinceConfigPage = (params: { page: number; size: number; province?: string }): Promise<AxiosResponse<R<PageResult<ProvinceConfigListVO>>>> =>
  request.get(`${PREFIX}/page`, { params })

export const getProvinceConfigDetail = (province: string): Promise<AxiosResponse<R<ProvinceConfigDetailVO>>> =>
  request.get(`${PREFIX}/${encodeURIComponent(province)}`)

export const updateProvinceConfig = (province: string, data: ProvinceConfigUpdateDTO): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${encodeURIComponent(province)}`, data)
