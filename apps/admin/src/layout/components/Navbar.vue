<!-- apps/admin/src/layout/components/Navbar.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore, useUserStore } from '@/store'
import { ElMessageBox, ElMessage } from 'element-plus'
import { adminLogout } from '@/api/auth'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

// 切换侧边栏
function toggleSidebar() {
  appStore.toggleSidebar()
}

// 获取头像文字
const avatarText = computed(() => userStore.getAvatarText())

const hasAvatar = computed(() => !!userStore.profile?.avatar)
const displayName = computed(() => userStore.profile?.username || '加载中...')

// 进入个人中心
function goToProfile() {
  showDropdown.value = false
  router.push('/profile')
}

// 退出登录
async function handleLogout() {
  showDropdown.value = false
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await adminLogout()
    userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 取消退出
  }
}

// 自定义下拉菜单控制（仿 user 端）
const showDropdown = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | null = null

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
  showDropdown.value = true
}

function onWrapperLeave() {
  closeTimer = setTimeout(() => {
    showDropdown.value = false
  }, 150)
}

// 加载用户信息
onMounted(() => {
  if (!userStore.profile && userStore.isLoggedIn()) {
    userStore.fetchProfile()
  }
})
</script>

<template>
  <div class="flex w-full items-center justify-between">
    <!-- 左侧：折叠按钮 + 面包屑 -->
    <div class="flex items-center">
      <el-icon
        class="cursor-pointer text-xl text-gray-600 hover:text-gray-900"
        @click="toggleSidebar"
      >
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>

      <el-breadcrumb separator="/" class="ml-4">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ $route.meta.title }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧：用户信息下拉 -->
    <div
      class="user-avatar-wrapper"
      @mouseenter="onWrapperEnter"
      @mouseleave="onWrapperLeave"
    >
      <button class="user-avatar-trigger" @click="toggleDropdown">
        <div v-if="hasAvatar" class="user-avatar-img">
          <img :src="userStore.profile?.avatar ?? undefined" :alt="displayName" />
        </div>
        <div v-else class="user-avatar-initial">
          {{ avatarText }}
        </div>
        <div class="user-info">
          <div class="user-name">{{ displayName }}</div>
          <div class="user-role">{{ userStore.profile?.roleName || '-' }}</div>
        </div>
        <svg class="user-avatar-arrow" :class="{ 'rotate-180': showDropdown }" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- 下拉菜单 -->
      <Transition name="dropdown">
        <div v-if="showDropdown" class="user-avatar-dropdown">
          <div class="dropdown-user-info">
            <div v-if="hasAvatar" class="dropdown-avatar">
              <img :src="userStore.profile?.avatar ?? undefined" :alt="displayName" />
            </div>
            <div v-else class="dropdown-avatar-initial">
              {{ avatarText }}
            </div>
            <div class="dropdown-user-detail">
              <div class="dropdown-name-row">
                <span class="dropdown-username">{{ displayName }}</span>
                <span class="dropdown-role-tag">{{ userStore.profile?.roleName || '-' }}</span>
              </div>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" @click="goToProfile">
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
  </div>
</template>

<style scoped>
.user-avatar-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* 头像触发器 - 仿 user 端金色风格 */
.user-avatar-trigger {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.375rem 0.875rem;
  background: rgba(249, 115, 22, 0.04);
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-radius: 0.625rem;
  cursor: pointer;
  transition: all 0.25s ease;
}
.user-avatar-trigger:hover {
  background: rgba(249, 115, 22, 0.08);
  border-color: rgba(249, 115, 22, 0.3);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.08);
}

/* 头像 */
.user-avatar-img {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #F97316;
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15);
  flex-shrink: 0;
}
.user-avatar-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-initial {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9375rem;
  font-weight: 600;
  border: 2px solid #F97316;
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15);
  flex-shrink: 0;
}

/* 用户信息 */
.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}
.user-name {
  color: #1f2937;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.3;
}
.user-role {
  font-size: 0.7rem;
  color: #C2410C;
  background: rgba(249, 115, 22, 0.08);
  padding: 1px 8px;
  border-radius: 4px;
  margin-top: 2px;
  font-weight: 500;
  border: 1px solid rgba(249, 115, 22, 0.15);
}

/* 箭头 */
.user-avatar-arrow {
  width: 0.875rem;
  height: 0.875rem;
  color: #F97316;
  transition: transform 0.2s ease;
  flex-shrink: 0;
  margin-left: 0.125rem;
}
.user-avatar-arrow.rotate-180 {
  transform: rotate(180deg);
}

/* 下拉菜单 */
.user-avatar-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 240px;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid rgba(249, 115, 22, 0.3);
  box-shadow: 0 4px 24px rgba(249, 115, 22, 0.15);
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
  border: 2px solid #F97316;
  flex-shrink: 0;
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
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  flex-shrink: 0;
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
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-role-tag {
  font-size: 0.7rem;
  padding: 1px 8px;
  background: rgba(249, 115, 22, 0.08);
  color: #C2410C;
  border-radius: 4px;
  font-weight: 500;
  white-space: nowrap;
  border: 1px solid rgba(249, 115, 22, 0.15);
}

/* 分割线 */
.dropdown-divider {
  height: 1px;
  background: rgba(249, 115, 22, 0.15);
  margin: 0.375rem 0;
}

/* 菜单项 */
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  color: #374151;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(249, 115, 22, 0.08);
  color: #F97316;
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