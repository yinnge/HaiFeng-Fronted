export interface MajorConstraintListVO {
  id: string
  majorCode: string
  majorName: string
  constraintCode: string
  constraintName: string
}

export interface MajorConstraintDetailVO {
  id: string
  majorCode: string
  majorName: string
  constraintCode: string
  constraintName: string
  remark: string | null
  createdAt: string
}

export interface MajorConstraintQueryDTO {
  page: number
  size: number
  majorCode?: string
  majorName?: string
  constraintCode?: string
  constraintName?: string
}

export interface MajorConstraintAddDTO {
  majorName: string
  constraintName: string
  remark?: string
}
