export interface AnnouncementListVO {
  id: string
  title: string
  tag: string | null
  status: number
  updatedAt: string
}

export interface AnnouncementDetailVO {
  id: string
  title: string
  content: string
  tag: string | null
  status: number
  createdAt: string
  updatedAt: string
}

export interface AnnouncementQueryDTO {
  title?: string
  status?: number
  page: number
  size: number
}

export interface AnnouncementAddDTO {
  title: string
  content: string
  tag?: string
}

export interface AnnouncementUpdateDTO {
  title: string
  content: string
  tag?: string
}

export interface StatusDTO {
  status: number
}
