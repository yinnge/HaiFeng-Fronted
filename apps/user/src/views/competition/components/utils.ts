/**
 * 竞赛列表页共享工具函数与配置。
 *
 * 约定（与 views/major/postgrad/components/utils.ts 保持一致）：
 * - 色值统一复用专业详情页已产出的 TONE_COLORS（只读复用，不修改被引用文件）。
 * - 字号全部取整 px，样式里不写分数 px / rem 字号。
 * - 图标统一 lucide-vue-next（AGENTS.md 第四节：严禁 Emoji 图标）。
 * - Hero 背景图复用专业详情页 HERO_BG_URL（picture/university/列表背景.png）。
 */
import type { Component } from 'vue'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import {
  Atom,
  Award,
  Bot,
  Briefcase,
  Building2,
  Boxes,
  Cpu,
  FlaskConical,
  GraduationCap,
  Landmark,
  Languages,
  Lightbulb,
  Medal,
  Microscope,
  Palette,
  Rocket,
  Scale,
  School,
  Sigma,
  Sparkles,
  Sprout,
  Target,
  Trophy,
  UserRound,
  Wrench,
} from 'lucide-vue-next'
import {
  HERO_BG_URL,
  TONE_COLORS,
  type IconTone,
  type ToneColors,
} from '../../major/detail/components/utils'

export { HERO_BG_URL, TONE_COLORS }
export type { IconTone, ToneColors }

/* ============ 竞赛级别 ============ */

/**
 * 竞赛级别兜底选项。
 * 后端 t_competition.comp_level 是无 CHECK 约束的自由 VARCHAR(50)，
 * 实际库中可能出现「市级」「院系级」等取值，故列表项由接口数据动态聚合，
 * 这里只保证三项常见级别在空库时也不至于无选项。
 */
export const DEFAULT_LEVEL_OPTIONS = ['国家级', '省级', '校级'] as const

/** 级别 → 语义色 + 图标（赛事/荣誉类用向日葵黄，见 AGENTS.md 色彩令牌表） */
const LEVEL_STYLES: Record<string, { icon: Component; tone: IconTone }> = {
  国家级: { icon: Trophy, tone: 'amber' },
  省级: { icon: Medal, tone: 'blue' },
  校级: { icon: Award, tone: 'slate' },
}

/** 竞赛级别 → 语义标签配色；未知级别回退中性 slate */
export function levelTag(compLevel?: string | null): ToneColors & { text: string } {
  const text = (compLevel ?? '').trim()
  if (!text) return { ...TONE_COLORS.slate, text: '' }
  const tone = LEVEL_STYLES[text]?.tone ?? 'slate'
  return { ...TONE_COLORS[tone], text }
}

/* ============ 竞赛图标两级映射 ============ */

/**
 * ① 竞赛名称关键词 → 图标（顺序即优先级，越靠前越优先命中）。
 * TODO: 待业务方给出「竞赛 ↔ 图标」正式映射表后，替换本表即可；
 *      组件层只调用 getCompetitionIcon，不直接依赖具体条目。
 */
const KEYWORD_ICONS: Array<[RegExp, Component]> = [
  [/数学|建模|运筹/, Sigma],
  [/机器人|智能车|无人/, Bot],
  [/程序|软件|算法|代码|黑客/, Cpu],
  [/电子|电路|硬件/, Wrench],
  [/化学|化工|材料/, FlaskConical],
  [/生物|基因|实验/, Microscope],
  [/物理|力学|光电/, Atom],
  [/建筑|结构|土木/, Building2],
  [/经济|金融|贸易/, Landmark],
  [/法律|辩论|模拟法庭/, Scale],
  [/教育|教学|师范/, School],
  [/农|林|园艺/, Sprout],
  [/设计|美术|广告|艺术/, Palette],
  [/创业|创新|挑战杯|互联网\+/, Rocket],
  [/英语|外语|口译/, Languages],
  [/数学|算法|智能/, Sparkles],
]

/** ② 竞赛级别兜底图标；最终兜底 Trophy */
const FALLBACK_ICON = Trophy

export interface CompetitionIconResult extends ToneColors {
  icon: Component
}

