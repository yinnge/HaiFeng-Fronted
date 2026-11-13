/**
 * 城市详情页共享工具函数与配置。
 *
 * 约定（沿用前三轮重构范式）：
 * - CityDetailVO 的 13 个嵌套对象全是 Record<string, any>、无子字段类型，
 *   故一律经 readNum / readText / readList 安全读取，只认页面已在用的 12 个已知 key，不猜新 key。
 * - 数值 0 是合法值（如 500 强数量 = 0），仅 null / undefined / 空串 / 非有限数判空。
 * - 字号取整 px；配色只用四色活力光谱 + slate，无紫色。
 */
import type { Component } from 'vue'
import type { CityDetailVO } from '@/types/city'
import {
  BriefcaseBusiness,
  Building2,
  ChartColumn,
  GraduationCap,
  Home,
  Sparkles,
  TrainFront,
  Users,
} from 'lucide-vue-next'

/** 城市模块 Hero 背景：1024×576，与 views/city/List.vue:13 同一素材（纯 ASCII 路径，无需 encodeURI） */
export const CITY_HERO_BG = `${import.meta.env.BASE_URL}picture/city/city-hero.png`

/* ============ 占位与配色 ============ */

export const PLACEHOLDER_NUMBER = '数据整理中'
export const PLACEHOLDER_TEXT = '内容整理中'
export const PLACEHOLDER_DASH = '—'

export type CityTone = 'blue' | 'green' | 'amber' | 'red' | 'slate'

export interface CityToneColors {
  fg: string
  bg: string
  ring: string
}

/** 四色活力光谱 + slate 中性；工具卡 / 图标底座共用 */
export const CITY_TONES: Record<CityTone, CityToneColors> = {
  blue: { fg: '#2563EB', bg: '#EFF6FF', ring: 'rgba(37,99,235,.18)' },
  green: { fg: '#059669', bg: '#ECFDF5', ring: 'rgba(5,150,105,.18)' },
  amber: { fg: '#D97706', bg: '#FFFBEB', ring: 'rgba(245,158,11,.22)' },
  red: { fg: '#E11D48', bg: '#FFF1F2', ring: 'rgba(225,29,72,.18)' },
  slate: { fg: '#475569', bg: '#F1F5F9', ring: 'rgba(15,23,42,.08)' },
}

/* ============ 安全读取（嵌套对象无类型） ============ */

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

/** 只接受有限数字（含纯数字字符串）；0 合法；空串 / null / NaN 判空 */
export function readNum(source: unknown, key: string): number | null {
  const raw = asRecord(source)?.[key]
  if (raw == null || raw === '') return null
  const value = typeof raw === 'number' ? raw : Number(String(raw).replace(/,/g, ''))
  return Number.isFinite(value) ? value : null
}

/** 文本字段：null / 空串 / 纯空白判空；数字转成字符串 */
export function readText(source: unknown, key: string): string | null {
  const raw = asRecord(source)?.[key]
  if (raw == null) return null
  const text = typeof raw === 'string' ? raw.trim() : typeof raw === 'number' ? String(raw) : ''
  return text || null
}

/** 数组归一化：过滤非字符串 / 空串，不猜测结构 */
export function normalizeList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
}

/** 嵌套对象里的数组字段 */
export function readList(source: unknown, key: string): string[] {
  return normalizeList(asRecord(source)?.[key])
}

/* ============ 格式化 ============ */

/** 千分位 + 单位（中文习惯无空格）；null 走数值占位 */
export function formatNum(value: number | null, unit = ''): string {
  if (value == null) return PLACEHOLDER_NUMBER
  const num = value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
  return unit ? `${num}${unit}` : num
}

/** 比率：先判空再拼 %，避免出现 "-%"；0% 是合法值 */
export function formatRatio(value: number | null): string {
  return value == null ? PLACEHOLDER_NUMBER : `${formatNum(value)}%`
}

/** 文本：空走文本占位 */
export function formatText(value: string | null): string {
  return value || PLACEHOLDER_TEXT
}

/** 基本信息（Hero 信息卡 / 右栏速览）：空走破折号 */
export function formatBasic(value: string | null): string {
  return value || PLACEHOLDER_DASH
}

/* ============ 快捷工具（Q1 选 ①：复制配置，List.vue 零改动） ============ */

export interface CityQuickTool {
  key: string
  label: string
  icon: Component
  tone: CityTone
  to?: string
  action?: 'coming'
}

