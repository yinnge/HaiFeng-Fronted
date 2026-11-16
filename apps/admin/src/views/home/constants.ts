/**
 * 首页管理模块共用常量（规划师 / 培训机构）
 */

/** 服务对象：高考 / 考研（与后端 ServiceTargetEnum 一致，中文落库） */
export const SERVICE_TARGET_OPTIONS = [
  { value: '高考', label: '高考' },
  { value: '考研', label: '考研' },
] as const

/** 机构分类：4 个固定值（与后端 InstitutionCategoryEnum 一致，中文落库） */
export const INSTITUTION_CATEGORY_OPTIONS = [
  { value: '高中冲刺小班', label: '高中冲刺小班' },
  { value: '考公考编机构', label: '考公考编机构' },
  { value: '央国企培训', label: '央国企培训' },
  { value: '职业培训机构', label: '职业培训机构' },
] as const

/** 服务对象对应的语义色（用于标签药丸） */
export const SERVICE_TARGET_TONE: Record<string, string> = {
  高考: 'tone-green',
  考研: 'tone-indigo',
}

/** 机构分类对应的语义色（用于标签药丸） */
export const INSTITUTION_CATEGORY_TONE: Record<string, string> = {
  高中冲刺小班: 'tone-orange',
  考公考编机构: 'tone-green',
  央国企培训: 'tone-red',
  职业培训机构: 'tone-cyan',
}
