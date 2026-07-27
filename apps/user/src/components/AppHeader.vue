<script setup lang="ts">
import { useRouter } from 'vue-router'
import logoMain from '@/assets/images/logo-main.png'
import UserAvatar from './UserAvatar.vue'

interface Props {
  showBack?: boolean
  backTo?: string
  title?: string
  showNavLinks?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showBack: false,
  backTo: '/',
  title: '',
  showNavLinks: false,
})

const router = useRouter()

function goBack() {
  if (props.backTo === 'back') {
    router.back()
  } else {
    router.push(props.backTo)
  }
}
</script>

<template>
  <header class="app-header">
    <div class="app-header-inner">
      <!-- 左侧：Logo 或 返回按钮 -->
      <div class="app-header-left">
        <template v-if="showBack">
          <button class="back-btn" @click="goBack">
            <svg viewBox="0 0 20 20" fill="currentColor" class="back-icon">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            返回
          </button>
          <span v-if="title" class="page-title">{{ title }}</span>
        </template>
        <template v-else>
          <router-link to="/" class="logo-link">
            <img :src="logoMain" alt="海枫未来规划院" class="logo-img" />
            <span class="logo-text">海枫未来规划院</span>
          </router-link>
        </template>
      </div>

      <!-- 右侧：导航链接 + 用户头像 -->
      <div class="app-header-right">
        <template v-if="showNavLinks">
          <router-link to="/employment/jobs" class="nav-link">
            岗位搜索
          </router-link>
          <router-link to="/special" class="nav-link">
            特殊通道
          </router-link>
        </template>
        <UserAvatar />
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #f3f4f6;
}

.app-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1rem;
}

@media (min-width: 768px) {
  .app-header-inner {
    padding: 1rem 2rem;
  }
}

@media (min-width: 1280px) {
  .app-header-inner {
    padding: 1rem 3rem;
  }
}

.app-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  min-width: 0;
}

.logo-img {
  height: 2.5rem;
  width: 2.5rem;
  object-fit: contain;
  flex-shrink: 0;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  white-space: nowrap;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
  font-weight: 500;
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: #bf8a30;
}

.back-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.page-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.nav-link {
  color: #4b5563;
  font-weight: 500;
  transition: color 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}

.nav-link:hover {
  color: #bf8a30;
}
</style>
