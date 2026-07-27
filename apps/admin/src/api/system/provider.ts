import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { AxiosResponse } from 'axios'
import type {
  AiBalanceVO,
  ModelProviderVO,
  ModelProviderQueryDTO,
  ModelProviderCreateDTO,
  ModelProviderUpdateDTO,
  ModelProviderStatusDTO,
} from '@/types/system/provider'

const PREFIX = '/api/v1/admin/system/model-providers'

export const getAiBalance = (refresh?: boolean): Promise<AxiosResponse<R<AiBalanceVO[]>>> =>
  request.get(`${PREFIX}/balance`, { params: { refresh: refresh || undefined } })

/** 分页查询模型服务商列表 */
export const getModelProviderList = (
  params: ModelProviderQueryDTO
): Promise<AxiosResponse<R<any>>> =>
  request.get(`${PREFIX}/list`, { params })

/** 获取模型服务商详情 */
export const getModelProviderDetail = (
  id: string
): Promise<AxiosResponse<R<ModelProviderVO>>> =>
  request.get(`${PREFIX}/${id}`)

/** 新增模型服务商 */
export const createModelProvider = (
  data: ModelProviderCreateDTO
): Promise<AxiosResponse<R<ModelProviderVO>>> =>
  request.post(`${PREFIX}`, data)

/** 修改模型服务商 */
export const updateModelProvider = (
  id: string,
  data: ModelProviderUpdateDTO
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}`, data)

/** 禁用模型服务商（软删除，status->0） */
export const disableModelProvider = (
  id: string
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}/disable`)

/** 修改模型服务商状态 */
export const updateModelProviderStatus = (
  id: string,
  data: ModelProviderStatusDTO
): Promise<AxiosResponse<R<void>>> =>
  request.put(`${PREFIX}/${id}/status`, data)
