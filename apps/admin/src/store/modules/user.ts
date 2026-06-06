// apps/admin/src/store/modules/user.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAccessToken, setTokens, clearTokens } from '@haifeng/shared'
import { getProfile } from '@/api/profile'
import type { ProfileVO } from '@/types/profile'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(getAccessToken())
  const profile = ref<ProfileVO | null>(null)

  // 设置 Token
  function setToken(accessToken: string, refreshToken: string) {
    token.value = accessToken
    setTokens(accessToken, refreshToken)
  }

  // 获取个人信息
  async function fetchProfile() {
    try {
      const { data } = await getProfile()
      if (data.code === 200) {
        profile.value = data.data
      }
    } catch (error) {
      console.error('获取个人信息失败:', error)
    }
  }

  // 更新本地 profile 缓存
  function updateLocalProfile(updates: Partial<ProfileVO>) {
    if (profile.value) {
      profile.value = { ...profile.value, ...updates }
    }
  }

  // 登出
  function logout() {
    token.value = null
    profile.value = null
    clearTokens()
  }

  // 检查是否已登录
  function isLoggedIn(): boolean {
    return !!token.value
  }

  // 获取用户名首字 (用于默认头像)
  function getAvatarText(): string {
    if (profile.value?.username) {
      return profile.value.username.charAt(0).toUpperCase()
    }
    return 'A'
  }

  return {
    token,
    profile,
    setToken,
    fetchProfile,
    updateLocalProfile,
    logout,
    isLoggedIn,
    getAvatarText,
  }
})
