// 按应用命名空间隔离 token，避免 admin/user 同源部署时共用 localStorage key 互相覆盖。
// 同源下两者会读写同一个 haifeng_access_token，导致一端拿到另一端的 token：
//   - user 端误用 admin token → getCurrentMemberId() 因 isMember()=false 返回 null → 报「用户不存在」
//   - admin 端误用 member token → checkAdminModule 判 !isAdmin() → 403 无权限
//   - 通知列表按错误的 userId 查询 → 为空，重登后恢复
// 用各端自己的 BASE_URL 派生命名空间：admin('/admin/')→haifeng_admin_access_token，user('/')→haifeng_access_token（保持兼容）。
const BASE = (import.meta as any).env?.BASE_URL || '/'
const APP_NS = BASE.replace(/[^a-zA-Z0-9]/g, '_') // '/admin/' -> '_admin_'，'/' -> '_'

const ACCESS_TOKEN_KEY = `haifeng${APP_NS}access_token`
const REFRESH_TOKEN_KEY = `haifeng${APP_NS}refresh_token`

/**
 * 获取 Access Token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/**
 * 获取 Refresh Token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * 存储 Token
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

/**
 * 清除 Token (登出时调用)
 */
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
  return !!getAccessToken()
}
