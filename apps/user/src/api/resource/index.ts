import request from '@haifeng/shared/utils/request'
import type { R, PageResult } from '@haifeng/shared'
import type { ResourceListVO, ResourceQueryDTO, ResourceUrlVO } from '@/types/resource'

const PREFIX = '/api/v1/app/resource'

export const getResourceCategories = () =>
  request.get<R<string[]>>(`${PREFIX}/categories`)

export const getResourceList = (params: ResourceQueryDTO) =>
  request.get<R<PageResult<ResourceListVO>>>(`${PREFIX}/list`, { params })

export const getResourceUrl = (id: string) =>
  request.get<R<ResourceUrlVO>>(`${PREFIX}/${id}/url`)
