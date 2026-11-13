/**
 * 行业详情页共享工具函数与配置。
 *
 * 约定：
 * - 列表页资产（HERO_BG_URL / TONE_COLORS / INDUSTRY_TOOLS / 行业图标映射）只读复用，
 *   通过 re-export 保证「详情页工具与列表一致」且全站只有一份配置（需求 Q3 / Q12）。
 * - 类名前缀 idt-（列表页已占 ind-，前缀必须全库唯一）。
 * - 图标统一 lucide-vue-next、stroke-width 1.75，严禁 Emoji（AGENTS.md 第四节）。
 * - 字号全取整 px；稳态零 transform / filter / will-change。
 *
 * 数据边界（DB 实测 2026-11-13）：
 * - IndustryDetailVO 不含 id / category / description；category 与行业简介长文本只在
 *   IndustryListVO，故主文件额外用 /industry/list?ids= 补一次（需求 Q9）。
 * - t_industry_detail 的 8 个 JSONB 90/90 全为空 {}，short/detailedDescription 全空；
 *   主表仅 9 个概览指标有值（talentGap 全空）→ 正文以主表指标为主体（Q1），
 *   JSONB 走「有值才渲染」的通用容错渲染器（Q11）。
 */
import type { Component } from 'vue'
import {
  BarChart3,
  GraduationCap,
  Landmark,
  MapPinned,
  Minus,
  ScrollText,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Banknote,
} from 'lucide-vue-next'
import {
  HERO_BG_URL,
  TONE_COLORS,
  INDUSTRY_TOOLS,
  HEAT_MAX,
  PLACEHOLDER_EMPTY,
  getIndustryIcon,
  categoryCode,
  categoryName,
  type IconTone,
  type ToneColors,
  type IndustryTool,
} from '../components/utils'

/** 只读复用：列表页与详情页共用同一份配置，改一处两边同步 */
export {
  HERO_BG_URL,
  TONE_COLORS,
  INDUSTRY_TOOLS,
  HEAT_MAX,
  PLACEHOLDER_EMPTY,
  getIndustryIcon,
  categoryCode,
  categoryName,
}
export type { IconTone, ToneColors, IndustryTool }

/* ============ 深度数据：8 个 JSONB 板块 ============ */

export type SectionKey =
  | 'industryScale'
  | 'industryTalentDemand'
  | 'industrySalary'
  | 'policyInfo'
  | 'developmentSupportInfo'
  | 'talentAnalysis'
  | 'talentPolicy'
  | 'salaryData'

export interface IndustrySection {
  key: SectionKey
  title: string
  desc: string
  icon: Component
  tone: IconTone
}

/** 8 个板块的标题与图标固定，不随打开场景变化 */
export const INDUSTRY_SECTIONS: IndustrySection[] = [
  { key: 'industryScale', title: '行业规模', desc: '产业体量与规模变化', icon: BarChart3, tone: 'blue' },
  { key: 'industryTalentDemand', title: '人才需求', desc: '用人需求与岗位缺口', icon: Users, tone: 'green' },
  { key: 'industrySalary', title: '行业薪资', desc: '薪酬区间与分布', icon: Wallet, tone: 'amber' },
  { key: 'policyInfo', title: '政策信息', desc: '国家政策与产业导向', icon: Landmark, tone: 'red' },
  { key: 'developmentSupportInfo', title: '发展支持', desc: '区域布局与重点城市', icon: MapPinned, tone: 'blue' },
  { key: 'talentAnalysis', title: '人才分析', desc: '紧缺岗位与能力要求', icon: GraduationCap, tone: 'green' },
  { key: 'talentPolicy', title: '人才政策', desc: '人才引进与配套政策', icon: ScrollText, tone: 'amber' },
  { key: 'salaryData', title: '薪资数据', desc: '地域差异与趋势分析', icon: Banknote, tone: 'slate' },
]

/**
 * 已知 key → 中文标签。
 * 来源：admin 端 9-Sheet 导入 Excel DTO 与 IndustryServiceImpl.buildJsonbMap() 的字段推断。
 * ⚠️ DB 当前 90/90 全空，此表只是「可读性优化」；未知 key 仍会原样渲染，
 *    不赌任何未经验证的字段名（需求 Q11）。
 */
const KEY_LABELS: Record<string, string> = {
  scaleValue: '规模数值',
  scaleLabel: '规模标签',
  scaleDescriptions: '规模描述',
  demandValue: '需求数值',
  demandLabel: '需求标签',
  demandDescriptions: '需求描述',
  salaryRange: '薪资区间',
  salaryLabel: '薪资标签',
  salaryDescriptions: '薪资说明',
  policyOverview: '政策概览',
  nationalPolicies: '国家政策',
  policyHighlights: '政策亮点',
  regionalOverview: '区域概况',
  keyCities: '重点城市',
  cityPolicies: '城市政策',
  analysisTitle: '分析主题',
  shortagePositions: '紧缺岗位',
  educationRequirement: '学历要求',
  majorRequirement: '专业要求',
  talentTrendDescription: '人才趋势',
  policyTitle: '政策主题',
  localPolicies: '地方政策',
  enterpriseDescription: '企业层面',
  salaryAnalysisTitle: '薪资分析',
  salaryAnalysisDescription: '薪资分析说明',
  regionalSalaryTitle: '地域差异',
  regionalSalaryDescription: '地域差异说明',
  salaryTrendAnalysis: '薪资趋势',
}

export type JsonbFieldType = 'text' | 'number' | 'list' | 'object'

export interface JsonbField {
  key: string
  label: string
  type: JsonbFieldType
  /** text / number 的展示值 */
  text: string
  /** list / object 的展示项 */
  items: string[]
}

