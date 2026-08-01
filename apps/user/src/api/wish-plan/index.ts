import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'

const PREFIX = '/api/v1/app/algorithm/wish-plan'

// ========== 类型定义 ==========

export interface WishPlanLimitVO {
  reachHighCount: number
  reachCount: number
  matchCount: number
  safeCount: number
  floorCount: number
}

export interface WishPlanListVO {
  id: string
  planName: string
  planYear: number
  planProvince: string
  reformModel: string
  planBatch: string
  userScore: number
  userRank: number
  boLimit: number
  chongLimit: number
  wenLimit: number
  baoLimit: number
  dieLimit: number
  createdAt: string
}

export interface WishPlanGroupVO {
  id: string
  groupId: string
  planId: string
  groupSortOrder: number
  universityId: string
  universityName: string
  cityName: string
  category: string
  nature: string
  groupCode: string
  groupName: string
  enrollmentCode: string
  year: number
  province: string
  batch: string
  subjects: string[]
  constraintsDescription: string[]
  description: string
  majorCount: number
  tags: string[]
  recommendationYear: number
  recommendationRate: number
}

export interface WishPlanMajorVO {
  id: string
  groupSnapshotId: string
  majorId: string
  majorSortOrder: number
  majorCode: string
  majorName: string
  duration: string
  tuition: string
  description: string
  admissionCount: number
  safetyLevel: number
  levelShort: string
  historyScores: {
    year: number
    minScore: number
    minRank: number
    avgScore: number
    avgRank: number
    maxScore: number
    maxRank: number
    admissionCount: number
  }[]
}

export interface WishPlanExportProgressVO {
  totalMajors: number
  exportedMajors: number
  percentage: number
  status: 'processing' | 'completed'
  message: string
}

export interface WishPlanExportFileVO {
  downloadUrl: string
  fileName: string
}

// ========== 接口方法 ==========

export const getDefaultLimits = () =>
  request.get<R<WishPlanLimitVO>>(`${PREFIX}/default-limits`)

export const addMajors = (data: { planId: string | null; groupId: string; majorIds: string[] }) =>
  request.post<R<WishPlanListVO>>(`${PREFIX}/add-majors`, data)

export const getMyPlans = () =>
  request.get<R<WishPlanListVO[]>>(`${PREFIX}/my-plans`)

export const deletePlan = (planId: string) =>
  request.delete<R<null>>(`${PREFIX}/${planId}`)

export const getPlanGroups = (planId: string, params?: { page?: number; size?: number }) =>
  request.get<R<{ records: WishPlanGroupVO[]; total: number; size: number; current: number; pages: number }>>(
    `${PREFIX}/${planId}/groups`, { params }
  )

export const getPlanGroupMajors = (planId: string, groupSnapshotId: string, params?: { page?: number; size?: number }) =>
  request.get<R<{ records: WishPlanMajorVO[]; total: number; size: number; current: number; pages: number }>>(
    `${PREFIX}/${planId}/groups/${groupSnapshotId}/majors`, { params }
  )

export const sortPlanGroups = (planId: string, items: { groupId: string; sortOrder: number }[]) =>
  request.put<R<null>>(`${PREFIX}/${planId}/groups/sort`, { items })

export const sortPlanGroupMajors = (planId: string, groupSnapshotId: string, items: { majorId: string; sortOrder: number }[]) =>
  request.put<R<null>>(`${PREFIX}/${planId}/groups/${groupSnapshotId}/majors/sort`, { items })

export const toggleMajorExport = (planId: string, majorId: string, isExported: boolean) =>
  request.put<R<null>>(`${PREFIX}/${planId}/majors/${majorId}/export`, { isExported })

export const toggleGroupExportAll = (planId: string, groupSnapshotId: string, isExported: boolean) =>
  request.put<R<null>>(`${PREFIX}/${planId}/groups/${groupSnapshotId}/export-all`, { isExported })

export const getExportProgress = (planId: string) =>
  request.get<R<WishPlanExportProgressVO>>(`${PREFIX}/${planId}/export/progress`)

export const generateExport = (planId: string) =>
  request.post<R<WishPlanExportFileVO>>(`${PREFIX}/${planId}/export/generate`)

export const downloadExport = (planId: string, file: string) =>
  request.get(`${PREFIX}/${planId}/export/download`, {
    params: { file },
    responseType: 'blob',
  })

export const saveExportStatus = (planId: string) =>
  request.post<R<null>>(`${PREFIX}/${planId}/export/save`)
