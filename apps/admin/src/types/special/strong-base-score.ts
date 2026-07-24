export interface StrongBaseScoreListVO {
  id: string
  universityName: string
  year: number
  province: string
  subjectType: string
  majorName: string
  isActive: boolean
}

export interface StrongBaseScoreDetailVO {
  id: string
  universityId: string
  universityName: string
  year: number
  province: string
  subjectType: string
  majorName: string
  majorCode: string | null
  entryScore: number | null
  entryScoreType: string | null
  entryFormula: string | null
  entryRatio: string | null
  admissionScore: number | null
  admissionFormula: string | null
  planCount: number | null
  admissionCount: number | null
  remark: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StrongBaseScoreQueryDTO {
  page: number
  size: number
  universityName?: string
  year?: number
  province?: string
  subjectType?: string
}

export interface StrongBaseScoreAddDTO {
  universityId: string
  universityName: string
  year?: number
  province: string
  subjectType: string
  majorName: string
  majorCode?: string
  entryScore?: number
  entryScoreType?: string
  entryFormula?: string
  entryRatio?: string
  admissionScore?: number
  admissionFormula?: string
  planCount?: number
  admissionCount?: number
  remark?: string
}

export interface StrongBaseScoreUpdateDTO {
  universityId: string
  universityName: string
  year?: number
  province: string
  subjectType: string
  majorName: string
  majorCode?: string
  entryScore?: number
  entryScoreType?: string
  entryFormula?: string
  entryRatio?: string
  admissionScore?: number
  admissionFormula?: string
  planCount?: number
  admissionCount?: number
  remark?: string
}
