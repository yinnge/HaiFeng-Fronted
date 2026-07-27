<!-- apps/admin/src/views/profile/components/AvatarCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useUserStore } from '@/store'
import { adminLogout } from '@/api/auth'
import type { ProfileVO } from '@/types/profile'

const props = defineProps<{
  profile: ProfileVO | null
}>()

const router = useRouter()
const userStore = useUserStore()

const avatarText = computed(() => {
  if (props.profile?.username) {
    return props.profile.username.charAt(0).toUpperCase()
  }
  return 'A'
})

async function handleLogout() {
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
</script>

<template>
  <div class="avatar-card">
    <!-- 背景装饰 -->
    <div class="card-bg-deco"></div>

    <!-- 头像区域 -->
    <div class="avatar-wrapper">
      <div class="avatar-ring">
        <img
          v-if="profile?.avatar"
          :src="profile.avatar"
          alt="头像"
          class="avatar-img"
        />
        <span v-else class="avatar-initial">{{ avatarText }}</span>
      </div>
    </div>

    <!-- 用户名 -->
    <div class="user-name">
      {{ profile?.username || '加载中...' }}
    </div>

    <!-- 角色徽章 -->
    <div class="role-badge">
      <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
      </svg>
      {{ profile?.roleName || '-' }}
    </div>

    <!-- TOTP 状态 -->
    <div class="status-divider"></div>
    <div class="totp-status">
      <span
        class="status-dot"
        :class="profile?.isTotpEnabled ? 'status-on' : 'status-off'"
      ></span>
      <span class="status-label">TOTP 双因素认证</span>
      <span class="status-text" :class="profile?.isTotpEnabled ? 'text-on' : 'text-off'">
        {{ profile?.isTotpEnabled ? '已开启' : '未开启' }}
      </span>
    </div>

    <!-- 退出登录按钮 -->
    <button class="logout-btn" @click="handleLogout">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd" />
      </svg>
      退出登录
    </button>
  </div>
</template>

<style scoped>
.avatar-card {
  width: 16rem;
  padding: 2rem 1.5rem 1.5rem;
  text-align: center;
  background: #fff;
  border-radius: 0.75rem;
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-top: 3px solid #F97316;
  border-bottom: 3px solid #FB923C;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}
.avatar-card:hover {
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
  transform: translateY(-1px);
}

.card-bg-deco {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 140px;
  height: 140px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.04));
  border-radius: 50%;
  pointer-events: none;
}

/* 头像 */
.avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}
.avatar-ring {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.15);
  position: relative;
  z-index: 1;
}
.avatar-img,
.avatar-initial {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid #fff;
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 1.75rem;
  font-weight: 700;
}

/* 用户名 */
.user-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

/* 角色徽章 */
.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 12px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C;
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 1.25rem;
}

/* TOTP 状态 */
.status-divider {
  height: 1px;
  background: #f3f4f6;
  margin: 0 0 1rem 0;
}
.totp-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-bottom: 1rem;
  font-size: 0.8125rem;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-dot.status-on {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
}
.status-dot.status-off {
  background: #9ca3af;
}
.status-label {
  color: #6b7280;
}
.status-text {
  font-weight: 600;
}
.text-on { color: #059669; }
.text-off { color: #9ca3af; }

/* 退出登录按钮 */
.logout-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 20px;
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}
.logout-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}
.logout-btn:active {
  transform: translateY(0);
}
</style>