export interface UniversityGuideListVO {
  id: string
  universityId: string
  universityName: string
  customTags: string[]
  remark: string
  status: number
  createdAt: string
}

export interface UniversityGuideDetailVO {
  id: string
  universityId: string
  universityName: string
  customTags: string[]
  campusFacilities: Record<string, any>
  dormitoryServices: Record<string, any>
  campusTransportation: Record<string, any>
  academicGuidance: Record<string, any>
  majorTransferGuidelines: Record<string, any>
  majorTransferConstriction: Record<string, any>
  academicSupportResources: Record<string, any>
  studentOrganizations: Record<string, any>
  campusEvents: Record<string, any>
  classDormSocial: Record<string, any>
  financialAid: Record<string, any>
  campusSecurity: Record<string, any>
  healthServices: Record<string, any>
  lifeServices: Record<string, any>
  remark: string
  status: number
  createdAt: string
  updatedAt: string
}

export interface UniversityGuideQueryDTO {
  universityName?: string
  status?: number
  page: number
  size: number
}

export interface UniversityGuideAddDTO {
  universityId: string
  customTags?: string[]
  campusFacilities?: Record<string, string[]>
  dormitoryServices?: Record<string, string[]>
  campusTransportation?: Record<string, string[]>
  academicGuidance?: Record<string, string[]>
  majorTransferGuidelines?: Record<string, string[]>
  majorTransferConstriction?: Record<string, string[]>
  academicSupportResources?: Record<string, string[]>
  studentOrganizations?: Record<string, string[]>
  campusEvents?: Record<string, string[]>
  classDormSocial?: Record<string, string[]>
  financialAid?: Record<string, string[]>
  campusSecurity?: Record<string, string[]>
  healthServices?: Record<string, string[]>
  lifeServices?: Record<string, string[]>
  remark?: string
}

export interface UniversityGuideUpdateDTO {
  customTags?: string[]
  campusFacilities?: Record<string, string[]>
  dormitoryServices?: Record<string, string[]>
  campusTransportation?: Record<string, string[]>
  academicGuidance?: Record<string, string[]>
  majorTransferGuidelines?: Record<string, string[]>
  majorTransferConstriction?: Record<string, string[]>
  academicSupportResources?: Record<string, string[]>
  studentOrganizations?: Record<string, string[]>
  campusEvents?: Record<string, string[]>
  classDormSocial?: Record<string, string[]>
  financialAid?: Record<string, string[]>
  campusSecurity?: Record<string, string[]>
  healthServices?: Record<string, string[]>
  lifeServices?: Record<string, string[]>
  remark?: string
  status?: number
}
