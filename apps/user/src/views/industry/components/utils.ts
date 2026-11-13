/**
 * 行业列表页共享工具函数与配置。
 *
 * 约定（与 views/competition/components/utils.ts 保持一致）：
 * - 色值统一复用专业详情页 TONE_COLORS（只读复用，不修改被引用文件）。
 * - 字号全部取整 px，样式里不写分数 px / rem 字号。
 * - 图标统一 lucide-vue-next（AGENTS.md 第四节：严禁 Emoji 图标）。
 * - Hero 背景图复用 HERO_BG_URL（picture/university/列表背景.png）。
 */
import type { Component } from 'vue'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'
import {
  BadgeCheck,
  Banknote,
  Beef,
  Bike,
  Boxes,
  Briefcase,
  Building2,
  Car,
  Cpu,
  Droplet,
  Factory,
  Fish,
  Film,
  FlaskConical,
  Fuel,
  GraduationCap,
  Hammer,
  HardHat,
  HeartPulse,
  Home,
  Leaf,
  Mail,
  Microscope,
  Mountain,
  Newspaper,
  Package,
  Palette,
  PartyPopper,
  Pickaxe,
  Plane,
  Radio,
  Receipt,
  Recycle,
  Ship,
  Shirt,
  ShoppingCart,
  Sparkles,
  Sprout,
  Stethoscope,
  Target,
  Train,
  TreePine,
  Truck,
  Users,
  Utensils,
  Warehouse,
  Wheat,
  Wrench,
  Zap,
} from 'lucide-vue-next'
import { HERO_BG_URL, TONE_COLORS, type IconTone, type ToneColors } from '../../major/detail/components/utils'

export { HERO_BG_URL, TONE_COLORS }
export type { IconTone, ToneColors }

/* ============ 行业图标两级映射 ============ */

/**
 * ① 行业名称关键词 → lucide 图标（顺序即优先级，越靠前越优先命中）。
 *
 * 映射依据：后端 t_industry.icon_class 存的是 FontAwesome 类名，其中 27 条为专属语义图标
 * （fa-tractor / fa-cow / fa-fish / fa-train / fa-plane / fa-hospital / fa-graduation-cap /
 * fa-newspaper / fa-film / fa-palette / fa-futbol / fa-masks-theater / fa-people-group /
 * fa-tree / fa-seedling / fa-warehouse / fa-oil-well / fa-mountain / fa-cart-shopping /
 * fa-truck-ramp-box / fa-envelopes-bulk / fa-boxes-packing / fa-truck / fa-ship …），
 * 说明数据录入时就是「一行业一图标」的意图。此表按同一语义反推为 lucide 对应图标，
 * 并补全剩余细分行业。剩余 63 条 icon_class 为 fa-industry（无区分度），故不采用。
 */
