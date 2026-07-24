export interface CompetitionMajorListVO {
  id: string
  competitionId: string
  majorId: string
  competitionName: string
  majorName: string
  createdAt: string
}

export interface CompetitionMajorQueryDTO {
  competitionId?: number
  majorId?: number
  competitionName?: string
  majorName?: string
  page: number
  size: number
}

export interface CompetitionMajorAddDTO {
  competitionName: string
  majorName: string
}
