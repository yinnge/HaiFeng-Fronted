/**
 * 企业列表页共享工具函数与配置。
 *
 * 约定（与 views/competition/components/utils.ts、views/certificate/components/utils.ts 保持一致）：
 * - 色值统一复用专业详情页已产出的 TONE_COLORS（只读复用，不修改被引用文件）。
 * - 字号全部取整 px，样式里不写分数 px / rem 字号。
 * - 图标统一 lucide-vue-next（AGENTS.md 第四节：严禁 Emoji 图标）。
 * - Hero 背景图复用 HERO_BG_URL（picture/university/列表背景.png），走 JS 内联 url() 注入，不进 CSS 产物。
 */
import type { Component } from 'vue'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import {
  Banknote,
  BookOpen,
  Briefcase,
  Building2,
  Cog,
  Cpu,
  Factory,
  Film,
  FlaskConical,
  Globe,
  Handshake,
  Landmark,
  ListChecks,
  Microscope,
  Rocket,
  Scale,
  School,
  Ship,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  Users,
  UserRound,
  UtensilsCrossed,
  Wrench,
  Zap,
} from 'lucide-vue-next'
import {
  HERO_BG_URL,
  TONE_COLORS,
  type IconTone,
  type ToneColors,
} from '../../major/detail/components/utils'

export { HERO_BG_URL, TONE_COLORS }
export type { IconTone, ToneColors }

/* ============ 企业性质（DB CHECK 封闭集合） ============ */

/**
 * 企业性质：t_enterprise.enterprise_nature 有 DB CHECK 约束
 * （央企 / 国企 / 民企 / 外企 / 合资），取值封闭。
 * 前端此前硬编码的 ['央企','国企','民企','外企','合资'] 与 DB CHECK 完全一致，沿用即可。
 */
export const NATURE_OPTIONS = ['央企', '国企', '民企', '外企', '合资'] as const

/* ============ 企业图标两级映射 ============ */

/**
 * ① 企业名称关键词 → 图标（顺序即优先级，越靠前越优先命中）。
 * TODO: 待业务方给出「企业 ↔ 图标」正式映射表后，替换本表即可；
 *      组件层只调用 getEnterpriseIcon，不直接依赖具体条目。
 */
const KEYWORD_ICONS: Array<[RegExp, Component]> = [
  [/银行|保险|证券|信托|基金|金融/, Banknote],
  [/航天|航空|宇航|卫星|火箭|兵器|军工/, Rocket],
  [/船舶|航运|海运|造船|港口/, Ship],
  [/石化|石油|化工|材料|化学/, FlaskConical],
  [/钢铁|冶金|有色|矿业/, Wrench],
  [/电力|能源|燃气|核电|光伏/, Zap],
  [/医药|医疗|制药|生物|健康/, Microscope],
  [/汽车|机械|装备|制造|工业/, Cog],
  [/建筑|建设|工程|置业|地产/, Building2],
  [/物流|运输|货运|供应链|速递/, Truck],
  [/网络|信息|通信|软件|科技|电子|数据/, Cpu],
  [/贸易|进出口|外贸|商业|零售/, TrendingUp],
  [/传媒|文化|出版|影视|广告/, Film],
  [/食品|农业|种业|牧业|粮油/, UtensilsCrossed],
  [/法务|法律|咨询|律所/, Scale],
  [/教育|学校|学院|师范/, School],
]

/** ② 企业性质兜底图标 */
const NATURE_ICONS: Record<string, Component> = {
  央企: Landmark,
  国企: Building2,
  民企: Users,
  外企: Globe,
  合资: Handshake,
}

/** 最终兜底图标 */
const FALLBACK_ICON = Factory

export interface EnterpriseIconResult extends ToneColors {
  icon: Component
}

/**
 * 两级映射 + 兜底：
 * - 名称关键词命中 → 用命中图标（行业辨识度）
 * - 名称未命中 → 按企业性质兜底
 * - 性质也未知 → Factory
 *
 * 底座色统一取「晴空蓝」柔光底（TONE_COLORS.blue），与性质标签同色系 ——
 * 全站只让品牌橙承担主按钮与收藏星标，卡片主体保持冷白克制（AGENTS.md 第二节）。
 */
export function getEnterpriseIcon(
  enterpriseName?: string | null,
  enterpriseNature?: string | null,
): EnterpriseIconResult {
  const nature = (enterpriseNature ?? '').trim()

  for (const [pattern, icon] of KEYWORD_ICONS) {
    if (pattern.test(enterpriseName ?? '')) return { icon, ...TONE_COLORS.blue }
  }
  return { icon: NATURE_ICONS[nature] ?? FALLBACK_ICON, ...TONE_COLORS.blue }
}

/* ============ 标签配色 ============ */

/**
 * 企业性质标签：固定晴空蓝（权威国企系）。
 * 性质虽有 5 个封闭取值，但按 Q14 裁决统一用蓝色 —— 避免五种颜色把卡片切成碎片，
 * 也让品牌橙独占「主按钮 / 收藏星标 / hover 暖边」三个位置。
 */
export function natureTag(enterpriseNature?: string | null): ToneColors & { text: string } {
  const text = (enterpriseNature ?? '').trim()
  if (!text) return { ...TONE_COLORS.slate, text: '' }
  return { ...TONE_COLORS.blue, text }
}

