/**
 * 专业详情页（User 端）共享工具函数与配置。
 *
 * 约定：
 * - 所有色值来自 DESIGN.md §2 / §6 设计令牌；橙色文字一律 #C2410C，品牌橙只给实心按钮与标题竖条。
 * - 字号全部取整 px，样式里不写分数 px / rem 字号。
 * - 统一占位：数值缺失「数据整理中」，文本缺失「内容整理中」，数组为空整块隐藏。
 */
import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Component, type Ref } from 'vue'
import {
  BookOpen,
  BookText,
  Boxes,
  BriefcaseBusiness,
  Cpu,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  Palette,
  PenLine,
  Scale,
  School,
  ScrollText,
  Shield,
  Sparkles,
  Sprout,
  Stethoscope,
  TrendingUp,
  UserRound,
} from 'lucide-vue-next'
import type { PostgradMajorDirectionBriefVO } from '@/types/postgrad-major'

/**
 * Hero 背景图：1696×1024，与 views/major/List.vue:23 同一素材，保证同模块视觉连贯。
 * 走 JS encodeURI 生成 url，避免中文路径写进 CSS 后被构建器改写。
 */
export const HERO_BG_URL = encodeURI(`${import.meta.env.BASE_URL}picture/university/列表背景.png`)

/* ============ 色彩语义 ============ */

export type IconTone = 'blue' | 'amber' | 'green' | 'red' | 'slate'

export interface ToneColors {
  fg: string
  bg: string
  ring: string
}

/** 四色活力光谱 + slate 中性；所有说明性标签共用 */
export const TONE_COLORS: Record<IconTone, ToneColors> = {
  blue: { fg: '#2563EB', bg: '#EFF6FF', ring: 'rgba(37,99,235,.18)' },
  amber: { fg: '#D97706', bg: '#FFFBEB', ring: 'rgba(245,158,11,.22)' },
  green: { fg: '#059669', bg: '#ECFDF5', ring: 'rgba(5,150,105,.18)' },
  red: { fg: '#E11D48', bg: '#FFF1F2', ring: 'rgba(225,29,72,.18)' },
  slate: { fg: '#475569', bg: '#F1F5F9', ring: 'rgba(15,23,42,.08)' },
}

/** 向日葵黄标签专用（文字用 #B45309，满足白底 AA） */
export const YELLOW_TAG: ToneColors = {
  fg: '#B45309',
  bg: '#FFFBEB',
  ring: 'rgba(245,158,11,.22)',
}

/* ============ 学科门类图标映射 ============ */

/**
 * 扩展点：本页先按「学科门类」粒度统一。
 * 后续要做「专业类」级别细分，可在此表旁新增 MAJOR_CATEGORY_ICONS（正则 → 图标），
 * 并在 getDisciplineIcon 之前优先命中；参考 views/major/List.vue:57-79 的 MAJOR_ICON_RULES 写法。
 */
const DISCIPLINE_ICONS: Record<string, [Component, IconTone]> = {
  工学: [Cpu, 'blue'],
  理学: [FlaskConical, 'blue'],
  管理学: [BriefcaseBusiness, 'amber'],
  经济学: [TrendingUp, 'amber'],
  法学: [Scale, 'blue'],
  医学: [Stethoscope, 'green'],
  农学: [Sprout, 'green'],
  教育学: [School, 'blue'],
  文学: [BookText, 'amber'],
  历史学: [ScrollText, 'amber'],
  哲学: [Lightbulb, 'blue'],
  艺术学: [Palette, 'red'],
  军事学: [Shield, 'slate'],
}

export interface DisciplineIconResult extends ToneColors {
  icon: Component
}

/** 按 parentCategory（学科门类）返回图标与柔光底座配色，带兜底 */
export function getDisciplineIcon(parentCategory?: string | null): DisciplineIconResult {
  const hit = DISCIPLINE_ICONS[(parentCategory ?? '').trim()]
  const [icon, tone] = hit ?? ([GraduationCap, 'blue'] as [Component, IconTone])
  return { icon, ...TONE_COLORS[tone] }
}

/* ============ 标签解析 ============ */

export type TagTone = 'red' | 'blue' | 'slate'

export interface ParsedTag extends ToneColors {
  text: string
  tone: TagTone
}

