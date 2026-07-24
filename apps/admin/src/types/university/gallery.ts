export interface CampusGalleryListVO {
  id: string
  universityId: string
  universityName: string
  imageType: string
  imageUrl: string
  sortOrder: number
  status: number
  createdAt: string
}

export interface CampusGalleryDetailVO {
  id: string
  universityId: string
  universityName: string
  imageType: string
  imageUrl: string
  sortOrder: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface CampusGalleryQueryDTO {
  universityName?: string
  imageType?: string
  status?: number
  page: number
  size: number
}

export interface CampusGalleryAddDTO {
  universityId: string
  imageType: string
  imageUrl: string
  sortOrder?: number
}

export interface CampusGalleryUpdateDTO {
  imageType: string
  imageUrl: string
  sortOrder?: number
  status?: number
}
