/**
 * 考研专业列表页共享工具函数与配置。
 *
 * 只读复用专业详情页已产出的 HERO_BG_URL / TONE_COLORS（不修改被引用文件）。
 * 扩展点：本页的 14 门类映射是「考研专用」，后续若要与详情页统一，
 *         可在 views/major/constants/ 下抽公共门类表；本页不改动 getDisciplineIcon 的输出。
 */
import type { Component } from 'vue'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import {
  Activity,
  Atom,
  BookText,
  Brain,
  BrainCircuit,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CircuitBoard,
  Cpu,
  Dna,
  Dumbbell,
  FileClock,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  Landmark,
  Languages,
  Leaf,
  Lightbulb,
  Microscope,
  Newspaper,
  Palette,
  Pill,
  Scale,
  School,
  ScrollText,
  Settings,
  Shield,
  ShieldPlus,
  Shuffle,
  Sigma,
  Smile,
  Sparkles,
  Sprout,
  Stethoscope,
  TrendingUp,
  UserRound,
  Boxes,
} from 'lucide-vue-next'
import {
  HERO_BG_URL,
  TONE_COLORS,
  type IconTone,
  type ToneColors,
} from '../../detail/components/utils'

export { HERO_BG_URL, TONE_COLORS }

/* ============ 占位与枚举 ============ */

export const PLACEHOLDER_BRIEF = '简介整理中'
export const PLACEHOLDER_SUBJECTS = '考试科目整理中'

export const DEGREE_TABS = [
  { value: '', label: '全部专业' },
  { value: '学术学位', label: '学术型硕士' },
  { value: '专业学位', label: '专业型硕士' },
] as const

export const POPULARITY_OPTIONS = ['热门', '一般', '冷门'] as const
export const DIFFICULTY_OPTIONS = ['高', '中', '低'] as const
export const PAGE_SIZES = [10, 20, 30, 50, 100] as const
export const DEFAULT_PAGE_SIZE = 10

/** 说明性标签统一 6px 圆角，色值来自共享 TONE_COLORS */
export function degreeTag(degreeType?: string | null): ToneColors & { text: string } {
  if (degreeType === '学术学位') return { ...TONE_COLORS.blue, text: degreeType }
  if (degreeType === '专业学位') {
    return { fg: '#B45309', bg: '#FFFBEB', ring: 'rgba(245,158,11,.22)', text: degreeType }
  }
  return { ...TONE_COLORS.slate, text: degreeType || '' }
}

export interface DifficultyStyle {
  level: number
  color: string
  textColor: string
  label: string
}

/** 难度：三格等级条，与「热门」红标签在形态上区分 */
export function getDifficultyStyle(difficulty?: string | null): DifficultyStyle | null {
  if (difficulty === '高') return { level: 3, color: '#E11D48', textColor: '#E11D48', label: '高' }
  if (difficulty === '中') return { level: 2, color: '#D97706', textColor: '#B45309', label: '中' }
  if (difficulty === '低') return { level: 1, color: '#059669', textColor: '#059669', label: '低' }
  return null
}

export function normalizeSubjects(value?: string[] | null): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((s): s is string => typeof s === 'string' && Boolean(s.trim()))
}

export function formatHotIndex(value?: number): string {
  return typeof value === 'number' ? value.toLocaleString('zh-CN') : ''
}

/**
 * 展示用热度指数：按排名位置取固定值，非实时、非真实统计。
 * TODO: 后端提供真实热度字段后替换此常量
 */
export const HOT_INDEX_BY_RANK = [12568, 10342, 8761, 7230, 6542]

/* ============ 图标两级映射 ============ */

/** ① 专业名关键词（顺序即优先级；「中药/中医」必须排在泛化的「药」之前） */
const KEYWORD_ICONS: Array<[RegExp, Component]> = [
  [/临床|内科|外科/, Stethoscope],
  [/口腔/, Smile],
  [/公共卫生/, ShieldPlus],
  [/护理/, HeartPulse],
  [/中药/, Leaf],
  [/中医/, Activity],
  [/药/, Pill],
  [/医学技术|检验/, Microscope],
  [/法医|法学|法律/, Scale],
  [/计算机|软件|网络/, Cpu],
  [/人工智能/, BrainCircuit],
  [/电子|通信|信息/, CircuitBoard],
  [/机械/, Settings],
  [/土木|建筑/, Building2],
  [/化学|化工/, FlaskConical],
  [/物理/, Atom],
  [/数学|统计/, Sigma],
  [/生物/, Dna],
  [/金融/, Landmark],
  [/经济/, TrendingUp],
  [/会计|审计/, Calculator],
  [/管理|工商/, BriefcaseBusiness],
  [/教育/, School],
  [/心理/, Brain],
  [/外语|语言/, Languages],
  [/新闻|传播/, Newspaper],
  [/历史/, ScrollText],
  [/哲学/, Lightbulb],
  [/艺术|设计/, Palette],
  [/体育/, Dumbbell],
  [/农|林|园艺/, Sprout],
  [/军事/, Shield],
]

