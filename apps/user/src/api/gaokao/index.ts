import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'

const PREFIX = '/api/v1/app/gaokao'
const CONSTRAINT_PREFIX = '/api/v1/app/constraint'
const ADMISSION_PREFIX = '/api/v1/app/admission'

// ========== 约束相关类型 ==========

export interface ConstraintItem {
  code: string
  name: string
  category: string
  description: string
  severity: 'HARD' | 'SOFT'
}

export interface ConstraintConflict {
  code: string
  name: string
  description: string
}

export interface ConstraintCheckResult {
  isPass: boolean
  hardConflicts: ConstraintConflict[]
  softConflicts: ConstraintConflict[]
}

// ========== 录取查询相关类型 ==========

export interface YearScoreVO {
  year: number
  minScore: number
  minRank: number
  avgScore: number
  avgRank: number
  maxScore: number
  maxRank: number
  admissionCount: number
}

export interface AdmissionGroupVO {
  id: string
  masked: boolean
  safetyLevel: number
  levelShort: string
  safetyDescription: string
  universityName: string
  cityName: string
  enrollmentCode: string
  groupCode: string
  groupName: string
  subjects: string[]
  requirementType: string
  description: string
  majorCount: number
  categoryCount: number
  constraints: string[]
  subjectMatch: boolean
  subjectMatchReason: string | null
  historyScores: YearScoreVO[]
}

export interface AdmissionMajorVO {
  id: string
  safetyLevel: number
  levelShort: string
  safetyDescription: string
  majorCode: string
  majorName: string
  educationLevel: string
  duration: string
  tuition: string
  description: string
  constraints: string[]
  historyScores: YearScoreVO[]
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export interface ReformModelData {
  reformModel: string
  subjects: {
    first: string[]
    second?: string[]
  }
}

export interface RankData {
  rank: number
  sameScoreCount: number
}

export interface BatchLine {
  batch: string
  scoreLine: number
  rankLine: number
}

export interface BatchLinesData {
  dataYear: number
  isCurrentYear: boolean
  batches: BatchLine[]
}

export interface GaokaoArchiveForm {
  gaokaoYear: number
  gaokaoProvince: string
  score: number
  rank: number
  subjectType: string
  batch: string
  batchDataYear: number
  batchLineScore: number
  scoreChinese?: number
  scoreMath?: number
  scoreEnglish?: number
  foreignLanguage?: string
  // 选考科目分数（命名字段，直接对应 DB 列）
  scorePhysics?: number
  scoreChemistry?: number
  scoreBiology?: number
  scorePolitics?: number
  scoreHistory?: number
  scoreGeography?: number
  isColorBlind?: boolean
  isColorWeak?: boolean
  visionLeft?: number
  visionRight?: number
  hasSmellDisorder?: boolean
  heightCm?: number
  weightKg?: number
  isLeftHanded?: boolean
  hasTattoo?: boolean
  hasScar?: boolean
  hasStutter?: boolean
  isFreshGraduate?: boolean
  politicalStatus?: string
  householdType?: string
  isPovertyCounty?: boolean
}

export interface GaokaoArchiveVO extends GaokaoArchiveForm {
  id: string
  reformModel: string
  scoreAboveLine: number
}

export const getReformModel = (params: { province: string; year: number }) =>
  request.get<R<ReformModelData>>(`${PREFIX}/reform-model`, { params })

export const getRank = (params: {
  province: string
  year: number
  subjectType: string
  score: number
}) => request.get<R<RankData>>(`${PREFIX}/rank`, { params })

export const getBatchLines = (params: {
  province: string
  year: number
  subjectType: string
}) => request.get<R<BatchLinesData>>(`${PREFIX}/batch-lines`, { params })

export const saveArchive = (data: GaokaoArchiveForm) =>
  request.post<R<number>>(`${PREFIX}/archive`, data)

export const getArchive = () =>
  request.get<R<GaokaoArchiveVO | null>>(`${PREFIX}/archive`)

// ========== 约束接口 ==========

export const matchConstraints = () =>
  request.get<R<{ constraintCodes: string[] }>>(`${CONSTRAINT_PREFIX}/match`)

export const getConstraintDetails = (codes: string[]) =>
  request.post<R<{ constraints: ConstraintItem[] }>>(`${CONSTRAINT_PREFIX}/details`, { codes })

export const checkGroupConstraint = (groupId: string) =>
  request.post<R<ConstraintCheckResult>>(`${CONSTRAINT_PREFIX}/check-group`, { groupId })

// ========== 录取查询接口 ==========

export const getGroupPage = (params: {
  batch: string
  universityName?: string
  cityName?: string
  subjectFilter?: boolean
  page?: number
  size?: number
}) => request.get<R<PageResult<AdmissionGroupVO>>>(`${ADMISSION_PREFIX}/group/page`, { params })

export const getMajorPage = (params: {
  groupId: string
  majorName?: string
  majorCode?: string
  page?: number
  size?: number
}) => request.get<R<PageResult<AdmissionMajorVO>>>(`${ADMISSION_PREFIX}/major/page`, { params })
