import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { GaokaoConfigDetailVO, GaokaoConfigUpdateDTO } from '@/types/algorithm/config/gaokao'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/algorithm/config/gaokao-config'

export const getGaokaoConfigCurrent = (): Promise<AxiosResponse<R<GaokaoConfigDetailVO>>> =>
  request.get(`${PREFIX}/current`)

export const updateGaokaoConfigCurrent = (data: GaokaoConfigUpdateDTO): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/current`, data)
