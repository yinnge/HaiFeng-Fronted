import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { CommissionListVO, CommissionQueryDTO } from '@/types/user/commission'

const PREFIX = '/api/v1/admin/user/commission'

export const getCommissionPage = (params: CommissionQueryDTO) =>
  request.get<R<PageResult<CommissionListVO>>>(`${PREFIX}/list`, { params })
