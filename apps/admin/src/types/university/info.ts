export interface UniversityListVO {
  id: string
  name: string
  provinceName: string
  cityName: string
  region: string
  category: string
  majorCount: number
  educationLevel: string
  nature: string
  status: number
  createdAt: string
}

export interface RankingsVO {
  ruanke: number | null
  xiaoyouhui: number | null
  wushulian: number | null
  qs: number | null
  usnews: number | null
}

export interface UniversityDetailVO {
  id: string
  name: string
  nameEn: string
  provinceName: string
  cityName: string
  region: string
  category: string
  majorCount: number
  educationLevel: string
  nature: string
  recommendationRate: number | null
  recommendationYear: number | null
  hasDoctorate: boolean
  hasMaster: boolean
  department: string
  tags: string[]
  famousUnion: string
  imageUrl: string
  introduction: string
  sortOrder: number
  status: number
  createdAt: string
  updatedAt: string
  detailId: string | null
  address: string
  admissionPhone: string
  website: string
  historyGroupScore: number | null
  scienceGroupScore: number | null
  carouselImages: string[]
  detailIntroduction: string
  rankings: RankingsVO
  abroadRate: string
  genderRatio: string
}

export interface UniversityQueryDTO {
  name?: string
  provinceName?: string
  category?: string
  status?: number
  page: number
  size: number
}

export interface UniversityAddDTO {
  name: string
  nameEn: string
  provinceName: string
  cityName: string
  region: string
  category: string
  majorCount?: number
  educationLevel?: string
  nature?: string
  recommendationRate?: number
  recommendationYear?: number
  hasDoctorate?: boolean
  hasMaster?: boolean
  department?: string
  tags?: string[]
  famousUnion?: string
  imageUrl?: string
  introduction?: string
  sortOrder?: number
}

export interface UniversityUpdateDTO extends UniversityAddDTO {
  status?: number
}

export interface UniversityDetailUpdateDTO {
  address?: string
  admissionPhone?: string
  website?: string
  historyGroupScore?: number
  scienceGroupScore?: number
  carouselImages?: string[]
  introduction?: string
  rankings?: Record<string, number>
  abroadRate?: string
  genderRatio?: string
  sortOrder?: number
  status?: number
}