const RED_KEYWORDS = ['热门', '紧缺', '急招', '新增', 'NEW']
const BLUE_KEYWORDS = ['新工科', '新医科', '新文科', '新农科', '国家特色', '特设', '交叉']

/**
 * 「特设专业,管理」必须拆成两个标签：按中英文逗号/顿号/分号拆分，trim、去空、去重。
 * 配色：关键词优先，位置兜底（第 1 个红、第 2 个蓝、其余 slate）；最多 3 个。
 */
export function parseTags(raw?: string | null): ParsedTag[] {
  if (!raw || !raw.trim()) return []
  const parts = Array.from(
    new Set(raw.split(/[,，、;；]+/).map((s) => s.trim()).filter(Boolean)),
  ).slice(0, 3)

  return parts.map((text, index) => {
    let tone: TagTone
    if (RED_KEYWORDS.some((word) => text.toUpperCase().includes(word.toUpperCase()))) {
      tone = 'red'
    } else if (BLUE_KEYWORDS.some((word) => text.includes(word))) {
      tone = 'blue'
    } else {
      tone = index === 0 ? 'red' : index === 1 ? 'blue' : 'slate'
    }
    return { text, tone, ...TONE_COLORS[tone] }
  })
}

/* ============ 数值 / 文本占位 ============ */

export const PLACEHOLDER_NUMBER = '数据整理中'
export const PLACEHOLDER_TEXT = '内容整理中'
/** Hero 信息行与右栏基本信息用破折号，不用「内容整理中」 */
export const PLACEHOLDER_DASH = '—'

/** 数值缺失：null / undefined / 0 / 非有限数 */
export function isMissingNumber(value: unknown): boolean {
  return value == null || value === 0 || (typeof value === 'number' && !Number.isFinite(value))
}

export function isBlankText(value?: string | null): boolean {
  return !value || !value.trim()
}

/** ¥8,500 – 20,600；任一端为空或 0 时整项占位 */
export function formatSalaryRange(min?: number | null, max?: number | null): string | null {
  if (isMissingNumber(min) || isMissingNumber(max)) return null
  return `¥${(min as number).toLocaleString('zh-CN')} – ${(max as number).toLocaleString('zh-CN')}`
}

export function formatCourseCount(count?: number | null): string | null {
  return isMissingNumber(count) ? null : String(count)
}

/**
 * 毕业生规模：字符串形式。
 * - 纯数字 / 数字区间（可含「人」）：≥4 位数字串加千分位，单位「人」拆出用小字渲染。
 * - 其余非标准描述串（如「约 8000 人左右」「较大」）：原样展示，不补单位。
 * - '0' / '0人' 判空。
 */
export function formatGraduateScale(
  raw?: string | null,
): { text: string; unit: string } | null {
  if (isBlankText(raw)) return null
  const source = (raw as string).trim()
  if (/^0\s*人?$/.test(source)) return null

  const numericPattern = /^[\d\s,，\-~—至]+$/
  const body = source.replace(/人\s*$/, '').trim()
  if (numericPattern.test(body)) {
    const text = body.replace(/\d{4,}/g, (m) => Number(m).toLocaleString('zh-CN'))
    return { text, unit: '人' }
  }
  return { text: source, unit: '' }
}

/** 相关专业卡片就业率：专业库量纲是 0–100（不乘 100） */
export function formatRate(value?: number | null): string | null {
  if (value == null || !Number.isFinite(value)) return null
  return `${value.toFixed(1)}%`
}

/**
 * 男女比例：0 是合法值，仅 null/undefined 判空；只给一个值时用 100 - x 推导；
 * 两值之和 >100 时按比例归一，取整显示。
 */
export function normalizeGenderRatio(
  male?: number | null,
  female?: number | null,
): { male: number; female: number } | null {
  const hasMale = male != null && Number.isFinite(male)
  const hasFemale = female != null && Number.isFinite(female)
  if (!hasMale && !hasFemale) return null

  let m = hasMale ? Math.max(0, male as number) : 100 - Math.max(0, female as number)
  let f = hasFemale ? Math.max(0, female as number) : 100 - Math.max(0, male as number)
  m = Math.max(0, m)
  f = Math.max(0, f)

  const sum = m + f
  if (sum > 100) {
    m = (m / sum) * 100
    f = (f / sum) * 100
  }
  return { male: Math.round(m), female: Math.round(f) }
}

