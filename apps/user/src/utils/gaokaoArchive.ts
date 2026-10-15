// apps/user/src/utils/gaokaoArchive.ts
// 高考档案统一存取源：登录用户走服务端接口；游客走 localStorage（刷新不丢）。
// 游客登录后首次读取时，若服务端尚无档案而本地有游客档案，则静默迁移入库。
import { isLoggedIn } from '@haifeng/shared/utils/auth'
import {
  getArchive,
  saveArchive,
  type GaokaoArchiveForm,
  type GaokaoArchiveVO,
} from '@/api/gaokao'

const GUEST_ARCHIVE_KEY = 'haifeng:guest-gaokao-archive'

/** 读取游客档案（localStorage） */
export function loadGuestArchive(): GaokaoArchiveForm | null {
  try {
    const raw = localStorage.getItem(GUEST_ARCHIVE_KEY)
    return raw ? (JSON.parse(raw) as GaokaoArchiveForm) : null
  } catch {
    return null
  }
}

/** 写游客档案（localStorage，刷新页面不丢） */
export function saveGuestArchive(form: GaokaoArchiveForm): void {
  try {
    localStorage.setItem(GUEST_ARCHIVE_KEY, JSON.stringify(form))
  } catch {
    // 存储异常静默
  }
}

export function clearGuestArchive(): void {
  try {
    localStorage.removeItem(GUEST_ARCHIVE_KEY)
  } catch {
    // 忽略
  }
}

export interface ArchiveSource {
  /** 档案数据（登录=服务端档案；游客=本地档案，字段为 Form 子集） */
  archive: GaokaoArchiveVO | null
  /** 是否来自游客本地存储 */
  fromGuest: boolean
}

/**
 * 智能读取档案：
 * - 已登录：读服务端档案；若服务端没有而本地有游客档案 → 静默迁移入库（saveArchive）后返回服务端档案；
 *   迁移失败则降级使用游客档案（不打断流程）。
 * - 未登录：直接读游客档案（绝不调需登录接口，避免 401 干扰）。
 */
export async function loadArchiveSmart(): Promise<ArchiveSource> {
  if (isLoggedIn()) {
    try {
      const res = await getArchive()
      if (res.data.data) {
        // 服务端已有档案，游客残留清除
        clearGuestArchive()
        return { archive: res.data.data, fromGuest: false }
      }
    } catch {
      // 查询失败降级走游客档案
    }
    const guest = loadGuestArchive()
    if (guest) {
      // 登录后首次：游客档案静默入库
      try {
        await saveArchive(guest)
        const res2 = await getArchive()
        if (res2.data.data) {
          clearGuestArchive()
          return { archive: res2.data.data, fromGuest: false }
        }
      } catch {
        // 迁移失败降级
      }
      return { archive: guest as GaokaoArchiveVO, fromGuest: true }
    }
    return { archive: null, fromGuest: false }
  }
  return { archive: loadGuestArchive() as GaokaoArchiveVO | null, fromGuest: true }
}

/** 保存档案：登录 → 入库；游客 → localStorage */
export async function saveArchiveSmart(form: GaokaoArchiveForm): Promise<{ toServer: boolean }> {
  if (isLoggedIn()) {
    await saveArchive(form)
    clearGuestArchive()
    return { toServer: true }
  }
  saveGuestArchive(form)
  return { toServer: false }
}
