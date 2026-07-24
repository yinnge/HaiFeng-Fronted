export interface EnterpriseListVO {
  id: string
  cityName: string | null
  enterpriseName: string
  enterpriseNature: string
  enterpriseType: string | null
  recruitmentStatus: string
  isDeleted: boolean
  createdAt: string
}

export interface PositionVO {
  id: string
  enterpriseId: string
  positionName: string
  recruitmentType: string | null
  positionRequirement: string | null
  positionTags: string[] | null
  province: string | null
  city: string | null
  workLocation: string | null
  educationRequirement: string | null
  majorRequirement: string | null
  workExperience: string | null
  salaryMin: number | null
  salaryMax: number | null
  applyLink: string | null
  deadline: string | null
  positionStatus: string | null
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface EnterpriseDetailVO {
  id: string
  cityName: string | null
  enterpriseName: string
  enterpriseNature: string
  enterpriseType: string | null
  logoUrl: string | null
  officialWebsite: string | null
  region: string | null
  enterpriseScale: string | null
  mainBusiness: string | null
  enterpriseIntro: string | null
  recruitmentStatus: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
  positions: PositionVO[]
}

export interface EnterpriseQueryDTO {
  page: number
  size: number
  cityName?: string
  enterpriseName?: string
  enterpriseNature?: string
  enterpriseType?: string
  recruitmentStatus?: string
  isDeleted?: boolean
}

export interface EnterpriseAddDTO {
  cityName?: string
  enterpriseName: string
  enterpriseNature: string
  enterpriseType?: string
  logoUrl?: string
  officialWebsite?: string
  region?: string
  enterpriseScale?: string
  mainBusiness?: string
  enterpriseIntro?: string
  recruitmentStatus?: string
}

export interface EnterpriseUpdateDTO {
  cityName?: string
  enterpriseName: string
  enterpriseNature: string
  enterpriseType?: string
  logoUrl?: string
  officialWebsite?: string
  region?: string
  enterpriseScale?: string
  mainBusiness?: string
  enterpriseIntro?: string
  recruitmentStatus?: string
}

export interface StatusDTO {
  isDeleted: boolean
}

export interface EnterpriseIndustryListVO {
  id: string
  enterpriseId: string
  enterpriseName: string
  industryId: string
  industryName: string
  isPrimary: boolean
  sortOrder: number
  createdAt: string
}

export interface EnterpriseIndustryDetailVO {
  id: string
  enterpriseId: string
  enterpriseName: string
  industryId: string
  industryName: string
  isPrimary: boolean
  sortOrder: number
  createdAt: string
}

export interface EnterpriseIndustryQueryDTO {
  page: number
  size: number
  enterpriseName?: string
  industryName?: string
}
