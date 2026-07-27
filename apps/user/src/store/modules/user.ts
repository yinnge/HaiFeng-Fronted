import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAccessToken, setTokens, clearTokens, type MemberType } from '@haifeng/shared'
import { getMemberInfo } from '@/api/member/info'

interface UserInfo {
  username: string
  phone?: string
  avatar?: string | null
  memberType: MemberType
  inviteCode?: string
  commissionBalance?: number
}

const USER_INFO_KEY = 'haifeng_user_info'

function loadUserInfo(): UserInfo | null {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveUserInfo(info: UserInfo | null) {
  if (info) {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
  } else {
    localStorage.removeItem(USER_INFO_KEY)
  }
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(getAccessToken())
  const userInfo = ref<UserInfo | null>(loadUserInfo())
  const redirectPath = ref<string | null>(null)

  function setToken(accessToken: string, refreshToken: string) {
    token.value = accessToken
    setTokens(accessToken, refreshToken)
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info
    saveUserInfo(info)
  }

  async function fetchUserInfo() {
    try {
      const res = await getMemberInfo()
      if (res.data.code === 200) {
        const data = res.data.data
        const info: UserInfo = {
          username: data.username,
          phone: data.phone,
          avatar: data.avatar,
          memberType: data.memberType,
          inviteCode: data.inviteCode,
          commissionBalance: data.commissionBalance,
        }
        setUserInfo(info)
        return info
      }
    } catch {
      // ignore
    }
    return null
  }

  function logout() {
    token.value = null
    userInfo.value = null
    clearTokens()
    saveUserInfo(null)
  }

  function isLoggedIn(): boolean {
    return !!token.value
  }

  function setRedirectPath(path: string | null) {
    redirectPath.value = path
  }

  function getRedirectPath(): string | null {
    const path = redirectPath.value
    redirectPath.value = null
    return path
  }

  return {
    token,
    userInfo,
    redirectPath,
    setToken,
    setUserInfo,
    fetchUserInfo,
    logout,
    isLoggedIn,
    setRedirectPath,
    getRedirectPath,
  }
})
