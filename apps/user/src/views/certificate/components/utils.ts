/**
 * 证书列表页共享工具函数与配置。
 *
 * 约定（与 views/competition/components/utils.ts、views/major/postgrad/components/utils.ts 保持一致）：
 * - 色值统一复用专业详情页已产出的 TONE_COLORS（只读复用，不修改被引用文件）。
 * - 字号全部取整 px，样式里不写分数 px / rem 字号。
 * - 图标统一 lucide-vue-next（AGENTS.md 第四节：严禁 Emoji 图标）。
 * - Hero 背景图复用 HERO_BG_URL（picture/university/列表背景.png），走 JS 内联 url() 注入，不进 CSS 产物。
 */
import type { Component } from 'vue'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import {
  Award,
  BadgeCheck,
  Briefcase,
  Brain,
  Car,
  ClipboardCheck,
  Cpu,
  FileText,
  GraduationCap,
  HardHat,
  Landmark,
  Languages,
  Link,
  ListChecks,
  Palette,
  Scale,
  School,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
} from 'lucide-vue-next'
import {
  HERO_BG_URL,
  TONE_COLORS,
  type IconTone,
  type ToneColors,
} from '../../major/detail/components/utils'

export { HERO_BG_URL, TONE_COLORS }
export type { IconTone, ToneColors }

/* ============ 证书图标两级映射 ============ */

/**
 * ① 证书名称关键词 → 图标 + 语义色（顺序即优先级，越靠前越优先命中）。
 * TODO: 待业务方给出「证书 ↔ 图标」正式映射表后，替换本表即可；
 *      组件层只调用 getCertificateIcon，不直接依赖具体条目。
 */
const KEYWORD_ICONS: Array<[RegExp, Component, IconTone]> = [
  [/计算机|软件|编程|程序|IT|网络|数据库|算法|信息安全/, Cpu, 'blue'],
  [/财会|会计|财务|审计|税务|金融|银行|经济/, Landmark, 'amber'],
  [/语言|外语|英语|日语|翻译|口译|韩语|俄语/, Languages, 'green'],
  [/工程|建筑|土木|结构|造价|施工/, HardHat, 'blue'],
  [/教师|教育|师范|教学|幼师/, School, 'blue'],
  [/医|药|护理|健康|康复|中医/, Stethoscope, 'green'],
  [/法律|法务|律师|司法/, Scale, 'blue'],
  [/驾驶|车辆|汽车|交通|运输/, Car, 'green'],
  [/设计|美术|广告|艺术|平面|视觉/, Palette, 'amber'],
  [/人力|HR|行政管理|企业管理|营销/, Briefcase, 'amber'],
  [/安全|消防|应急|安防|安保/, ShieldCheck, 'green'],
  [/心理|咨询|心理/, Brain, 'blue'],
  [/秘书|行政|办公|公文/, FileText, 'slate'],
  [/考|证|资格|职称/, Award, 'amber'],
]

/** ② 分类关键词 → 图标（名称未命中时按 category 兜底） */
const CATEGORY_ICONS: Array<[RegExp, Component, IconTone]> = [
  [/IT|计算机|软件|信息/, Cpu, 'blue'],
  [/财会|财务|金融|经济/, Landmark, 'amber'],
  [/语言|外语/, Languages, 'green'],
  [/工程|建筑|土木/, HardHat, 'blue'],
  [/教育|师范/, School, 'blue'],
  [/医|药|护理/, Stethoscope, 'green'],
  [/法/, Scale, 'blue'],
  [/设计|艺术/, Palette, 'amber'],
]

/** 最终兜底图标 */
const FALLBACK_ICON = BadgeCheck

export interface CertificateIconResult extends ToneColors {
  icon: Component
}

/**
 * 两级映射 + 兜底：
 * - 名称关键词命中 → 用命中图标与其语义色
 * - 名称未命中 → 按分类关键词兜底
 * - 都未命中 → BadgeCheck + slate 中性色
 */
export function getCertificateIcon(
  certName?: string | null,
  category?: string | null,
): CertificateIconResult {
  for (const [pattern, icon, tone] of KEYWORD_ICONS) {
    if (pattern.test(certName ?? '')) return { icon, ...TONE_COLORS[tone] }
  }
  for (const [pattern, icon, tone] of CATEGORY_ICONS) {
    if (pattern.test(category ?? '')) return { icon, ...TONE_COLORS[tone] }
  }
  return { icon: FALLBACK_ICON, ...TONE_COLORS.slate }
}

/* ============ 分类 / 级别标签配色 ============ */

/**
 * 分类标签：品牌橙柔光底。
 * category 是 DB 去重出来的自由文本（无 CHECK 约束），取值不封闭，
 * 故不做「值 → 色」映射，固定用一套橙系，避免大面积落到回退色。
 */
export function categoryTag(category?: string | null): ToneColors & { text: string } {
  const text = (category ?? '').trim()
  if (!text) return { ...TONE_COLORS.slate, text: '' }
  return { fg: '#C2410C', bg: '#FFF7ED', ring: 'rgba(249,115,22,.2)', text }
}