const KEYWORD_ICONS: Array<[RegExp, Component]> = [
  // 农林牧渔
  [/畜牧|养殖|乳业/, Beef],
  [/渔业|水產|水产|捕捞/, Fish],
  [/林业|木材|竹藤|木制品/, TreePine],
  [/农林牧渔|辅助性活动/, Sprout],
  [/农副食品|食品制造|烟草|饮料|精制茶/, Utensils],
  [/农业|种植/, Wheat],
  // 采矿
  [/石油|天然气|管道运输/, Fuel],
  [/黑色金属矿|有色金属矿|非金属矿|金属矿采选/, Mountain],
  [/煤炭开采|开采专业|其他矿业|采矿业/, Pickaxe],
  // 制造业
  [/汽车制造/, Car],
  [/铁路、船舶、航空航天|运输设备制造/, Plane],
  [/计算机、通信|电子设备制造/, Cpu],
  [/电气机械|器材制造/, Zap],
  [/专用设备|通用设备|机械设备|金属制品|修理/, Hammer],
  [/仪器仪表/, Target],
  [/化学原料|化学制品|化学纤维/, FlaskConical],
  [/医药|生物制品/, Stethoscope],
  [/橡胶|塑料制品/, Boxes],
  [/石油、煤炭及其他燃料|冶炼|压延/, Factory],
  [/废弃资源综合利用|回收/, Recycle],
  [/其他制造业/, Factory],
  [/非金属矿物制品|建材/, Home],
  [/家具/, Home],
  [/纺织|服装|服饰|制鞋|皮革|毛皮|羽毛/, Shirt],
  [/文教、工美|工艺美术/, Palette],
  [/印刷|记录媒介/, Newspaper],
  [/造纸|纸制品/, Receipt],
  // 电力燃气水
  [/电力|热力|燃气|水的生产/, Zap],
  // 建筑
  [/房屋建筑|土木工程|建筑安装|装饰|装修/, HardHat],
  // 批零
  [/批发/, Truck],
  [/零售/, ShoppingCart],
  // 交通运输
  [/铁路运输/, Train],
  [/道路运输/, Truck],
  [/水上运输/, Ship],
  [/航空运输/, Plane],
  [/多式联运|运输代理/, Boxes],
  [/装卸搬运|仓储/, Warehouse],
  [/邮政业/, Mail],
  // 住宿餐饮
  [/住宿业|餐饮业/, Utensils],
  // 信息传输
  [/电信|广播电视|卫星传输/, Radio],
  [/互联网|软件和信息技术/, Cpu],
  // 金融
  [/货币金融|资本市场|保险|其他金融/, Banknote],
  // 房地产
  [/房地产业/, Building2],
  // 租赁商务
  [/租赁业/, Receipt],
  [/商务服务/, Briefcase],
  // 科研技术服务
  [/研究和试验发展|科学技术研究/, Microscope],
  [/科技推广|应用服务/, Zap],
  [/专业技术服务/, BadgeCheck],
  // 水利环境
  [/水利管理/, Droplet],
  [/生态保护|环境治理/, Leaf],
  [/公共设施管理/, Building2],
  [/土地管理/, Sprout],
  // 居民服务
  [/居民服务/, Users],
  [/机动车|电子产品|日用产品修理/, Wrench],
  [/其他服务业/, Users],
  // 教育
  [/教育/, GraduationCap],
  // 卫生
  [/卫生|医院|医疗/, HeartPulse],
  [/社会工作/, Users],
  // 文体娱乐
  [/新闻和出版/, Newspaper],
  [/广播、电视、电影|录音制作/, Film],
  [/文化艺术|艺术/, Palette],
  [/体育/, Bike],
  [/娱乐业|演出/, PartyPopper],
]

/**
 * ② 行业类别（category）兜底图标。
 * 后端 category 格式为「字母 + 中文名」，如「C 制造业」「J 金融业」，共 17 个门类。
 */
const CATEGORY_ICONS: Record<string, { icon: Component; tone: IconTone }> = {
  A: { icon: Sprout, tone: 'green' },
  B: { icon: Pickaxe, tone: 'slate' },
  C: { icon: Factory, tone: 'amber' },
  D: { icon: Zap, tone: 'amber' },
  E: { icon: HardHat, tone: 'slate' },
  F: { icon: ShoppingCart, tone: 'blue' },
  G: { icon: Truck, tone: 'blue' },
  H: { icon: Utensils, tone: 'amber' },
  I: { icon: Cpu, tone: 'blue' },
  J: { icon: Banknote, tone: 'green' },
  K: { icon: Building2, tone: 'slate' },
  L: { icon: Receipt, tone: 'slate' },
  M: { icon: Microscope, tone: 'green' },
  N: { icon: Leaf, tone: 'green' },
  O: { icon: Users, tone: 'blue' },
  P: { icon: GraduationCap, tone: 'amber' },
  Q: { icon: HeartPulse, tone: 'red' },
  R: { icon: Palette, tone: 'red' },
}

/** 最终兜底图标 */
const FALLBACK_ICON = Factory

export interface IndustryIconResult extends ToneColors {
  icon: Component
}

/**
 * 两级映射 + 兜底：
 * - 名称关键词命中 → 用命中图标，底座色取「类别色」
 * - 未命中 → 用类别兜底图标
 * - 类别也未知 → Factory + slate
 */
export function getIndustryIcon(
  industryName?: string | null,
  category?: string | null,
): IndustryIconResult {
  const cat = (category ?? '').trim()
  const catKey = cat.charAt(0).toUpperCase()
  const catStyle = CATEGORY_ICONS[catKey]
  const colors = TONE_COLORS[catStyle?.tone ?? 'slate']

  for (const [pattern, icon] of KEYWORD_ICONS) {
    if (pattern.test(industryName ?? '')) return { icon, ...colors }
  }
  return { icon: catStyle?.icon ?? FALLBACK_ICON, ...colors }
}

