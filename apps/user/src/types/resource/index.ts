import type { BasePageQuery } from '@haifeng/shared'

export interface ResourceQueryDTO extends BasePageQuery {
  resourceName?: string
  category?: string
}

export interface ResourceListVO {
  id: number
  resourceName: string
  coverUrl: string
  description: string
  category: string
  fileType: string
  viewCount: number
}

export interface ResourceUrlVO {
  resourceUrl: string
  accessCode: string
}
