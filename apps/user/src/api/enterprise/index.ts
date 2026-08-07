import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type {
  EnterpriseQueryDTO,
  EnterpriseListVO,
  EnterprisePositionVO,
  EnterpriseIndustryGroupVO,
} from '@/types/enterprise'
import type { IndustryEnterpriseGroupVO } from '@/types/enterprise'

const ENTERPRISE_PREFIX = '/api/v1/app/enterprise'
const INDUSTRY_PREFIX = '/api/v1/app/industry'

export const getEnterpriseList = (params: EnterpriseQueryDTO) =>
  request.get<R<PageResult<EnterpriseListVO>>>(`${ENTERPRISE_PREFIX}/list`, { params })

export const getEnterpriseTypes = () =>
  request.get<R<string[]>>(`${ENTERPRISE_PREFIX}/types`)

export const getEnterpriseDetail = (enterpriseId: string) =>
  request.get<R<EnterpriseListVO>>(`${ENTERPRISE_PREFIX}/${enterpriseId}`)

export const getPositions = (enterpriseId: string) =>
  request.get<R<EnterprisePositionVO[]>>(`${ENTERPRISE_PREFIX}/${enterpriseId}/positions`)

export const getEnterpriseIndustries = (enterpriseIds: string[]) =>
  request.get<R<EnterpriseIndustryGroupVO[]>>(`${ENTERPRISE_PREFIX}/industries`, {
    params: { enterpriseIds },
  })

export const getIndustryEnterprises = (industryIds: string[]) =>
  request.get<R<IndustryEnterpriseGroupVO[]>>(`${INDUSTRY_PREFIX}/enterprises`, {
    params: { industryIds },
  })
