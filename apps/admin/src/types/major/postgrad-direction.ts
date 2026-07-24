export interface MajorPostgradDirectionListVO {
  id: string
  majorName: string
  postgradMajorName: string
  createdAt: string
}

export interface MajorPostgradDirectionDetailVO {
  id: string
  majorId: string
  postgradMajorId: string
  majorName: string
  postgradMajorName: string
  sortOrder: number
  createdAt: string
}

export interface MajorPostgradDirectionQueryDTO {
  majorName?: string
  postgradMajorName?: string
  page: number
  size: number
}

export interface MajorPostgradDirectionAddDTO {
  majorId: string
  postgradMajorId: string
  sortOrder?: number
}

export interface MajorPostgradDirectionUpdateDTO {
  majorId?: number
  postgradMajorId?: number
  sortOrder?: number
}
