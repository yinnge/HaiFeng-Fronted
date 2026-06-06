import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAccessToken, setTokens, clearTokens, type MemberType } from '@haifeng/shared'

interface UserInfo {
  id: string
  nickname: string
  avatar?: string
  phone?: string
  memberType: MemberType
  memberExpireAt?: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(getAccessToken())
  const userInfo = ref<UserInfo | null>(null)
  const redirectPath = ref<string | null>(null)

  function setToken(accessToken: string, refreshToken: string) {
    token.value = accessToken
    setTokens(accessToken, refreshToken)
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info
  }

  function logout() {
    token.value = null
    userInfo.value = null
    clearTokens()
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
    logout,
    isLoggedIn,
    setRedirectPath,
    getRedirectPath,
  }
})
