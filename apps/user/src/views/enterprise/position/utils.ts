/**
 * 企业岗位页共享工具函数与配置。
 *
 * 约定（与 views/enterprise/components/utils.ts 及竞赛/证书页保持一致）：
 * - 色值统一复用专业详情页已产出的 TONE_COLORS（只读复用，不修改被引用文件）。
 * - 字号全部取整 px，样式里不写分数 px / rem 字号。
 * - 图标统一 lucide-vue-next（AGENTS.md 第四节：严禁 Emoji 图标）。
 * - Hero 背景图复用 HERO_BG_URL（picture/university/列表背景.png），走 JS 内联 url() 注入，不进 CSS 产物。
 * - 类名前缀用 pos-（ep- 已被其它模块占用）。
 */
import {
  HERO_BG_URL,
  TONE_COLORS,
  type IconTone,
  type ToneColors,
} from '../../major/detail/components/utils'

export { HERO_BG_URL, TONE_COLORS }
export type { IconTone, ToneColors }

/* ============ 招聘类型 / 学历 / 工作经验（均为 DB 封闭取值集） ============ */

/**
 * 招聘类型：t_enterprise_position.recruitment_type 实测 3 个 DISTINCT 值
 * （校招 1612 / 社招 1115 / 实习 272），是封闭集合 → 可安全做值→色映射。
 */
const RECRUITMENT_TONES: Record<string, IconTone> = {
  校招: 'blue',
  社招: 'green',
  实习: 'amber',
}

/** 招聘类型标签：按值映射；未收录回退冷灰 slate */
export function recruitmentTag(recruitmentType?: string | null): ToneColors & { text: string } {
  const text = (recruitmentType ?? '').trim()
  if (!text) return { ...TONE_COLORS.slate, text: '' }
  return { ...TONE_COLORS[RECRUITMENT_TONES[text] ?? 'slate'], text }
}

/**
 * 学历要求：实测 3 个 DISTINCT 值（本科 2304 / 硕士 577 / 大专 118），封闭集合。
 */
const EDUCATION_TONES: Record<string, IconTone> = {
  本科: 'blue',
  硕士: 'green',
  大专: 'slate',
}

/** 学历标签：按值映射；未收录回退冷灰 slate */
export function educationTag(educationRequirement?: string | null): ToneColors & { text: string } {
  const text = (educationRequirement ?? '').trim()
  if (!text) return { ...TONE_COLORS.slate, text: '' }
  return { ...TONE_COLORS[EDUCATION_TONES[text] ?? 'slate'], text }
}

/**
 * 工作经验：实测 4 个 DISTINCT 值（应届毕业生 1612 / 3-5年 930 / 在校生 272 / 5年以上 185），
 * 封闭集合。学生向（应届/在校）用琥珀色，资深向用中性灰。
 */
const EXPERIENCE_TONES: Record<string, IconTone> = {
  应届毕业生: 'amber',
  在校生: 'amber',
  '3-5年': 'slate',
  '5年以上': 'slate',
}

/** 工作经验标签：按值映射；未收录回退冷灰 slate */
export function experienceTag(workExperience?: string | null): ToneColors & { text: string } {
  const text = (workExperience ?? '').trim()
  if (!text) return { ...TONE_COLORS.slate, text: '' }
  return { ...TONE_COLORS[EXPERIENCE_TONES[text] ?? 'slate'], text }
}

/* ============ 薪资 ============ */

/**
 * 薪资格式化：DB 存的是整数，单位为 K（实测 salary_min 2~23、salary_max 4~40，均非空）。
 * - 两端都有 → 「9–16k/月」
 * - 仅 min → 「9k 起/月」
 * - 仅 max → 「最高 16k/月」
 * - 两端都缺 → 交给调用方渲染占位
 */
export function formatSalaryRange(min?: number | null, max?: number | null): string {
  const hasMin = typeof min === 'number' && Number.isFinite(min)
  const hasMax = typeof max === 'number' && Number.isFinite(max)
  if (hasMin && hasMax) return `${min}–${max}k/月`
  if (hasMin) return `${min}k 起/月`
  if (hasMax) return `最高 ${max}k/月`
  return ''
}

/* ============ 岗位要求（编号多行文本） ============ */

/**
 * 岗位要求拆分：DB 里 position_requirement 是 93~140 字的**编号多行文本**
 * （形如 "1.硕士及以上学历…\n2.掌握有限元分析…\n3.具备试验方案设计…"）。
 * 按行拆成条目并剥掉行首序号，交由模板渲染成有序列表 —— 比当一整段文字可读得多。
 */
export function splitRequirements(raw?: string | null): string[] {
  const text = (raw ?? '').trim()
  if (!text) return []
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\d+[.、．)]\s*/, ''))
    .filter(Boolean)
}

/* ============ 岗位福利标签 ============ */

/**
 * 岗位标签（position_tags）：后端为 List<String>，DB 是 PG 数组
 * （形如 {五险一金,校招,科研津贴}），前端声明 string[] | null，类型一致可直接使用。
 * 缺失时返回空数组，模板用 v-if 判空。
 */
export function normalizeTags(tags?: string[] | null): string[] {
  if (!Array.isArray(tags)) return []
  return tags.filter((t): t is string => typeof t === 'string' && Boolean(t.trim()))
}

/* ============ 在线工具快捷入口（复用列表页配置） ============ */

/**
 * 岗位页右侧「在线工具」入口 —— **直接复用列表页 ENTERPRISE_TOOLS**（同一份配置，零重复）。
 * 工具栏组件本身也直接复用列表页的 EnterpriseToolsCard.vue，此处只做再导出供引用。
 */
export { ENTERPRISE_TOOLS } from '../components/utils'

/** 企业性质 / 类型标签：复用列表页的同一实现（性质=蓝、类型=灰） */
export { natureTag, typeTag } from '../components/utils'

/* ============ 占位文案 ============ */

/** 岗位要求缺失时的占位 */
export const PLACEHOLDER_REQUIREMENT = '岗位要求待补充'

/** 薪资缺失时的占位 */
export const PLACEHOLDER_SALARY = '薪资面议'

/** 企业无岗位时的空态文案 */
export const EMPTY_POSITIONS = '该企业暂未开放岗位'

/** 关联行业为空时的占位 */
export const EMPTY_INDUSTRIES = '暂未关联行业'

/** 行业模块的非 VIP 提示 */
export const VIP_INDUSTRY_TIP = '升级 VIP 会员可查看企业关联行业'
