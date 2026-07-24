import type { BasePageQuery } from '@haifeng/shared'

export interface ProvinceReformListVO {
  id: string
  province: string
  reformYear: number | null
  reformModel: string | null
}

export interface ProvinceReformDetailVO {
  id: string
  province: string
  reformYear: number | null
  reformModel: string | null
  createdAt: string
}

export interface ProvinceReformQueryDTO extends BasePageQuery {
}

export interface ProvinceReformAddDTO {
  province: string
  reformYear?: number | null
  reformModel?: string | null
}

export interface ProvinceReformUpdateDTO extends ProvinceReformAddDTO {
}
