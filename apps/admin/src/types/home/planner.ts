export interface PlannerListVO {
  id: string
  name: string
  position: string | null
  region: string | null
  avatar: string | null
  specialty: string | null
  sortOrder: number
  status: number
}

export interface PlannerDetailVO {
  id: string
  name: string
  position: string | null
  region: string | null
  avatar: string | null
  specialty: string | null
  douyinName: string | null
  douyinUrl: string | null
  personalDescription: string | null
  experienceJob: string | null
  achievements: string[] | null
  expertiseAreas: string[] | null
  sortOrder: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface PlannerQueryDTO {
  name?: string
  status?: number
  page: number
  size: number
}

export interface PlannerAddDTO {
  name: string
  position?: string
  region?: string
  avatar?: string
  specialty?: string
  douyinName?: string
  douyinUrl?: string
  personalDescription?: string
  experienceJob?: string
  achievements?: string[]
  expertiseAreas?: string[]
  sortOrder?: number
}

export interface PlannerUpdateDTO {
  name: string
  position?: string
  region?: string
  avatar?: string
  specialty?: string
  douyinName?: string
  douyinUrl?: string
  personalDescription?: string
  experienceJob?: string
  achievements?: string[]
  expertiseAreas?: string[]
  sortOrder?: number
}
