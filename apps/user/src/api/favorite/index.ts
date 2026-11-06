import request from '@haifeng/shared/utils/request'
import type { R } from '@haifeng/shared'

/**
 * C 端会员收藏 API（对应后端 FavoriteController，全部需登录）。
 * 注意：shared request 使用 json-bigint（storeAsString）解析响应，
 * 后端 Long（雪花 ID）会以字符串形式返回，前端统一按 string 处理即可。
 */
const PREFIX = '/api/v1/app/favorite'

/** 收藏目标类型（对应后端 FavoriteTargetType 枚举） */
export type FavoriteTargetType =
  | 'university'
  | 'major'
  | 'city'
  | 'competition'
  | 'certificate'
  | 'enterprise'
  | 'industry'
  /** 专栏文件（t_file_info） */
  | 'file_info'

/** 收藏记录项（对应后端 FavoriteItemVO；id/targetId 为防精度的字符串） */
export interface FavoriteItem {
  id: string
  targetType: FavoriteTargetType
  targetId: string
  favoritedAt?: string
}

/** 收藏列表查询参数（page/size 受后端 BasePageQueryDTO 约束 ∈ [10,100]） */
export interface FavoriteQueryDTO {
  page: number
  size: number
  /** 不传查全部类型 */
  targetType?: FavoriteTargetType
}

/** 添加收藏（幂等） */
export const addFavorite = (targetType: FavoriteTargetType, targetId: string) =>
  request.post<R<void>>(PREFIX, { targetType, targetId })

/** 取消收藏（幂等，物理删除） */
export const removeFavorite = (targetType: FavoriteTargetType, targetId: string) =>
  request.delete<R<void>>(`${PREFIX}/${targetType}/${targetId}`)

/** 收藏列表（分页；targetType 不传则查全部类型） */
export const getFavoriteList = (params: FavoriteQueryDTO) =>
  request.get<R<{ records: FavoriteItem[]; total: number; size: number; current: number }>>(`${PREFIX}/list`, { params })

/**
 * 批量查询某类型下已收藏的目标ID（列表页星标回填）。
 * ⚠️ 后端单次最多 100 个 targetIds（FavoriteStatusQueryDTO @Size(max=100)），超出需前端分批。
 */
export const getFavoriteStatus = (targetType: FavoriteTargetType, targetIds: string[]) =>
  request.post<R<string[]>>(`${PREFIX}/status`, { targetType, targetIds })
