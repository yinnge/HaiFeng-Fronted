import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { AiBalanceVO } from '@/types/system/provider'
import type { AxiosResponse } from 'axios'

const PREFIX = '/api/v1/admin/system/model-providers'

export const getAiBalance = (refresh?: boolean): Promise<AxiosResponse<R<AiBalanceVO[]>>> =>
  request.get(`${PREFIX}/balance`, { params: { refresh: refresh || undefined } })
