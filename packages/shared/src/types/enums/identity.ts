/**
 * 身份枚举
 */
export enum Identity {
  HIGH_SCHOOL = '高中生',
  UNIVERSITY = '大学生',
  POSTGRADUATE = '研究生',
  DOCTOR = '博士',
  OTHER = '其他',
}

export const IdentityLabel: Record<Identity, string> = {
  [Identity.HIGH_SCHOOL]: '高中生',
  [Identity.UNIVERSITY]: '大学生',
  [Identity.POSTGRADUATE]: '研究生',
  [Identity.DOCTOR]: '博士',
  [Identity.OTHER]: '其他',
}

export const IdentityOptions = [
  { value: Identity.HIGH_SCHOOL, label: '高中生' },
  { value: Identity.UNIVERSITY, label: '大学生' },
  { value: Identity.POSTGRADUATE, label: '研究生' },
  { value: Identity.DOCTOR, label: '博士' },
  { value: Identity.OTHER, label: '其他' },
]

/**
 * 判断身份是否显示学校字段
 */
export function canEditSchoolByIdentity(identity: Identity | null): boolean {
  return identity === Identity.UNIVERSITY || identity === Identity.POSTGRADUATE || identity === Identity.DOCTOR || identity === Identity.OTHER
}

/**
 * 判断身份是否显示专业字段
 */
export function showMajorByIdentity(identity: Identity | null): boolean {
  return identity === Identity.UNIVERSITY || identity === Identity.POSTGRADUATE || identity === Identity.DOCTOR || identity === Identity.OTHER
}

/**
 * 判断身份是否显示学历层次字段
 */
export function showEducationLevelByIdentity(identity: Identity | null): boolean {
  return identity === Identity.UNIVERSITY || identity === Identity.POSTGRADUATE || identity === Identity.DOCTOR
}

/**
 * 判断身份是否显示年级字段（其他身份不显示）
 */
export function showGradeByIdentity(identity: Identity | null): boolean {
  return identity !== null && identity !== Identity.OTHER
}

/**
 * 判断年级是否为下拉选择（非自由输入）
 */
export function isGradeSelectByIdentity(identity: Identity | null): boolean {
  return identity !== null && identity !== Identity.OTHER
}

// ========== 年级选项 ==========

export type SelectOption = { value: string; label: string }

/** 高中生年级选项 */
export const HighSchoolGradeOptions: SelectOption[] = [
  { value: '高一', label: '高一' },
  { value: '高二', label: '高二' },
  { value: '高三', label: '高三' },
]

/** 大学生年级选项 */
export const UniversityGradeOptions: SelectOption[] = [
  { value: '大一', label: '大一' },
  { value: '大二', label: '大二' },
  { value: '大三', label: '大三' },
  { value: '大四', label: '大四' },
]

/** 研究生年级选项 */
export const PostgraduateGradeOptions: SelectOption[] = [
  { value: '研一', label: '研一' },
  { value: '研二', label: '研二' },
  { value: '研三', label: '研三' },
]

/** 博士年级选项 */
export const DoctorGradeOptions: SelectOption[] = [
  { value: '博一', label: '博一' },
  { value: '博二', label: '博二' },
  { value: '博三', label: '博三' },
  { value: '博四', label: '博四' },
]

/** 根据身份获取年级选项 */
export function getGradeOptionsByIdentity(identity: Identity | null): SelectOption[] {
  switch (identity) {
    case Identity.HIGH_SCHOOL:
      return HighSchoolGradeOptions
    case Identity.UNIVERSITY:
      return UniversityGradeOptions
    case Identity.POSTGRADUATE:
      return PostgraduateGradeOptions
    case Identity.DOCTOR:
      return DoctorGradeOptions
    default:
      return []
  }
}

// ========== 学历层次选项 ==========

/** 大学生学历层次选项 */
export const UniversityEducationLevelOptions: SelectOption[] = [
  { value: '本科', label: '本科' },
  { value: '专科', label: '专科' },
]

/** 研究生学历层次（固定值） */
export const POSTGRADUATE_EDUCATION_LEVEL = '硕士'

/** 博士学历层次（固定值） */
export const DOCTOR_EDUCATION_LEVEL = '博士'

/** 根据身份获取学历层次选项，null 表示固定值 */
export function getEducationLevelConfigByIdentity(identity: Identity | null): { options: SelectOption[]; fixed: string | null } {
  switch (identity) {
    case Identity.UNIVERSITY:
      return { options: UniversityEducationLevelOptions, fixed: null }
    case Identity.POSTGRADUATE:
      return { options: [], fixed: POSTGRADUATE_EDUCATION_LEVEL }
    case Identity.DOCTOR:
      return { options: [], fixed: DOCTOR_EDUCATION_LEVEL }
    default:
      return { options: [], fixed: null }
  }
}
