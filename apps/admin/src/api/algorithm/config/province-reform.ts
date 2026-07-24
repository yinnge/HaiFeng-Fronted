import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { ProvinceReformListVO, ProvinceReformDetailVO, ProvinceReformQueryDTO, ProvinceReformAddDTO } from '@/types/algorithm/config'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/algorithm/config/province-reform'

export const getProvinceReformPage = (params: ProvinceReformQueryDTO): Promise<AxiosResponse<R<PageResult<ProvinceReformListVO>>>> =>
  request.get(`${PREFIX}/page`, { params })

export const getProvinceReformDetail = (id: string): Promise<AxiosResponse<R<ProvinceReformDetailVO>>> =>
  request.get(`${PREFIX}/${id}`)

export const addProvinceReform = (data: ProvinceReformAddDTO): Promise<AxiosResponse<R<string>>> =>
  request.post(PREFIX, data)

export const updateProvinceReform = (id: string, data: ProvinceReformAddDTO): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}`, data)

export const deleteProvinceReform = (id: string): Promise<AxiosResponse<R<void>>> =>
  request.delete(`${PREFIX}/${id}`)

export const batchDeleteProvinceReform = (ids: string[]): Promise<AxiosResponse<R<void>>> =>
  request.post(`${PREFIX}/batch-delete`, ids)
