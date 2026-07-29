export interface SafetyLevelListVO {
  level: number
  code: string
  name: string
  nameShort: string
  minCoefficient: number
  maxCoefficient: number
  confidence: string | null
  isDeleted: boolean
}

export interface SafetyLevelDetailVO {
  level: number
  code: string
  name: string
  nameShort: string
  minCoefficient: number
  maxCoefficient: number
  color: string | null
  confidence: string | null
  confidenceReason: string | null
  description: string | null
}

export interface SafetyLevelAddDTO {
  level: number
  code: string
  name: string
  nameShort: string
  minCoefficient: number
  maxCoefficient: number
  color?: string
  confidence?: string
  confidenceReason?: string
  description?: string
}

export interface SafetyLevelUpdateDTO {
  level: number
  code: string
  name: string
  nameShort: string
  minCoefficient: number
  maxCoefficient: number
  color?: string
  confidence?: string
  confidenceReason?: string
  description?: string
}
