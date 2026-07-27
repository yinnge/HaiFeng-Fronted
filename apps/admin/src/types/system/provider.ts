export interface AiBalanceVO {
  providerName: string
  models: string[]
  isAvailable: boolean
  currency: string
  totalBalance: number | null
  grantedBalance: number | null
  toppedUpBalance: number | null
}

/** 模型服务商 VO（与后端 ModelProviderVO 对应，id 序列化为 string） */
export interface ModelProviderVO {
  id: string
  apiKeyMasked: string
  baseUrl: string
  modelName: string
  providerName: string
  type: string // 'ai' | 'message'
  description: string
  status: number // 0=禁用, 1=启用
  createdAt: string
  updatedAt: string
}

/** 查询参数 */
export interface ModelProviderQueryDTO {
  page: number
  size: number
  providerName?: string
  modelName?: string
  type?: string
  status?: number
}

/** 新增参数 */
export interface ModelProviderCreateDTO {
  apiKey: string
  baseUrl?: string
  modelName: string
  providerName: string
  type: string
  description?: string
  status?: number
}

/** 修改参数 */
export interface ModelProviderUpdateDTO {
  apiKey?: string
  baseUrl?: string
  modelName?: string
  providerName?: string
  type?: string
  description?: string
  status?: number
}

/** 状态变更参数 */
export interface ModelProviderStatusDTO {
  status: number
}

/** type 枚举 */
export const ProviderType = {
  AI: 'ai',
  MESSAGE: 'message',
} as const

/** type -> 中文标签 */
export const ProviderTypeLabel: Record<string, string> = {
  ai: 'AI模型',
  message: '短信',
}

/** type -> Element Plus Tag 颜色 */
export const ProviderTypeTag: Record<string, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
  ai: 'success',
  message: 'warning',
}
