<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store'
import {
  getRecentNotifications,
  getUnreadCount,
  markAllAsRead,
} from '@/api/notification'
import { NotificationTypeLabel } from '@haifeng/shared'
import type { NotificationListVO } from '@/types/notification'

const router = useRouter()
const userStore = useUserStore()
const showDropdown = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | null = null

const notifications = ref<NotificationListVO[]>([])
const unreadCount = ref(0)
const markAllLoading = ref(false)

const isLoggedIn = computed(() => userStore.isLoggedIn())
const hasUnread = computed(() => unreadCount.value > 0)

async function fetchUnreadCount() {
  if (!isLoggedIn.value) return
  try {
    const res = await getUnreadCount()
    if (res.data.code === 200) {
      unreadCount.value = res.data.data.unreadCount
    }
  } catch {
    // ignore
  }
}

async function fetchRecent() {
  if (!isLoggedIn.value) return
  try {
    const res = await getRecentNotifications()
    if (res.data.code === 200) {
      notifications.value = res.data.data
    }
  } catch {
    // ignore
  }
}

function toggleDropdown() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
  showDropdown.value = !showDropdown.value
  if (showDropdown.value) {
    fetchRecent()
  }
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
  }, 200)
}

async function handleMarkAllRead() {
  markAllLoading.value = true
  try {
    await markAllAsRead()
    unreadCount.value = 0
    notifications.value.forEach((n) => (n.isRead = true))
    ElMessage.success('已全部标记为已读')
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  } finally {
    markAllLoading.value = false
  }
}

function goNotificationList() {
  showDropdown.value = false
  router.push({ path: '/profile', query: { tab: 'notification' } })
}

function formatTime(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}天前`
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

onMounted(() => {
  fetchUnreadCount()
  window.addEventListener('notification-updated', fetchUnreadCount)
})

onBeforeUnmount(() => {
  if (closeTimer) clearTimeout(closeTimer)
  window.removeEventListener('notification-updated', fetchUnreadCount)
})

defineExpose({ fetchUnreadCount })
</script>

<template>
  <div
    v-if="isLoggedIn"
    class="notification-bell-wrapper"
    @mouseenter="onWrapperEnter"
    @mouseleave="onWrapperLeave"
  >
    <button class="notification-bell-btn" @click="toggleDropdown">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="bell-icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
      <span v-if="hasUnread" class="unread-badge">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <Transition name="dropdown">
      <div v-if="showDropdown" class="notification-dropdown">
        <div class="dropdown-header">
          <button class="view-all-link" @click="goNotificationList">
            查看全部消息
            <svg viewBox="0 0 20 20" fill="currentColor" class="arrow-icon">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          <button
            v-if="hasUnread"
            class="mark-all-btn"
            :disabled="markAllLoading"
            @click="handleMarkAllRead"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" class="check-icon">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            一键已读
          </button>
        </div>

        <div class="dropdown-divider"></div>

        <div v-if="notifications.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span>暂无消息</span>
        </div>

        <div v-else class="notification-list">
          <div
            v-for="item in notifications"
            :key="item.id"
            class="notification-item"
            :class="{ unread: !item.isRead }"
          >
            <div v-if="!item.isRead" class="unread-dot"></div>
            <div class="notification-content">
              <div class="notification-header">
                <span class="notification-title">{{ item.title }}</span>
                <span class="notification-time">{{ formatTime(item.createdAt) }}</span>
              </div>
              <p class="notification-desc">{{ item.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.notification-bell-wrapper {
  position: relative;
  padding-bottom: 8px;
}

.notification-bell-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.notification-bell-btn:hover {
  background: rgba(245, 165, 74, 0.08);
}

.bell-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}

.notification-bell-btn:hover .bell-icon {
  color: #e8722a;
}

.unread-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 1rem;
  height: 1rem;
  padding: 0 0.25rem;
  font-size: 0.625rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #ef4444, #f87171);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* Dropdown */
.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 360px;
  background: white;
  border-radius: 0.75rem;
  border: 1px solid rgba(245, 165, 74, 0.3);
  box-shadow: 0 4px 24px rgba(232, 114, 42, 0.15);
  z-index: 100;
  margin-top: 4px;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #e8722a;
  transition: all 0.2s ease;
  cursor: pointer;
}

.view-all-link:hover {
  color: #d4661a;
}

.view-all-link .arrow-icon {
  width: 0.875rem;
  height: 0.875rem;
  transition: transform 0.2s ease;
}

.view-all-link:hover .arrow-icon {
  transform: translateX(2px);
}

.mark-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #e8722a;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  background: #fff7ed;
  transition: all 0.2s ease;
  cursor: pointer;
}

.mark-all-btn:hover {
  background: #ffedd5;
}

.mark-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.check-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.dropdown-divider {
  height: 1px;
  background: rgba(245, 165, 74, 0.15);
}

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  color: #9ca3af;
  font-size: 0.875rem;
}

.empty-icon {
  width: 2rem;
  height: 2rem;
  color: #d1d5db;
}

/* Notification list */
.notification-list {
  max-height: 320px;
  overflow-y: auto;
}

.notification-list::-webkit-scrollbar {
  width: 4px;
}

.notification-list::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 2px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  transition: background 0.15s ease;
  cursor: default;
}

.notification-item:hover {
  background: rgba(245, 165, 74, 0.04);
}

.notification-item.unread {
  background: rgba(249, 115, 22, 0.03);
}

.unread-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  flex-shrink: 0;
  margin-top: 0.4rem;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.notification-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-time {
  font-size: 0.7rem;
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
}

.notification-desc {
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

/* Transition */
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
