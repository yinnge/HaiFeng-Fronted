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

export interface PostgradUnivAddDTO {
  // 雪花 ID 超过 JS 安全整数，后端序列化为字符串，前端必须原样传字符串
  postgradMajorId: string
  universityId: string
  sortOrder?: number
}
