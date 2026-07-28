<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store'
import { appLogout } from '@/api/auth'
import { MemberTypeLabel } from '@haifeng/shared'

const router = useRouter()
const userStore = useUserStore()
const showDropdown = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | null = null

const isLoggedIn = computed(() => userStore.isLoggedIn())
const userInfo = computed(() => userStore.userInfo)

const displayName = computed(() => {
  return userInfo.value?.username || userInfo.value?.phone || '用户'
})

const avatarInitial = computed(() => {
  return displayName.value.charAt(0).toUpperCase()
})

const hasAvatar = computed(() => !!userInfo.value?.avatar)

const memberTypeLabel = computed(() => {
  if (!userInfo.value?.memberType) return '普通用户'
  return MemberTypeLabel[userInfo.value.memberType] || '普通用户'
})

function goLogin() {
  router.push('/login')
}

function goProfile() {
  showDropdown.value = false
  router.push('/profile')
}

async function handleLogout() {
  showDropdown.value = false
  try {
    await appLogout()
  } catch {
    // ignore
  }
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}

function toggleDropdown() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  showDropdown.value = !showDropdown.value
}

function onWrapperEnter() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

function onWrapperLeave() {
  closeTimer = setTimeout(() => {
    showDropdown.value = false
  }, 150)
}

onBeforeUnmount(() => {
  if (closeTimer) clearTimeout(closeTimer)
})
</script>

<template>
  <!-- 未登录：显示登录按钮 -->
  <button
    v-if="!isLoggedIn"
    class="user-avatar-login-btn"
    @click="goLogin"
  >
    登录
  </button>

  <!-- 已登录：显示头像 + 下拉菜单 -->
  <div
    v-else
    class="user-avatar-wrapper"
    @mouseenter="onWrapperEnter"
    @mouseleave="onWrapperLeave"
  >
    <button class="user-avatar-trigger" @click="toggleDropdown">
      <div v-if="hasAvatar" class="user-avatar-img">
        <img :src="userInfo?.avatar || undefined" :alt="displayName" />
      </div>
      <div v-else class="user-avatar-initial">
        {{ avatarInitial }}
      </div>
      <span class="user-avatar-name">{{ displayName }}</span>
      <span class="user-avatar-member-tag">{{ memberTypeLabel }}</span>
      <svg class="user-avatar-arrow" :class="{ 'rotate-180': showDropdown }" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- 下拉菜单 -->
    <Transition name="dropdown">
      <div v-if="showDropdown" class="user-avatar-dropdown">
        <div class="dropdown-user-info">
          <div v-if="hasAvatar" class="dropdown-avatar">
            <img :src="userInfo?.avatar || undefined" :alt="displayName" />
          </div>
          <div v-else class="dropdown-avatar-initial">
            {{ avatarInitial }}
          </div>
          <div class="dropdown-user-detail">
            <div class="dropdown-name-row">
              <span class="dropdown-username">{{ displayName }}</span>
              <span class="dropdown-member-type">{{ memberTypeLabel }}</span>
            </div>
            <div v-if="userInfo?.phone" class="dropdown-phone">
              <svg class="dropdown-phone-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              {{ userInfo?.phone }}
            </div>
          </div>
        </div>
        <div class="dropdown-divider"></div>
        <button class="dropdown-item" @click="goProfile">
          <svg class="dropdown-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
          </svg>
          个人中心
        </button>
        <button class="dropdown-item dropdown-item-danger" @click="handleLogout">
          <svg class="dropdown-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
          </svg>
          退出登录
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 登录按钮 - 金色渐变 */
.user-avatar-login-btn {
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  padding: 0.625rem 1.5rem;
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(232, 114, 42, 0.25);
}

.user-avatar-login-btn:hover {
  background: linear-gradient(135deg, #e8722a, #d4661a);
  box-shadow: 0 6px 16px rgba(232, 114, 42, 0.35);
  transform: translateY(-1px);
}

/* 头像触发器 */
.user-avatar-wrapper {
  position: relative;
  padding-bottom: 8px;
}

.user-avatar-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.user-avatar-trigger:hover {
  background: rgba(245, 165, 74, 0.08);
}

/* 头像图片 */
.user-avatar-img {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #f5a54a;
  box-shadow: 0 0 0 2px rgba(245, 165, 74, 0.2);
}

.user-avatar-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 头像首字母 */
.user-avatar-initial {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid #f5a54a;
  box-shadow: 0 0 0 2px rgba(245, 165, 74, 0.2);
}

/* 用户名 */
.user-avatar-name {
  color: #1f2937;
  font-weight: 500;
  font-size: 0.9rem;
}

/* 会员类型标签 */
.user-avatar-member-tag {
  font-size: 0.7rem;
  padding: 0.05rem 0.4rem;
  background: #fff7ed;
  color: #e8722a;
  border-radius: 4px;
  font-weight: 500;
  vertical-align: baseline;
  white-space: nowrap;
  line-height: 1.4;
}

/* 箭头 */
.user-avatar-arrow {
  width: 1rem;
  height: 1rem;
  color: #f5a54a;
  transition: transform 0.2s ease;
}

/* 下拉菜单 */
.user-avatar-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 240px;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid rgba(245, 165, 74, 0.3);
  box-shadow: 0 4px 24px rgba(232, 114, 42, 0.15);
  padding: 0.5rem 0;
  z-index: 100;
  margin-top: 4px;
}

/* 下拉菜单 - 用户信息区 */
.dropdown-user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
}

.dropdown-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #f5a54a;
}

.dropdown-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dropdown-avatar-initial {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
}

.dropdown-user-detail {
  flex: 1;
  min-width: 0;
}

.dropdown-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.dropdown-username {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-member-type {
  font-size: 0.7rem;
  padding: 0.05rem 0.4rem;
  background: #fff7ed;
  color: #e8722a;
  border-radius: 4px;
  font-weight: 500;
  white-space: nowrap;
}

.dropdown-phone {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.125rem;
}

.dropdown-phone-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: #9ca3af;
}

/* 分割线 */
.dropdown-divider {
  height: 1px;
  background: rgba(245, 165, 74, 0.2);
  margin: 0.375rem 0;
}

/* 菜单项 */
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.9rem;
  color: #374151;
  transition: all 0.15s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(245, 165, 74, 0.08);
  color: #e8722a;
}

.dropdown-item-danger {
  color: #dc2626;
}

.dropdown-item-danger:hover {
  background: rgba(220, 38, 38, 0.08);
  color: #dc2626;
}

.dropdown-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
