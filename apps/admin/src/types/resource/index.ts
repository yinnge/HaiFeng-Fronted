export interface ResourceListVO {
  id: string
  resourceName: string
  category: string
  fileType: string
  viewCount: number
  isDeleted: boolean
  updatedAt: string
}

export interface ResourceDetailVO {
  id: string
  resourceName: string
  coverUrl: string
  description: string
  resourceUrl: string
  accessCode: string
  category: string
  fileType: string
  viewCount: number
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface ResourceQueryDTO {
  resourceName?: string
  category?: string
  isDeleted?: boolean
  page: number
  size: number
}

export interface ResourceAddDTO {
  resourceName: string
  coverUrl?: string
  description?: string
  resourceUrl: string
  accessCode?: string
  category?: string
  fileType?: string
  sortOrder?: number
}

export interface ResourceUpdateDTO {
  resourceName?: string
  coverUrl?: string
  description?: string
  resourceUrl?: string
  accessCode?: string
  category?: string
  fileType?: string
  sortOrder?: number
}