/** ② 学科门类兜底：研究生 14 个门类（含「交叉学科」） */
const CATEGORY_STYLES: Record<string, { icon: Component; tone: IconTone }> = {
  哲学: { icon: Lightbulb, tone: 'blue' },
  经济学: { icon: TrendingUp, tone: 'amber' },
  法学: { icon: Scale, tone: 'blue' },
  教育学: { icon: School, tone: 'green' },
  文学: { icon: BookText, tone: 'amber' },
  历史学: { icon: ScrollText, tone: 'amber' },
  理学: { icon: FlaskConical, tone: 'blue' },
  工学: { icon: Cpu, tone: 'blue' },
  农学: { icon: Sprout, tone: 'green' },
  医学: { icon: Stethoscope, tone: 'green' },
  军事学: { icon: Shield, tone: 'slate' },
  管理学: { icon: BriefcaseBusiness, tone: 'amber' },
  艺术学: { icon: Palette, tone: 'red' },
  交叉学科: { icon: Shuffle, tone: 'blue' },
}

export interface MajorIconResult extends ToneColors {
  icon: Component
}

/**
 * 两级映射 + 兜底。关键词命中时底座色取所属门类色（同门类色调一致），
 * 门类未知时用蓝；最终兜底 GraduationCap 蓝。
 */
export function getPostgradMajorIcon(
  majorName?: string | null,
  disciplineCategory?: string | null,
): MajorIconResult {
  const category = (disciplineCategory ?? '').trim()
  const categoryStyle = CATEGORY_STYLES[category]
  const colors = TONE_COLORS[categoryStyle?.tone ?? 'blue']

  for (const [pattern, icon] of KEYWORD_ICONS) {
    if (pattern.test(majorName ?? '')) return { icon, ...colors }
  }
  return { icon: categoryStyle?.icon ?? GraduationCap, ...colors }
}

/* ============ 规划工具快捷入口（本页配置） ============ */

export interface PostgradTool {
  key: string
  label: string
  icon: Component
  tone: IconTone
  to?: string
  action?: 'coming' | 'expert'
  soon?: boolean
}

/**
 * TODO: 与 List.vue / 专业详情页抽取共享配置（建议 views/major/constants/planningTools.ts）。
 * 按 Q6 裁决：本页自建配置，不改 List.vue 与专业详情页任何一行。
 * - 「考研真题」为本页新增项，无现成路由 → FileClock + 即将上线
 * - 「考公考研」在 List.vue 找得到（Briefcase + coming），故未使用 Landmark 兜底
 * - 图标底座色在蓝 / 绿 / 琥珀间分流，无紫色
 */
export const POSTGRAD_TOOLS: PostgradTool[] = [
  { key: 'university', label: '院校库查询', icon: School, tone: 'blue', to: '/university' },
  { key: 'papers', label: '考研真题', icon: FileClock, tone: 'amber', action: 'coming', soon: true },
  { key: 'exam', label: '考公考研', icon: Briefcase, tone: 'green', action: 'coming', soon: true },
  { key: 'employment', label: '就业服务', icon: Boxes, tone: 'blue', action: 'coming', soon: true },
  { key: 'ai', label: 'AI智能规划', icon: Sparkles, tone: 'amber', action: 'coming', soon: true },
  { key: 'expert', label: '专家一对一指导', icon: UserRound, tone: 'green', action: 'expert' },
]

/* ============ URL 状态同步 ============ */

export interface UrlState {
  page: number
  size: number
  name: string
  code: string
  degreeType: string
  disciplineCategory: string
  popularity: string
  difficulty: string
}

export const DEFAULT_URL_STATE: UrlState = {
  page: 1,
  size: DEFAULT_PAGE_SIZE,
  name: '',
  code: '',
  degreeType: '',
  disciplineCategory: '',
  popularity: '',
  difficulty: '',
}

function readString(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

/** 从 route.query 反向恢复，只接受合法枚举与合法分页值 */
export function parseUrlState(query: LocationQuery): UrlState {
  const page = Number(query.page)
  const size = Number(query.size)
  const degreeType = readString(query.degreeType, 20)
  const popularity = readString(query.popularity, 20)
  const difficulty = readString(query.difficulty, 20)

  return {
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    size: (PAGE_SIZES as readonly number[]).includes(size) ? size : DEFAULT_PAGE_SIZE,
    name: readString(query.name, 100),
    code: readString(query.code, 20),
    degreeType: DEGREE_TABS.some((t) => t.value === degreeType) ? degreeType : '',
    disciplineCategory: readString(query.disciplineCategory, 50),
    popularity: (POPULARITY_OPTIONS as readonly string[]).includes(popularity) ? popularity : '',
    difficulty: (DIFFICULTY_OPTIONS as readonly string[]).includes(difficulty) ? difficulty : '',
  }
}

/** 只写非默认值，保持 URL 干净；key 顺序固定，便于 stableStringify 防循环 */
export function buildQuery(state: UrlState): LocationQueryRaw {
  const query: LocationQueryRaw = {}
  if (state.page > 1) query.page = String(state.page)
  if (state.size !== DEFAULT_PAGE_SIZE) query.size = String(state.size)
  if (state.name) query.name = state.name
  if (state.code) query.code = state.code
  if (state.degreeType) query.degreeType = state.degreeType
  if (state.disciplineCategory) query.disciplineCategory = state.disciplineCategory
  if (state.popularity) query.popularity = state.popularity
  if (state.difficulty) query.difficulty = state.difficulty
  return query
}

export function stableQueryString(query: LocationQueryRaw): string {
  return Object.keys(query)
    .sort()
    .map((key) => `${key}=${String(query[key] ?? '')}`)
    .join('&')
}
