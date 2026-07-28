export interface CompetitionMajorListVO {
  id: string
  competitionId: string
  majorId: string
  competitionName: string
  majorName: string
  isDeleted: boolean
  createdAt: string
}

export interface CompetitionMajorQueryDTO {
  competitionId?: number
  majorId?: number
  competitionName?: string
  majorName?: string
  isDeleted?: boolean
  page: number
  size: number
}

export interface CompetitionMajorAddDTO {
  competitionName: string
  majorName: string
}
