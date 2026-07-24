import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'
import type { SystemSettingsVO, SystemSettingsUpdateDTO } from '@/types/system/settings'

const PREFIX = '/api/v1/admin/system/settings'

/** 获取系统设置 */
export const getSystemSettings = () => {
  return request.get<R<SystemSettingsVO>>(PREFIX)
}

/** 更新系统设置 */
export const updateSystemSettings = (data: SystemSettingsUpdateDTO) => {
  return request.put<R<void>>(PREFIX, data)
}

/** 获取所有启用的服务商列表 */
export const getEnabledProviders = () => {
  return request.get<R<string[]>>(`${PREFIX}/providers`)
}

/** 更新服务商和模型 */
export const updateProviderModel = (data: { providerName: string; modelName: string }) => {
  return request.put<R<void>>(`${PREFIX}/provider-model`, data)
}