/* ============ 考研方向分组与截断 ============ */

export interface DirectionGroup {
  category: string
  /** 该组真实总数，分组头始终显示它 */
  total: number
  /** 当前应渲染的条目（受「前 8 个」跨组累计限制） */
  visible: PostgradMajorDirectionBriefVO[]
}

/**
 * 按 category 分组（空归「其他」），跨分组累计只取前 limit 个。
 * 完全被截断的组不渲染（避免出现「组名 + 0 条」的空壳）。
 */
export function buildDirectionGroups(
  items: PostgradMajorDirectionBriefVO[],
  limit: number,
  expanded: boolean,
): DirectionGroup[] {
  const map = new Map<string, PostgradMajorDirectionBriefVO[]>()
  for (const item of items) {
    const key = item.category?.trim() || '其他'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  }

  let rest = expanded ? Number.POSITIVE_INFINITY : limit
  return Array.from(map.entries())
    .map(([category, list]) => {
      const visible = rest > 0 ? list.slice(0, rest) : []
      if (rest !== Number.POSITIVE_INFINITY) rest = Math.max(0, rest - visible.length)
      return { category, total: list.length, visible }
    })
    .filter((group) => group.visible.length > 0)
}

/* ============ 折叠展开（共用组合式） ============ */

/**
 * line-clamp 真实溢出检测：只比较 scrollHeight / clientHeight，不用字数阈值。
 * ResizeObserver 覆盖窗口 resize 与容器宽度变化；source 变化时主动重测；展开态跳过测量但保留「收起」按钮。
 */
export function useClampExpand(elRef: Ref<HTMLElement | null>, source?: () => unknown) {
  const expanded = ref(false)
  const overflowing = ref(false)
  let observer: ResizeObserver | null = null

  function measure() {
    const el = elRef.value
    if (!el || expanded.value) return
    overflowing.value = el.scrollHeight > el.clientHeight + 1
  }

  function toggle() {
    expanded.value = !expanded.value
    if (!expanded.value) void nextTick(measure)
  }

  onMounted(() => {
    void nextTick(() => {
      measure()
      if (typeof ResizeObserver !== 'undefined' && elRef.value) {
        observer = new ResizeObserver(() => measure())
        observer.observe(elRef.value)
      }
    })
  })

  if (source) {
    watch(source, () => {
      expanded.value = false
      void nextTick(measure)
    })
  }

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
  })

  return { expanded, overflowing, toggle, measure }
}

/* ============ 规划工具快捷入口 ============ */

export interface PlanningTool {
  key: string
  label: string
  icon: Component
  tone: IconTone
  to?: string
  action?: 'coming' | 'expert'
  /** 无对应路由时挂蓝色「即将上线」小标签 */
  soon?: boolean
}

/**
 * TODO: 与 List.vue 抽取共享配置（建议 views/major/constants/planningTools.ts）。
 * 本次按 Q14 裁决「不改 List.vue 任何一行」，故复制一份：
 * - List.vue 是 7 项（含「考公考研」），文案为「高考填报志愿 / AI智能规划」；
 * - 详情页固定 6 项、名称见 DESIGN.md §3.11；
 * - List.vue 的 coming 项用 ElMessageBox.alert、专家项用 expertContact.open()；
 *   本页 coming 项统一 ElMessage.info('敬请期待', grouping:true)（§3.7 连点不刷屏），专家项沿用 expertContact.open()。
 */
export const PLANNING_TOOLS: PlanningTool[] = [
  { key: 'university', label: '院校库查询', icon: School, tone: 'blue', to: '/university' },
  { key: 'gaokao', label: '高考志愿填报', icon: PenLine, tone: 'green', to: '/gaokao' },
  { key: 'postgrad', label: '考研专业查询', icon: BookOpen, tone: 'amber', to: '/postgrad-major' },
  { key: 'employment', label: '就业服务', icon: Boxes, tone: 'red', action: 'coming', soon: true },
  { key: 'ai', label: 'AI专属就业规划', icon: Sparkles, tone: 'blue', action: 'coming', soon: true },
  { key: 'expert', label: '专家一对一指导', icon: UserRound, tone: 'green', action: 'expert' },
]