/**
 * 级别标签：向日葵黄系。
 * cert_level 同样是自由文本（可能是「初级/中级/高级」，也可能是其它表述），
 * 与分类同理固定一套色，不按值映射。
 */
export function levelTag(certLevel?: string | null): ToneColors & { text: string } {
  const text = (certLevel ?? '').trim()
  if (!text) return { ...TONE_COLORS.slate, text: '' }
  return { fg: '#B45309', bg: '#FFFBEB', ring: 'rgba(245,158,11,.22)', text }
}

/* ============ 在线工具快捷入口 ============ */

export interface CertificateTool {
  key: string
  label: string
  icon: Component
  tone: IconTone
  to?: string
  action?: 'coming' | 'expert'
  soon?: boolean
}

/**
 * 证书列表页右侧「在线工具」入口。
 * - 院校库查询 / 专业库查询 → 已有路由，直接跳
 * - 就业服务 / AI智能规划 → 功能未上线，点击提示「敬请期待」
 * - 专家一对一指导 → 复用 useExpertContact.open()
 */
export const CERTIFICATE_TOOLS: CertificateTool[] = [
  { key: 'university', label: '院校库查询', icon: School, tone: 'blue', to: '/university' },
  { key: 'major', label: '专业库查询', icon: GraduationCap, tone: 'green', to: '/major' },
  { key: 'employment', label: '就业服务', icon: Briefcase, tone: 'blue', action: 'coming', soon: true },
  { key: 'ai', label: 'AI智能规划', icon: Sparkles, tone: 'amber', action: 'coming', soon: true },
  { key: 'expert', label: '专家一对一指导', icon: UserRound, tone: 'green', action: 'expert' },
]

/* ============ 分页与 URL 状态同步 ============ */

export const PAGE_SIZES = [10, 20, 30, 50, 100] as const
export const DEFAULT_PAGE_SIZE = 10

export interface UrlState {
  page: number
  size: number
  certName: string
  category: string
}

export const DEFAULT_URL_STATE: UrlState = {
  page: 1,
  size: DEFAULT_PAGE_SIZE,
  certName: '',
  category: '',
}

function readString(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

/** 从 route.query 反向恢复；分页值必须落在后端允许的 [10,100] */
export function parseUrlState(query: LocationQuery): UrlState {
  const page = Number(query.page)
  const size = Number(query.size)

  return {
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    size: (PAGE_SIZES as readonly number[]).includes(size) ? size : DEFAULT_PAGE_SIZE,
    certName: readString(query.certName, 100),
    category: readString(query.category, 50),
  }
}

/** 只写非默认值，保持 URL 干净；key 顺序固定，便于 stableQueryString 防循环 */
export function buildQuery(state: UrlState): LocationQueryRaw {
  const query: LocationQueryRaw = {}
  if (state.page > 1) query.page = String(state.page)
  if (state.size !== DEFAULT_PAGE_SIZE) query.size = String(state.size)
  if (state.certName) query.certName = state.certName
  if (state.category) query.category = state.category
  return query
}

export function stableQueryString(query: LocationQueryRaw): string {
  return Object.keys(query)
    .sort()
    .map((key) => `${key}=${String(query[key] ?? '')}`)
    .join('&')
}

/* ============ 其它 ============ */

/** 证书简介缺失时的占位文案 */
export const PLACEHOLDER_INTRO = '证书简介整理中'

/** 适用专业缺失时的占位文案 */
export const PLACEHOLDER_MAJOR = '适用专业待补充'

/** 考试时间缺失时的占位文案 */
export const PLACEHOLDER_EXAM_TIME = '考试时间待公布'

/** 考试费用缺失时的占位文案 */
export const PLACEHOLDER_EXAM_FEE = '费用待公布'

/** 摘要：证书简介缺失时回落到占位文案 */
export function normalizeIntro(value?: string | null): string {
  const text = (value ?? '').trim()
  return text || PLACEHOLDER_INTRO
}

/** 适用专业：缺失时回落到占位文案 */
export function normalizeMajor(value?: string | null): string {
  const text = (value ?? '').trim()
  return text || PLACEHOLDER_MAJOR
}

/** 考试时间：缺失时回落到占位文案 */
export function normalizeExamTime(value?: string | null): string {
  const text = (value ?? '').trim()
  return text || PLACEHOLDER_EXAM_TIME
}

/** 考试费用：0 元是合法值，只有 null / undefined 才回落到占位文案 */
export function normalizeExamFee(value?: number | null): string {
  if (value === null || value === undefined) return PLACEHOLDER_EXAM_FEE
  return `¥${value.toLocaleString('zh-CN')}`
}

/* ============ Hero 特性项 ============ */

/** Hero 底部 4 个不可点击的说明项：无背景、无描边、无 pointer、无 hover */
export const HERO_FEATURES: Array<{ icon: Component; label: string; tone: IconTone }> = [
  { icon: ListChecks, label: '证书分类', tone: 'blue' },
  { icon: Award, label: '等级分层', tone: 'amber' },
  { icon: ClipboardCheck, label: '报考要求', tone: 'green' },
  { icon: Link, label: '官方链接', tone: 'blue' },
]
