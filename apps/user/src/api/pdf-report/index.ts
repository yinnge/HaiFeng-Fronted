import request from '@haifeng/shared/utils/request'
import { getAccessToken } from '@haifeng/shared/utils/auth'
import type { R } from '@haifeng/shared'

const PREFIX = '/api/v1/app/algorithm/pdf'

// ========== 类型定义 ==========

export interface PdfRecordListVO {
  id: number
  planId: number
  planName: string
  status: number // 0=生成中, 1=成功, 2=失败
  createdAt: string
}

export interface PdfRecordDetailVO {
  id: number
  planId: number
  planName: string
  status: number
  mapResults: string | null
  reduceResult: string | null
  planSnapshot: string | null
  failReason: string | null
  createdAt: string
}

export interface PdfRecordListResult {
  records: PdfRecordListVO[]
  total: number
  size: number
  current: number
  pages: number
}

export interface MapResultItem {
  universityId: number
  universityName: string
  cityName: string
  groupName: string
  groupSnapshotId: number
  majors: MapResultMajor[]
  commentary: string | null
  success: boolean
}

export interface MapResultMajor {
  majorName: string
  safetyLevel: number
  levelShort: string
  employmentRate: number | null
  salaryMin: number | null
  salaryMax: number | null
  majorCategory: string | null
  careerProspect: string | null
}

export interface ReduceResult {
  globalAnalysis: string | null
  swot: string | null
  recommendation: string | null
}

export interface PlanSnapshot {
  planYear: number
  planProvince: string
  reformModel: string
  userScore: number
  userRank: number
  planBatch: string
}

export interface PdfRecordListQuery {
  page?: number
  size?: number
  status?: number
  planId?: number
}

// ========== API 函数 ==========

/**
 * 获取 PDF 报告生成的 SSE URL（供 ssePost 使用）
 */
export function getGeneratePdfUrl(planId: number): string {
  return `${PREFIX}/generate/${planId}`
}

/**
 * 获取 PDF 报告重新生成的 SSE URL（供 ssePost 使用）
 */
export function getRegeneratePdfUrl(recordId: number): string {
  return `${PREFIX}/records/${recordId}/regenerate`
}

/**
 * 获取历史报告记录列表
 */
export function getPdfRecords(params: PdfRecordListQuery = {}) {
  return request.get<R<PdfRecordListResult>>(`${PREFIX}/records`, { params })
}

/**
 * 获取报告记录详情
 */
export function getPdfRecordDetail(recordId: number) {
  return request.get<R<PdfRecordDetailVO>>(`${PREFIX}/records/${recordId}`)
}

/**
 * 下载/查看 PDF（返回 blob）
 */
export async function downloadPdf(recordId: number): Promise<{ blob: Blob; filename: string }> {
  const token = getAccessToken()
  const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  const url = `${baseUrl}${PREFIX}/records/${recordId}/pdf`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    let msg = `下载失败 (${response.status})`
    try {
      const json = JSON.parse(text)
      msg = json.msg || msg
    } catch {}
    throw new Error(msg)
  }

  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition')
  const filenameMatch = disposition && disposition.match(/filename="?([^"]+)"?/)
  const filename = filenameMatch ? filenameMatch[1] : `haifeng-report-${recordId}.pdf`

  return { blob, filename }
}

/**
 * 删除报告记录（软删除）
 */
export function deletePdfRecord(recordId: number) {
  return request.delete<R<null>>(`${PREFIX}/records/${recordId}`)
}
