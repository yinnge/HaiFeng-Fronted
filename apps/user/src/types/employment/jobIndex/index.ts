// apps/user/src/types/employment/jobIndex/index.ts
export interface JobSearchDTO {
  page?: number
  size?: number
  keyword?: string
  province?: string
  city?: string
  educationRequirement?: string
  recruitmentType?: string
  salaryMin?: number
  salaryMax?: number
  positionStatus?: string
  categoryLabel?: string
}

export interface JobIndexListVO {
  id: string
  categoryLabel: string
  positionName: string
  organizationName: string
  city: string
  educationRequirement: string
  recruitmentType: string
  salaryText: string
  positionStatus: string
}

export interface JobIndexDetailVO {
  id: string
  sourceType: string
  sourceId: string
  categoryLabel: string
  positionName: string
  organizationName: string
  organizationLogo: string
  province: string
  city: string
  educationRequirement: string
  recruitmentCount: number
  recruitmentType: string
  salaryMin: number
  salaryMax: number
  salaryText: string
  positionStatus: string
  publishDate: string
  regDeadline: string
  isHot: boolean
  viewCount: number
  applyCount: number
}
