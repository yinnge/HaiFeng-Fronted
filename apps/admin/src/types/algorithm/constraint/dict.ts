export interface ConstraintDictListVO {
  code: string
  name: string
  category: string
  severity: string
  checkField: string | null
  isActive: boolean
}

export interface ConstraintDictDetailVO {
  code: string
  name: string
  category: string
  description: string | null
  severity: string
  checkField: string | null
  checkOperator: string | null
  checkValue: string | null
  extraField: string | null
  extraOperator: string | null
  extraValue: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ConstraintDictAddDTO {
  code: string
  name: string
  category: string
  description?: string
  severity: string
  checkField?: string
  checkOperator?: string
  checkValue?: string
  extraField?: string
  extraOperator?: string
  extraValue?: string
  sortOrder?: number
  isActive: boolean
}

export interface ConstraintDictUpdateDTO {
  code: string
  name: string
  category: string
  description?: string
  severity: string
  checkField?: string
  checkOperator?: string
  checkValue?: string
  extraField?: string
  extraOperator?: string
  extraValue?: string
  sortOrder?: number
  isActive: boolean
}
