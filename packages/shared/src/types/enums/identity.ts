/**
 * 身份枚举
 */
export enum Identity {
  HIGH_SCHOOL = '高中生',
  UNIVERSITY = '大学生',
  POSTGRADUATE = '研究生',
  OTHER = '其他',
}

export const IdentityLabel: Record<Identity, string> = {
  [Identity.HIGH_SCHOOL]: '高中生',
  [Identity.UNIVERSITY]: '大学生',
  [Identity.POSTGRADUATE]: '研究生',
  [Identity.OTHER]: '其他',
}

export const IdentityOptions = [
  { value: Identity.HIGH_SCHOOL, label: '高中生' },
  { value: Identity.UNIVERSITY, label: '大学生' },
  { value: Identity.POSTGRADUATE, label: '研究生' },
  { value: Identity.OTHER, label: '其他' },
]

/**
 * 判断身份是否允许编辑学校
 */
export function canEditSchoolByIdentity(identity: Identity | null): boolean {
  return identity === Identity.UNIVERSITY || identity === Identity.POSTGRADUATE
}
