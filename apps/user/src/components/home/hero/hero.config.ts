/**
 * Hero 区（首页首屏）集中配置 —— 所有文案、数字、颜色、坐标均来自本文件，模板不硬编码。
 * 专栏 key 使用矩阵卡片真实 id（同时是导航 config 的 id），保证与「全周期生涯规划导航」区块一致。
 */
import logoMain from '@/assets/images/logo-main.png'

/** 专栏 key（= 矩阵卡片 id = 导航 config id） */
export type ColumnKey =
  | 'middle'
  | 'high'
  | 'college'
  | 'postgrad'
  | 'phd'
  | 'gaokao'
  | 'cet'
  | 'kaoyan'
  | 'kaogong'
  | 'employment'

export type ModuleType = 'single' | 'multi'

export interface ModuleColor {
  /** 实心主色 */
  solid: string
  /** 柔光底 */
  bg: string
  /** 用于 box-shadow / 描边的 rgba 基底（不含透明度），格式 "r, g, b" */
  rgb: string
}

export interface HeroColumn {
  key: ColumnKey
  num: string
  title: string
  subtitle: string
  route: string
  /** 矩阵中已有图标（内联 SVG 字符串，stroke="currentColor"，可染成模块主色） */
  icon: string
}

export interface HeroModule {
  key: string
  name: string
  type: ModuleType
  color: ModuleColor
  /** lucide 图标组件名（在 HfHeroCompass 内映射为组件），不在此处引入 vue 组件 */
  iconName: string
  subtitle: string
  columns: ColumnKey[]
  /** 左上角徽标文案覆盖；不填时显示 columns.length（该模块包含的子专栏数量）。
      2026-11-10：用户要求「初高中」徽标由 2 改为 1（避免与考公就业同为 2），颜色不变。 */
  badge?: string
  /** 罗盘静态形态中心坐标（设计坐标系 560×440） */
  center: { x: number; y: number }
}

export interface HotSearchItem {
  tone: 'rose' | 'blue' | 'emerald'
  tag: string
  text: string
}

export interface HeroCta {
  label: string
  primary: boolean
  /** 'route' = router.push；'expert' = 打开专家咨询对话框 */
  kind: 'route' | 'expert'
  route?: string
}

/** 海枫 Logo（与导航栏同源） */
export const HERO_LOGO = logoMain

/* ============ 左栏文案（§6，全部配置化，模板不硬编码） ============ */
/** 蓝色小标签文案（前置 Sparkles） */
export const HERO_BADGE_TEXT = 'AI 驱动 · 全周期升学规划'
/** 主标题：前缀 + 橙色渐变强调词 */
export const HERO_TITLE = {
  prefix: '无论你在哪个阶段',
  highlight: '都有下一步的答案',
} as const
/** 副标题 */
export const HERO_SUBTITLE = '用数据，为每一步升学选择兜底'
/** 数据来源行（前置 ShieldCheck） */
export const HERO_DATA_SOURCE = '数据来源：教育考试院 · 阳光高考 · 高校研招网'
/** Hero 搜索框占位符 */
export const HERO_SEARCH_PLACEHOLDER = '搜索院校、专业等，如：山西大学 计算机'
/** 双 CTA（§6-7）。主按钮进「高考志愿填报」路由，次按钮复用「专家咨询预约」对话框 */
export const HERO_CTA: HeroCta[] = [
  { label: '开始志愿规划', primary: true, kind: 'route', route: '/gaokao' },
  { label: '预约 1 对 1 规划师', primary: false, kind: 'expert' },
]

/** 颜色令牌（与项目 DESIGN / AGENTS 一致） */
const COLOR = {
  blue: { solid: '#2563EB', bg: '#EFF6FF', rgb: '37, 99, 235' },
  orange: { solid: '#F97316', bg: '#FFF7ED', rgb: '249, 115, 22' },
  cyan: { solid: '#0891B2', bg: '#ECFEFF', rgb: '8, 145, 178' },
  emerald: { solid: '#059669', bg: '#ECFDF5', rgb: '5, 150, 105' },
  amber: { solid: '#D97706', bg: '#FFFBEB', rgb: '217, 119, 6' },
  rose: { solid: '#E11D48', bg: '#FFF1F2', rgb: '225, 29, 72' },
} as const

/** 热搜微标签配色 */
export const HOT_TAG_COLOR: Record<HotSearchItem['tone'], ModuleColor> = {
  rose: COLOR.rose,
  blue: COLOR.blue,
  emerald: COLOR.emerald,
}

