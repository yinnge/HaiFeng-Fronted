import request from '@haifeng/shared/utils/request'
import { getAccessToken } from '@haifeng/shared/utils/auth'
import type { R } from '@haifeng/shared'

const PREFIX = '/api/v1/app/algorithm/pdf'

// ========== 类型定义 ==========

export interface PdfRecordListVO {
  id: string
  planId: string
  planName: string
  status: number // 0=生成中, 1=成功, 2=失败
  createdAt: string
}

export interface PdfRecordDetailVO {
  id: string
  planId: string
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
  universityId: string
  universityName: string
  cityName: string
  groupName: string
  groupSnapshotId: string
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
  planId?: string | number
}

export interface PdfQuotaVO {
  limit: number
  used: number
  remaining: number
}

// ========== API 函数 ==========

/**
 * 获取 PDF 报告生成的 SSE URL（供 ssePost 使用）
 */
export function getGeneratePdfUrl(planId: string): string {
  return `${PREFIX}/generate/${planId}`
}

/**
 * 获取 PDF 报告重新生成的 SSE URL（供 ssePost 使用）
 */
export function getRegeneratePdfUrl(recordId: string): string {
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
export function getPdfRecordDetail(recordId: string) {
  return request.get<R<PdfRecordDetailVO>>(`${PREFIX}/records/${recordId}`)
}

/**
 * 获取当前用户今日 PDF 生成配额（上限 / 已用 / 剩余）
 */
export function getPdfQuotaToday() {
  return request.get<R<PdfQuotaVO>>(`${PREFIX}/quota/today`)
}

/**
 * 下载/查看 PDF（返回 blob）
 */
export async function downloadPdf(recordId: string): Promise<{ blob: Blob; filename: string }> {
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

  // 响应 200 但内容不是 PDF（如网关返回 HTML/JSON 错误页）
  if (blob.type && !blob.type.toLowerCase().includes('pdf')) {
    let msg = '下载失败：响应不是有效的PDF文件'
    try {
      const json = JSON.parse(await blob.text())
      msg = json.msg || msg
    } catch {}
    throw new Error(msg)
  }

  // 支持 filename*=UTF-8''... （RFC 5987，后端中文文件名）优先，其次普通 filename="..."
  const disposition = response.headers.get('Content-Disposition') || ''
  let filename = ''
  const utf8Match = disposition.match(/filename\*=(?:UTF-8|utf-8)''([^;\s]+)/)
  if (utf8Match) {
    filename = decodeURIComponent(utf8Match[1])
  } else {
    const filenameMatch = disposition.match(/filename="?([^";]+)"?/)
    if (filenameMatch) filename = filenameMatch[1]
  }
  if (!filename) filename = `haifeng-report-${recordId}.pdf`

  return { blob, filename }
}

/**
 * 保存 PDF 文件到本地。
 * 注意：浏览器对 blob URL 的读取是异步的，click() 后立即 revoke 会截断文件，
 * 因此延迟 10s 再回收。
 */
export function savePdfFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

/**
 * 删除报告记录（软删除）
 */
export function deletePdfRecord(recordId: string) {
  return request.delete<R<null>>(`${PREFIX}/records/${recordId}`)
}
