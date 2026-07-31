import type { Gender, Identity, Province } from '@haifeng/shared'

/**
 * 用户资料 VO
 */
export interface MemberProfileVO {
  email: string | null
  gender: Gender | null
  schoolName: string | null
  province: Province | null
  city: string | null
  major: string | null
  identity: Identity | null
  grade: string | null
  educationLevel: string | null
  favoriteCount: number
  canEditSchool: boolean
}

/**
 * 用户资料更新 DTO
 */
export interface MemberProfileUpdateDTO {
  email?: string
  gender?: string
  schoolName?: string
  province?: string
  city?: string
  major?: string
  identity?: string
  grade?: string
  educationLevel?: string
}
