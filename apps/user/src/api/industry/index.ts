import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { IndustryListVO, IndustryQueryDTO, IndustryDetailVO } from '@/types/industry'

const PREFIX = '/api/v1/app/industry'

export const getIndustryCategories = () =>
  request.get<R<string[]>>(`${PREFIX}/categories`)

export const getIndustryList = (params: IndustryQueryDTO) =>
  request.get<R<PageResult<IndustryListVO>>>(`${PREFIX}/list`, { params })

export const getIndustryDetail = (industryId: string) =>
  request.get<R<IndustryDetailVO>>(`${PREFIX}/${industryId}/detail`)
