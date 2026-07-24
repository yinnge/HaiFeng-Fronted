export interface PostgradUnivListVO {
  id: string
  universityName: string
  postgradMajorName: string
  sortOrder: number
  status: number
  createdAt: string
}

export interface PostgradUnivQueryDTO {
  universityName?: string
  postgradMajorName?: string
  page: number
  size: number
}
