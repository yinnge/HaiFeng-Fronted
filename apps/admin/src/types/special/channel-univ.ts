export interface ChannelUnivListVO {
  id: string
  channelName: string
  universityName: string
  year: number | null
  regionTag: string | null
  isActive: boolean
}

export interface ChannelUnivDetailVO {
  id: string
  channelCode: string
  channelName: string
  universityId: string
  universityName: string
  year: number | null
  regionTag: string | null
  signupStart: string | null
  signupEnd: string | null
  officialUrl: string | null
  brochureTitle: string | null
  brochureContent: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ChannelUnivQueryDTO {
  page: number
  size: number
  channelName?: string
  universityName?: string
  year?: number
}

export interface ChannelUnivAddDTO {
  channelCode: string
  channelName: string
  universityId: string
  universityName: string
  year: number
  regionTag?: string
  signupStart?: string
  signupEnd?: string
  officialUrl?: string
  brochureTitle?: string
  brochureContent?: string
  sortOrder?: number
}

export interface ChannelUnivUpdateDTO {
  channelCode: string
  channelName: string
  universityId: string
  universityName: string
  year: number
  regionTag?: string
  signupStart?: string
  signupEnd?: string
  officialUrl?: string
  brochureTitle?: string
  brochureContent?: string
  sortOrder?: number
}

export interface ChannelOptionVO {
  channelCode: string
  channelName: string
}
