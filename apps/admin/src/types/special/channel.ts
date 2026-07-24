export interface ChannelListVO {
  id: string
  channelCode: string
  channelName: string
  displayType: string
  isActive: boolean
}

export interface ChannelDetailVO {
  id: string
  channelCode: string
  channelName: string
  subtitle: string | null
  parentCode: string | null
  filterLabel: string | null
  displayType: string
  content: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ChannelQueryDTO {
  page: number
  size: number
  displayType?: string
  channelName?: string
}

export interface ChannelAddDTO {
  channelCode: string
  channelName: string
  subtitle?: string
  parentCode?: string
  filterLabel?: string
  displayType: string
  content?: string
  sortOrder?: number
}

export interface ChannelUpdateDTO {
  channelCode: string
  channelName: string
  subtitle?: string
  parentCode?: string
  filterLabel?: string
  displayType: string
  content?: string
  sortOrder?: number
}
