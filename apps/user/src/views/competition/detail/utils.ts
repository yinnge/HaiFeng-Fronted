/**
 * 竞赛详情页共享工具函数与配置。
 *
 * 约定：
 * - 色值复用专业详情页 TONE_COLORS（只读复用）；Hero 与列表页同款冷白蓝，
 *   暖橙仅保留给右栏报名参赛卡（2026-11-13 定案）。
 * - 字号全部取整 px，样式里不写分数 px / rem 字号。
 * - 图标统一 lucide-vue-next（AGENTS.md 第四节：严禁 Emoji 图标）。
 * - Hero 背景图复用 HERO_BG_URL（picture/university/列表背景.png，与列表页通用）。
 */
import type { Component } from 'vue'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import {
  Award,
  Briefcase,
  CircleHelp,
  ClipboardCheck,
  FileText,
  Flame,
  GraduationCap,
  ListChecks,
  Medal,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-vue-next'
import type { CompetitionBasicInfoItem } from '@/types/certificate'
import { HERO_BG_URL, TONE_COLORS, type IconTone } from '../../major/detail/components/utils'
import { levelTag } from '../components/utils'

export { HERO_BG_URL, TONE_COLORS }
export { levelTag }
export type { IconTone }

/* ============ Tab 定义（= 页面内 5 个锚点分区） ============ */

export type CompetitionTabKey = 'detail' | 'guide' | 'scoring' | 'awards' | 'faq'

export interface CompetitionTab {
  key: CompetitionTabKey
  label: string
  icon: Component
}

/**
 * 顶部 5 个 Tab 现在不再切换隐藏内容，而是 5 个「同页锚点」：
 * 全部内容一次渲染，点击 Tab 平滑滚动到对应分区（2026-11-13 定案）。
 * 后端 8 个详情字段的归位见下：
 * - 竞赛详情 detail   → basicInfo + background + purposes
 * - 参赛指南 guide    → competitionRules（processGuide 只放右栏，不占 Tab）
 * - 评审标准 scoring  → scoringCriteria
 * - 奖项设置 awards   → awards + awardsDisplay
 * - 常见问题 faq      → notices
 */
export const COMPETITION_TABS: CompetitionTab[] = [
  { key: 'detail', label: '竞赛详情', icon: FileText },
  { key: 'guide', label: '参赛指南', icon: ListChecks },
  { key: 'scoring', label: '评审标准', icon: ClipboardCheck },
  { key: 'awards', label: '奖项设置', icon: Trophy },
  { key: 'faq', label: '常见问题', icon: CircleHelp },
]

export const DEFAULT_TAB: CompetitionTabKey = 'detail'

/**
 * 分区 DOM id。5 个分区恒定存在（数据为空也渲染占位卡），
 * 保证任意 Tab 都能定位到元素，不会出现「点了没反应」的死锚点。
 */
export function sectionId(key: CompetitionTabKey): string {
  return `cd-section-${key}`
}

/* ============ 赛事流程（右栏时间轴） ============ */

export interface ProcessStep {
  /** 步骤序号（后端 processGuide 无数字字段，用数组下标 +1 兜底） */
  index: number
  title: string
  content: string
}

/**
 * processGuide 归一化为时间轴步骤。
 * 后端结构为 {title, content}（DB JSONB，V74 迁移后统一）。
 */
export function toProcessSteps(
  items: Array<{ title: string; content: string }> | null,
): ProcessStep[] {
  if (!Array.isArray(items)) return []
  return items
    .filter((it) => Boolean(it && (it.title || it.content)))
    .map((it, i) => ({
      index: i + 1,
      title: (it.title ?? '').trim(),
      content: (it.content ?? '').trim(),
    }))
}

/* ============ 获奖信息（右栏） ============ */

export interface AwardItem {
  title: string
  content: string
}

/** awardsDisplay 归一化；后端结构为 {title, content} */
export function toAwardItems(
  items: Array<{ title: string; content: string }> | null,
): AwardItem[] {
  if (!Array.isArray(items)) return []
  return items
    .filter((it) => Boolean(it && (it.title || it.content)))
    .map((it) => ({
      title: (it.title ?? '').trim(),
      content: (it.content ?? '').trim(),
    }))
}

/* ============ 基本信息 / 官方网站 URL ============ */

/** basicInfo 中「官方网站」项的 title（DB 实测：100/100 条竞赛均有此 title） */
const OFFICIAL_SITE_TITLE = '官方网站'

/**
 * 从 basicInfo 提取官方网址。
 * DB 实测 100 条竞赛中 98 条 content 为 https:// URL，2 条为非 URL 文本；
 * 非 URL 时返回 null，前端降级为不可点击的纯文本，绝不生成坏链接。
 */
export function extractOfficialSite(
  basicInfo: CompetitionBasicInfoItem[] | null,
): string | null {
  if (!Array.isArray(basicInfo)) return null
  const hit = basicInfo.find(
    (item) => (item?.title ?? '').trim() === OFFICIAL_SITE_TITLE,
  )
  const content = (hit?.content ?? '').trim()
  return /^https?:\/\/.+/i.test(content) ? content : null
}

/** basicInfo 展示项：去掉「官方网站」（它在右栏单独做成报名按钮） */
export function toBasicInfoItems(
  basicInfo: CompetitionBasicInfoItem[] | null,
): CompetitionBasicInfoItem[] {
  if (!Array.isArray(basicInfo)) return []
  return basicInfo
    .filter((item) => Boolean(item && item.title))
    .filter((item) => item.title.trim() !== OFFICIAL_SITE_TITLE)
    .map((item) => ({
      title: item.title.trim(),
      content: (item.content ?? '').trim(),
    }))
}

/** basicInfo 里「竞赛简介」的内容，用作 Hero 描述 */
export function extractSummary(
  basicInfo: CompetitionBasicInfoItem[] | null,
): string {
  if (!Array.isArray(basicInfo)) return ''
  const hit = basicInfo.find((item) => (item?.title ?? '').trim() === '竞赛简介')
  return (hit?.content ?? '').trim()
}

/* ============ 赛事目的（网格） ============ */

/** purposes 归一化：DB 实测每条竞赛 3~5 条短句 */
export function toPurposes(purposes: string[] | null): string[] {
  if (!Array.isArray(purposes)) return []
  return purposes.map((p) => (p ?? '').trim()).filter(Boolean)
}

/**
 * 赛事目的图标：按序号轮换，避免整排同图显得单调。
 * 语义上依次对应：热情激发 / 人才培养 / 成果转化 / 就业带动 / 战略服务。
 */
const PURPOSE_ICONS: Component[] = [Flame, GraduationCap, Sparkles, Briefcase, Target]

export function purposeIcon(index: number): Component {
  return PURPOSE_ICONS[index % PURPOSE_ICONS.length]
}

/* ============ 关联专业（右栏） ============ */

/**
 * 关联专业条目图标固定（不随打开场景变化）。
 * DB 实测 t_competition_major 当前 0 行；接口为 @RequireVip，游客/普通会员/Pro 均无数据。
 */
export const MAJOR_ITEM_ICON = GraduationCap

/** 关联专业的语义标签色 */
export const MAJOR_ITEM_TONE: IconTone = 'blue'

/* ============ 获奖级别语义色 ============ */

/** 奖项级别 → 语义色（一等奖红 / 二等奖琥珀 / 三等奖蓝 / 其余中性） */
const AWARD_TONE_BY_KEYWORD: Array<[RegExp, IconTone]> = [
  [/特等奖|一等奖/, 'red'],
  [/二等奖/, 'amber'],
  [/三等奖/, 'blue'],
]

export function awardTone(title: string): IconTone {
  for (const [pattern, tone] of AWARD_TONE_BY_KEYWORD) {
    if (pattern.test(title)) return tone
  }
  return 'slate'
}

/** 奖项级别 → 图标（一等奖 Trophy / 二等奖 Medal / 三等奖 Award / 其余 Sparkles） */
export function awardIcon(title: string): Component {
  if (/特等奖|一等奖/.test(title)) return Trophy
  if (/二等奖/.test(title)) return Medal
  if (/三等奖/.test(title)) return Award
  return Sparkles
}

/* ============ 右栏在线工具 ============ */

/**
 * 复用列表页的在线工具配置（用户要求「跟 list 出现的一样」）。
 * 从列表页 utils 只读引入，避免两处维护两份。
 */
export { COMPETITION_TOOLS } from '../components/utils'
export type { CompetitionTool } from '../components/utils'

/* ============ URL 状态同步（Tab 锚点） ============ */

/** 从 route.query 解析 Tab；非法值回退默认 */
export function parseTab(query: LocationQuery): CompetitionTabKey {
  const raw = typeof query.tab === 'string' ? query.tab : ''
  const hit = COMPETITION_TABS.find((t) => t.key === raw)
  return hit ? hit.key : DEFAULT_TAB
}

/** 只在非默认 Tab 时写入，保持 URL 干净 */
export function buildTabQuery(tab: CompetitionTabKey): LocationQueryRaw {
  return tab === DEFAULT_TAB ? {} : { tab }
}

/* ============ 其它 ============ */

export const PLACEHOLDER_EMPTY = '内容整理中'

/** 赛事流程 / 获奖信息等数组的展示条数上限（右栏空间有限，多了撑爆版面） */
export const ASIDE_MAX_ITEMS = 6