/**
 * TODO: 与 views/city/List.vue:223-228 抽取共享配置（Q1 裁决：本轮不改 List.vue）。
 * 4 项名称、顺序、3 个目标路径与 AI 项占位行为严格照搬列表页，一个字未改；
 * 仅把第 4 项的紫色底座改为丹霞红（Q3 去紫色），并补图标与语义色。
 */
export const CITY_QUICK_TOOLS: CityQuickTool[] = [
  { key: 'enterprise', label: '企业查询', icon: Building2, tone: 'blue', to: '/enterprise' },
  { key: 'industry', label: '行业分析', icon: ChartColumn, tone: 'green', to: '/industry' },
  { key: 'employment', label: '就业前景', icon: BriefcaseBusiness, tone: 'amber', to: '/employment/civil' },
  { key: 'ai', label: 'AI智能分析', icon: Sparkles, tone: 'red', action: 'coming' },
]

/* ============ 通用指标卡配置（左栏 5 块） ============ */

export interface CityMetricItem {
  label: string
  value: string
}

export interface CityMetricSection {
  key: string
  title: string
  icon: Component
  columns: number
  items: CityMetricItem[]
}

const num = (source: unknown, key: string, unit = '') => formatNum(readNum(source, key), unit)
const ratio = (source: unknown, key: string) => formatRatio(readNum(source, key))
const text = (source: unknown, key: string) => formatText(readText(source, key))

/**
 * Q6：左栏 7 块全部保留、不去重、不新增模块。
 * 其中 5 块结构相同（label/value 网格），由此配置驱动 CityMetricCard 渲染；
 * 「产业发展」「未来规划」结构特殊，走专用组件。
 */
export function buildMetricSections(detail: CityDetailVO): CityMetricSection[] {
  return [
    {
      key: 'economy',
      title: '经济指标',
      icon: ChartColumn,
      columns: 3,
      items: [
        // Q10：以 admin 端表单为权威口径，人均 GDP 统一「万元」（原左栏误写「元」）
        { label: '人均GDP', value: formatNum(detail.perCapitaGdp, '万元') },
        { label: 'GDP增速', value: formatRatio(detail.gdpGrowthRate) },
        { label: '500强数量', value: formatNum(detail.fortune500Count, '家') },
      ],
    },
    {
      key: 'population',
      title: '人口结构',
      icon: Users,
      columns: 4,
      items: [
        { label: '城镇化率', value: formatRatio(detail.urbanizationRate) },
        { label: '农村人口比例', value: formatRatio(detail.ruralPopRatio) },
        { label: '老龄化率', value: formatRatio(detail.agingRate) },
        { label: '流入人口比例', value: formatRatio(detail.migrantPopRatio) },
      ],
    },
    {
      key: 'living',
      title: '生活配套',
      icon: Home,
      columns: 4,
      items: [
        { label: '平均房价', value: num(detail.housingPriceLevel, 'avgPrice', '万/㎡') },
        { label: '市中心租金', value: text(detail.rentalCost, 'downtownRentRange') },
        { label: '人均消费', value: num(detail.consumption, 'perCapitaConsumption', '万/年') },
        { label: '限购政策', value: text(detail.housingPolicy, 'purchaseRestriction') },
      ],
    },
    {
      key: 'education',
      title: '教育医疗',
      icon: GraduationCap,
      columns: 3,
      items: [
        { label: '高校总数', value: num(detail.highEducation, 'totalColleges', '所') },
        { label: '双一流高校', value: num(detail.highEducation, 'doubleFirstClassCount', '所') },
        { label: '学校总数', value: num(detail.basicEducation, 'totalSchools', '所') },
        { label: '重点学校', value: num(detail.basicEducation, 'keySchoolCount', '所') },
        { label: '三甲医院', value: num(detail.medical, 'topHospitalCount', '家') },
        { label: '医生密度', value: num(detail.medical, 'doctorDensity', '人/千人') },
      ],
    },
    {
      key: 'transport',
      title: '交通文化',
      icon: TrainFront,
      columns: 4,
      items: [
        { label: '地铁线路', value: num(detail.transportation, 'metroLines', '条') },
        { label: '高速公路', value: num(detail.transportation, 'highwayMileage', '公里') },
        { label: '世界遗产', value: num(detail.culture, 'worldHeritageCount', '项') },
        { label: 'A级景区', value: num(detail.culture, 'aScenicCount', '家') },
      ],
    },
  ]
}

/** 空对象判定：futurePlan / industryStructure 沿用旧页 v-if 行为 */
export function isEmptyObject(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return true
  return Object.keys(value as Record<string, unknown>).length === 0
}