/**
 * 企业类型标签：固定冷灰 slate（次要信息）。
 * enterprise_type 是无 CHECK 的自由 VARCHAR（实测 13 个 DISTINCT 值，如
 * 「上市公司（A股+港股）」「大型未上市民营企业」），取值不封闭，
 * 不做值→色映射，避免同语义多色造成认知负担。
 */
export function typeTag(enterpriseType?: string | null): ToneColors & { text: string } {
  const text = (enterpriseType ?? '').trim()
  if (!text) return { ...TONE_COLORS.slate, text: '' }
  return { ...TONE_COLORS.slate, text }
}

/* ============ 热门城市快照 ============ */

/**
 * 热门城市快捷筛选（数据快照，非实时统计）。
 * 来自 t_enterprise 实测：2373 条有效企业分布在 239 个城市，头部高度集中
 * （北京 294 / 上海 242 / 深圳 117 / 杭州 76 / 太原 66 / 广州 64 / 长沙 53 / 成都 50）。
 * 与其它页 HOT_INDEX_BY_RANK 同款做法：固定展示值，不做实时统计。
 * TODO: 后端提供城市维度统计接口后替换此常量
 */
export const HOT_CITIES: Array<{ name: string; count: number }> = [
  { name: '北京', count: 294 },
  { name: '上海', count: 242 },
  { name: '深圳', count: 117 },
  { name: '杭州', count: 76 },
  { name: '太原', count: 66 },
  { name: '广州', count: 64 },
  { name: '长沙', count: 53 },
  { name: '成都', count: 50 },
]

/* ============ 在线工具快捷入口 ============ */

export interface EnterpriseTool {
  key: string
  label: string
  icon: Component
  tone: IconTone
  to?: string
  action?: 'coming' | 'expert'
  soon?: boolean
}

/**
 * 企业列表页右侧「在线工具」入口。
 * - 行业查询 → /industry（已有路由，免登录），直接跳
 * - 岗位在线查询 / 考公指南 / AI智能规划 → 功能未上线，点击提示「敬请期待」
 * - 专家一对一指导 → 复用 useExpertContact.open()
 */
export const ENTERPRISE_TOOLS: EnterpriseTool[] = [
  { key: 'positions', label: '岗位在线查询', icon: Briefcase, tone: 'blue', action: 'coming', soon: true },
  { key: 'industry', label: '行业查询', icon: Factory, tone: 'green', to: '/industry' },
  { key: 'exam', label: '考公指南', icon: Scale, tone: 'amber', action: 'coming', soon: true },
  { key: 'ai', label: 'AI智能规划', icon: Sparkles, tone: 'amber', action: 'coming', soon: true },
  { key: 'expert', label: '专家一对一指导', icon: UserRound, tone: 'green', action: 'expert' },
]

/* ============ 分页与 URL 状态同步 ============ */

/** 后端 BasePageQueryDTO.size 约束 ∈ [10,100]；3 列布局默认 12（整齐 4 行） */
export const PAGE_SIZES = [12, 24, 36, 60, 100] as const
export const DEFAULT_PAGE_SIZE = 12

export interface UrlState {
  page: number
  size: number
  enterpriseName: string
  enterpriseNature: string
  enterpriseType: string
  cityName: string
}

export const DEFAULT_URL_STATE: UrlState = {
  page: 1,
  size: DEFAULT_PAGE_SIZE,
  enterpriseName: '',
  enterpriseNature: '',
  enterpriseType: '',
  cityName: '',
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
    enterpriseName: readString(query.enterpriseName, 100),
    enterpriseNature: readString(query.enterpriseNature, 20),
    enterpriseType: readString(query.enterpriseType, 20),
    cityName: readString(query.cityName, 20),
  }
}

/** 只写非默认值，保持 URL 干净；key 顺序固定，便于 stableQueryString 防循环 */
export function buildQuery(state: UrlState): LocationQueryRaw {
  const query: LocationQueryRaw = {}
  if (state.page > 1) query.page = String(state.page)
  if (state.size !== DEFAULT_PAGE_SIZE) query.size = String(state.size)
  if (state.enterpriseName) query.enterpriseName = state.enterpriseName
  if (state.enterpriseNature) query.enterpriseNature = state.enterpriseNature
  if (state.enterpriseType) query.enterpriseType = state.enterpriseType
  if (state.cityName) query.cityName = state.cityName
  return query
}

export function stableQueryString(query: LocationQueryRaw): string {
  return Object.keys(query)
    .sort()
    .map((key) => `${key}=${String(query[key] ?? '')}`)
    .join('&')
}

/* ============ 其它 ============ */

/** 主营业务缺失时的占位文案 */
export const PLACEHOLDER_BUSINESS = '主营业务信息整理中'

/** 主营业务：缺失时回落到占位文案 */
export function normalizeBusiness(value?: string | null): string {
  const text = (value ?? '').trim()
  return text || PLACEHOLDER_BUSINESS
}

/* ============ Hero 特性项 ============ */

/** Hero 底部 4 个不可点击的说明项：无背景、无描边、无 pointer、无 hover */
export const HERO_FEATURES: Array<{ icon: Component; label: string; tone: IconTone }> = [
  { icon: ListChecks, label: '真实企业库', tone: 'blue' },
  { icon: Factory, label: '分类筛选', tone: 'green' },
  { icon: Star, label: '收藏目标企业', tone: 'amber' },
  { icon: Briefcase, label: '岗位直达', tone: 'blue' },
]