/** 类别字母（category 首字母），用于卡片角标 */
export function categoryCode(category?: string | null): string {
  return (category ?? '').trim().charAt(0).toUpperCase()
}

/** 类别中文名（去掉首字母前缀），用于卡片标签 */
export function categoryName(category?: string | null): string {
  return (category ?? '').trim().replace(/^[A-Z]\s*/, '')
}

/* ============ 热度榜（数值伪造，接口动态） ============ */

/**
 * 热门行业榜展示用热度值：按排名位置取固定值，**非真实统计**。
 * 榜单条目与顺序仍由接口动态返回（/industry/list 默认排序），此处只替换「数值」这一列。
 * 与竞赛页 HOT_INDEX_BY_RANK 同款做法。
 * TODO: 后端若提供真实热度榜接口，替换此常量
 */
export const HOT_INDEX_BY_RANK = [12860, 11640, 10480, 9370, 8450]

export function formatHotIndex(value?: number): string {
  return typeof value === 'number' ? value.toLocaleString('zh-CN') : ''
}

/* ============ 在线工具快捷入口 ============ */

export interface IndustryTool {
  key: string
  label: string
  icon: Component
  tone: IconTone
  to?: string
  action?: 'coming' | 'expert'
  soon?: boolean
}

/**
 * 行业列表页右侧「在线工具」入口。
 * - 岗位在线查询 → 即将上线
 * - 企业查询 → /enterprise（已有路由）
 * - 考公指南 → /civil-service（考公专栏，已有路由）
 * - AI智能规划 → 敬请期待
 * - 专家一对一指导 → 复用 useExpertContact.open()
 */
export const INDUSTRY_TOOLS: IndustryTool[] = [
  { key: 'position', label: '岗位在线查询', icon: Briefcase, tone: 'blue', action: 'coming', soon: true },
  { key: 'enterprise', label: '企业查询', icon: Building2, tone: 'green', to: '/enterprise' },
  { key: 'civil', label: '考公指南', icon: BadgeCheck, tone: 'amber', to: '/civil-service' },
  { key: 'ai', label: 'AI智能规划', icon: Sparkles, tone: 'amber', action: 'coming', soon: true },
  { key: 'expert', label: '专家一对一指导', icon: Users, tone: 'green', action: 'expert' },
]

/* ============ 分页与 URL 状态同步 ============ */

export const PAGE_SIZES = [12, 24, 36, 48, 60] as const
export const DEFAULT_PAGE_SIZE = 12

export interface UrlState {
  page: number
  size: number
  category: string
}

export const DEFAULT_URL_STATE: UrlState = {
  page: 1,
  size: DEFAULT_PAGE_SIZE,
  category: '',
}

function readString(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

/**
 * 从 route.query 反向恢复。
 * ⚠️ 后端 category 是「精准匹配」（eq），必须原样写回，不能只取首字母。
 */
export function parseUrlState(query: LocationQuery): UrlState {
  const page = Number(query.page)
  const size = Number(query.size)

  return {
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    size: (PAGE_SIZES as readonly number[]).includes(size) ? size : DEFAULT_PAGE_SIZE,
    category: readString(query.category, 50),
  }
}

/** 只写非默认值，保持 URL 干净；key 顺序固定，便于 stableQueryString 防循环 */
export function buildQuery(state: UrlState): LocationQueryRaw {
  const query: LocationQueryRaw = {}
  if (state.page > 1) query.page = String(state.page)
  if (state.size !== DEFAULT_PAGE_SIZE) query.size = String(state.size)
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

/** 卡片信息缺失时的占位文案 */
export const PLACEHOLDER_EMPTY = '数据整理中'

/** 投资热度进度条的最大刻度（DB 实测 investment_heat 取值 30~88） */
export const HEAT_MAX = 100

/** 年增长率展示：正负分别用丹霞红 / 翡翠绿 */
export function growthTone(rate?: number | null): { fg: string; bg: string; text: string } {
  const value = typeof rate === 'number' ? rate : 0
  const isUp = value >= 0
  return {
    fg: isUp ? '#E11D48' : '#059669',
    bg: isUp ? '#FFF1F2' : '#ECFDF5',
    text: `${isUp ? '↑' : '↓'} ${Math.abs(value)}%`,
  }
}
