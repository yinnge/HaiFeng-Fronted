/**
 * 性别枚举
 */
export enum Gender {
  MALE = '男',
  FEMALE = '女',
}

export const GenderLabel: Record<Gender, string> = {
  [Gender.MALE]: '男',
  [Gender.FEMALE]: '女',
}

export const GenderOptions = [
  { value: Gender.MALE, label: '男' },
  { value: Gender.FEMALE, label: '女' },
]
