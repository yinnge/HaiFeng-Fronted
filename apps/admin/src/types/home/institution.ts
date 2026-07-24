export interface InstitutionListVO {
  id: string
  name: string
  type: string
  phone: string | null
  address: string | null
  logo: string | null
  sortOrder: number
  status: number
}

export interface InstitutionDetailVO {
  id: string
  name: string
  type: string
  phone: string | null
  address: string | null
  description: string | null
  courses: string[] | null
  images: string[] | null
  logo: string | null
  sortOrder: number
  status: number
  createdAt: string
  updatedAt: string
}

export interface InstitutionQueryDTO {
  name?: string
  type?: string
  status?: number
  page: number
  size: number
}

export interface InstitutionAddDTO {
  name: string
  type: string
  phone?: string
  address?: string
  description?: string
  courses?: string[]
  images?: string[]
  logo?: string
  sortOrder?: number
}

export interface InstitutionUpdateDTO {
  name: string
  type: string
  phone?: string
  address?: string
  description?: string
  courses?: string[]
  images?: string[]
  logo?: string
  sortOrder?: number
}