/**
 * 两级映射 + 兜底：
 * - 关键词命中 → 用命中图标，底座色仍取「级别色」（同一级别视觉一致，语义稳定）
 * - 关键词未命中 → 用级别兜底图标
 * - 级别也未知 → Trophy + slate
 */
export function getCompetitionIcon(
  compName?: string | null,
  compLevel?: string | null,
): CompetitionIconResult {
  const level = (compLevel ?? '').trim()
  const levelStyle = LEVEL_STYLES[level]
  const colors = TONE_COLORS[levelStyle?.tone ?? 'slate']

  for (const [pattern, icon] of KEYWORD_ICONS) {
    if (pattern.test(compName ?? '')) return { icon, ...colors }
  }
  return { icon: levelStyle?.icon ?? FALLBACK_ICON, ...colors }
}

/* ============ 热门竞赛热度（展示值） ============ */

/**
 * 展示用热度指数：按排名位置取固定值，非实时、非真实统计。
 * 与考研页 HOT_INDEX_BY_RANK 同款做法；后端 CompetitionListVO 未提供热度字段。
 * TODO: 后端提供真实热度字段后替换此常量
 */
export const HOT_INDEX_BY_RANK = [9865, 8420, 7310, 6540, 5820]

export function formatHotIndex(value?: number): string {
  return typeof value === 'number' ? value.toLocaleString('zh-CN') : ''
}

/* ============ 在线工具快捷入口 ============ */

export interface CompetitionTool {
  key: string
  label: string
  icon: Component
  tone: IconTone
  to?: string
  action?: 'coming' | 'expert'
  soon?: boolean
}

/**
 * 竞赛列表页右侧「在线工具」入口。
 * - 院校库查询 / 专业库查询 → 已有路由，直接跳
 * - 就业服务 / AI智能规划 → 功能未上线，点击提示「敬请期待」
 * - 专家一对一指导 → 复用 useExpertContact.open()
 */
export const COMPETITION_TOOLS: CompetitionTool[] = [
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
  compName: string
  compLevel: string
}

export const DEFAULT_URL_STATE: UrlState = {
  page: 1,
  size: DEFAULT_PAGE_SIZE,
  compName: '',
  compLevel: '',
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
    compName: readString(query.compName, 100),
    compLevel: readString(query.compLevel, 20),
  }
}

/** 只写非默认值，保持 URL 干净；key 顺序固定，便于 stableQueryString 防循环 */
export function buildQuery(state: UrlState): LocationQueryRaw {
  const query: LocationQueryRaw = {}
  if (state.page > 1) query.page = String(state.page)
  if (state.size !== DEFAULT_PAGE_SIZE) query.size = String(state.size)
  if (state.compName) query.compName = state.compName
  if (state.compLevel) query.compLevel = state.compLevel
  return query
}

export function stableQueryString(query: LocationQueryRaw): string {
  return Object.keys(query)
    .sort()
    .map((key) => `${key}=${String(query[key] ?? '')}`)
    .join('&')
}

/* ============ 其它 ============ */

/** 报名时间为自由文本（如「每年3月/9月」），缺失时的占位文案 */
export const PLACEHOLDER_REGISTRATION = '报名时间待公布'

export function normalizeRegistration(value?: string | null): string {
  const text = (value ?? '').trim()
  return text || PLACEHOLDER_REGISTRATION
}

/** 价值卡图标（替换旧页的 🏆 / 🧠 / 🌐 Emoji） */
export const VALUE_CARD_ICONS: Array<{
  icon: Component
  bg: string
  fg: string
  title: string
  desc: string
}> = [
  {
    icon: Target,
    bg: TONE_COLORS.amber.bg,
    fg: TONE_COLORS.amber.fg,
    title: '提升竞争力',
    desc: '获奖经历是保研、考研复试、求职简历中的重要加分项',
  },
  {
    icon: Lightbulb,
    bg: TONE_COLORS.blue.bg,
    fg: TONE_COLORS.blue.fg,
    title: '锻炼综合能力',
    desc: '培养创新思维、团队协作、问题解决和项目管理能力',
  },
  {
    icon: Boxes,
    bg: TONE_COLORS.green.bg,
    fg: TONE_COLORS.green.fg,
    title: '拓展视野',
    desc: '接触前沿领域，与全国优秀学子交流，开阔学术视野',
  },
]