function isBlank(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value as object).length === 0
  return false
}

function scalar(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value == null) return ''
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

/**
 * 通用 JSONB 归一化：不假设 key 名，按值类型渲染。
 * - 字符串 / 数字 / 布尔 → 文本或数值
 * - 数组 → 标签列表
 * - 嵌套对象 → 「子键：值」列表
 * - 空值 / 空数组 / 空对象整条跳过
 */
export function toJsonbFields(data: Record<string, any> | null | undefined): JsonbField[] {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return []
  const fields: JsonbField[] = []
  for (const [key, raw] of Object.entries(data)) {
    if (isBlank(raw)) continue
    const label = KEY_LABELS[key] ?? key
    if (Array.isArray(raw)) {
      const items = raw.map(scalar).filter(Boolean)
      if (items.length) fields.push({ key, label, type: 'list', text: '', items })
    } else if (typeof raw === 'object') {
      const items = Object.entries(raw as Record<string, unknown>)
        .filter(([, v]) => !isBlank(v))
        .map(([k, v]) => `${KEY_LABELS[k] ?? k}：${scalar(v)}`)
      if (items.length) fields.push({ key, label, type: 'object', text: '', items })
    } else if (typeof raw === 'number') {
      fields.push({ key, label, type: 'number', text: scalar(raw), items: [] })
    } else {
      const text = scalar(raw)
      if (text) fields.push({ key, label, type: 'text', text, items: [] })
    }
  }
  return fields
}

export function hasJsonbData(data: Record<string, any> | null | undefined): boolean {
  return toJsonbFields(data).length > 0
}

/* ============ 趋势色板（需求 Q10 定案） ============ */

export interface TrendStyle {
  fg: string
  bg: string
  ring: string
  icon: Component
  label: string
  desc: string
}

/**
 * 行业景气度不是股价，按「语义正向」配色：
 * 上升 = 翡翠绿 / 稳定 = 晴空蓝 / 下降 = 丹霞红，与 AGENTS.md「绿=正向、红=预警」一致。
 *
 * ⚠️ 列表页 growthTone() 走 A 股习惯（正增长=红），Q7 约定本次不动列表页，
 *    因此详情页单独使用本函数，不复用列表页的 growthTone，避免混用两套语义。
 */
export function trendStyle(trend?: string | null): TrendStyle {
  const text = (trend ?? '').trim()
  if (text === '上升') {
    return { ...TONE_COLORS.green, icon: TrendingUp, label: '上升', desc: '行业处于扩张通道' }
  }
  if (text === '下降') {
    return { ...TONE_COLORS.red, icon: TrendingDown, label: '下降', desc: '行业处于收缩调整' }
  }
  if (text === '稳定') {
    return { ...TONE_COLORS.blue, icon: Minus, label: '稳定', desc: '行业运行相对平稳' }
  }
  return { ...TONE_COLORS.slate, icon: Minus, label: text || '暂无', desc: '暂无趋势数据' }
}

export type TrendKey = 'growthTrend' | 'marketTrend' | 'talentTrend' | 'investmentTrend'

export interface TrendItem {
  key: TrendKey
  label: string
  hint: string
}

/** 四大趋势的展示顺序与说明文案（值从 IndustryDetailVO 取） */
export const TREND_ITEMS: TrendItem[] = [
  { key: 'growthTrend', label: '增长趋势', hint: '反映行业规模的扩张速度' },
  { key: 'marketTrend', label: '市场趋势', hint: '反映市场供需与景气程度' },
  { key: 'talentTrend', label: '人才趋势', hint: '反映用人需求的变化方向' },
  { key: 'investmentTrend', label: '投资趋势', hint: '反映资本关注度的变化' },
]

/* ============ 数值格式化 ============ */

/**
 * json-bigint(storeAsString) 会把超出安全范围的大整数转成字符串，
 * 普通小数仍是 number；统一用 toNumber 兜一层，避免 '3.60' 被当成字符串拼接。
 */
function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string' && value.trim() !== '') {
    const num = Number(value)
    return Number.isFinite(num) ? num : null
  }
  return null
}

/** 年增长率：+3.6% / -1.2%；缺失返回占位文案 */
export function formatRate(value: unknown): string {
  const num = toNumber(value)
  if (num === null) return PLACEHOLDER_EMPTY
  const abs = Math.abs(num)
  return `${num >= 0 ? '+' : '-'}${Number(abs.toFixed(2))}%`
}

/** 年增长率正负语义色：正=翡翠绿 / 负=丹霞红（与 Q10 同一套语义） */
export function rateStyle(value: unknown): { fg: string; bg: string; icon: Component } {
  const num = toNumber(value)
  const up = num === null || num >= 0
  return {
    fg: up ? TONE_COLORS.green.fg : TONE_COLORS.red.fg,
    bg: up ? TONE_COLORS.green.bg : TONE_COLORS.red.bg,
    icon: up ? TrendingUp : TrendingDown,
  }
}

/** 投资热度：0~100 刻度，DB 实测取值 30~88；缺失返回 null */
export function toHeat(value: unknown): number | null {
  const num = toNumber(value)
  if (num === null) return null
  return Math.max(0, Math.min(HEAT_MAX, num))
}

/** 市场规模等自由文本 */
export function readText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

/**
 * 同门类出口：category 后端是 eq 精准匹配，必须原样写回，不能只传首字母（Q13）。
 */
export function categoryRoute(category: string): { path: string; query: Record<string, string> } {
  return {
    path: '/industry',
    query: category ? { category } : {},
  }
}