/** 矩阵中已有的专栏图标（内联 SVG，与 PlanMatrix 保持一致） */
const ICON = {
  middle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/></svg>`,
  high: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V9l7-5 7 5v12"/><path d="M9 21v-6h6v6"/></svg>`,
  gaokao: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"/><path d="M18 14l.75 2.25L21 17l-2.25.75L18 20l-.75-2.25L15 17l2.25-.75L18 14z" opacity=".6"/></svg>`,
  college: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M6 18v-8M10 18v-8M14 18v-8M18 18v-8"/><path d="M12 3L3 8h18z"/></svg>`,
  cet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>`,
  kaoyan: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/></svg>`,
  kaogong: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 2h6v4H9z"/><path d="M9 14l2 2 4-4"/></svg>`,
  postgrad: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v6L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 9V3"/></svg>`,
  phd: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="M9 14l-2 8 5-3 5 3-2-8"/></svg>`,
  employment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
} as const

/** 10 个专栏注册表（序号 / 标题 / 副标题 / 路由 / 图标 与矩阵完全一致） */
export const HERO_COLUMNS: Record<ColumnKey, HeroColumn> = {
  middle: { key: 'middle', num: '01', title: '初中专栏', subtitle: '学业奠基与升学指导', route: '/middle', icon: ICON.middle },
  high: { key: 'high', num: '02', title: '高中专栏', subtitle: '科目选修与生涯规划', route: '/high', icon: ICON.high },
  college: { key: 'college', num: '03', title: '大学专栏', subtitle: '学分绩点与成长发展', route: '/college', icon: ICON.college },
  postgrad: { key: 'postgrad', num: '04', title: '研究生专栏', subtitle: '学术科研与文献开题', route: '/graduate', icon: ICON.postgrad },
  phd: { key: 'phd', num: '05', title: '博士专栏', subtitle: '申博流程与顶刊发表', route: '/postgraduate/phd', icon: ICON.phd },
  gaokao: { key: 'gaokao', num: '06', title: '高考志愿填报', subtitle: '院校位次与专业精选', route: '/gaokao', icon: ICON.gaokao },
  cet: { key: 'cet', num: '07', title: '英语专项练习', subtitle: '中考、高考、四六级、考研英语在线练习', route: '/english', icon: ICON.cet },
  kaoyan: { key: 'kaoyan', num: '08', title: '考研专栏', subtitle: '择校初试与复试规划', route: '/postgrad-exam', icon: ICON.kaoyan },
  kaogong: { key: 'kaogong', num: '09', title: '考公专栏', subtitle: '国考省考选岗精算', route: '/civil-service', icon: ICON.kaogong },
  employment: { key: 'employment', num: '10', title: '就业信息专栏', subtitle: '行业风向与名企直通', route: '/employment/civil', icon: ICON.employment },
}

/** 6 个罗盘模块（覆盖全部 10 个专栏：2+1+1+1+3+2=10） */
export const HERO_MODULES: HeroModule[] = [
  { key: 'junior-senior', name: '初高中', type: 'multi', color: COLOR.blue, iconName: 'School', subtitle: '初中 · 高中', columns: ['middle', 'high'], badge: '1', center: { x: 116, y: 138 } },
  { key: 'gaokao', name: '高考志愿', type: 'single', color: COLOR.orange, iconName: 'Target', subtitle: '院校位次与专业精选', columns: ['gaokao'], center: { x: 280, y: 55 } },
  { key: 'english', name: '英语专项', type: 'single', color: COLOR.cyan, iconName: 'Languages', subtitle: '四六级 · 考研英语', columns: ['cet'], center: { x: 116, y: 302 } },
  { key: 'university', name: '大学成长', type: 'single', color: COLOR.emerald, iconName: 'GraduationCap', subtitle: '学分绩点与成长发展', columns: ['college'], center: { x: 444, y: 138 } },
  { key: 'postgrad', name: '考研深造', type: 'multi', color: COLOR.amber, iconName: 'FlaskConical', subtitle: '考研 · 研究生 · 博士', columns: ['kaoyan', 'postgrad', 'phd'], center: { x: 444, y: 302 } },
  { key: 'civil-career', name: '考公就业', type: 'multi', color: COLOR.rose, iconName: 'Briefcase', subtitle: '考公 · 就业信息', columns: ['kaogong', 'employment'], center: { x: 280, y: 385 } },
]

/** 热搜微标签（§6.2） */
export const HERO_HOT_SEARCH: HotSearchItem[] = [
  { tone: 'rose', tag: '热门', text: '山西高考志愿' },
  { tone: 'blue', tag: '3+1+2', text: '选科指南' },
  { tone: 'emerald', tag: '报录精算', text: '考研报录比' },
]

/** 专栏 key → 生涯星图节点 id 映射（图谱与矩阵 id 体系不同，需此映射） */
export const COLUMN_TO_GRAPH_NODE: Record<ColumnKey, string> = {
  middle: 'junior',
  high: 'senior',
  gaokao: 'gaokao',
  college: 'college',
  cet: 'english',
  kaoyan: 'kaoyan',
  kaogong: 'kaogong',
  postgrad: 'grad',
  phd: 'phd',
  employment: 'career',
}

/** 罗盘设计坐标系尺寸 */
export const COMPASS_SIZE = { w: 560, h: 440 } as const
/** 罗盘中心（设计坐标系） */
export const COMPASS_CENTER = { x: 280, y: 220 } as const
/** 展开态：选中模块节点目标位置 */
export const COMPASS_EXPANDED_CENTER = { x: 280, y: 210 } as const
/** 展开态：2 个 / 3 个子节点的中心坐标 */
export const COMPASS_CHILD_POSITIONS = {
  two: [
    { x: 118, y: 340 },
    { x: 442, y: 340 },
  ],
  three: [
    { x: 280, y: 62 },
    { x: 118, y: 348 },
    { x: 442, y: 348 },
  ],
} as const
