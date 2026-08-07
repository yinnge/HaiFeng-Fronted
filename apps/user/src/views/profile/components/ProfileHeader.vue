<!-- apps/user/src/views/profile/components/ProfileHeader.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { Edit } from '@element-plus/icons-vue'
import { MemberTypeLabel, MemberTypeTag } from '@haifeng/shared'
import type { MemberInfoVO } from '@/types/member/info'
import type { MemberProfileVO } from '@/types/member/profile'
import logoMain from '@/assets/images/logo-main.png'

const props = defineProps<{
  memberInfo: MemberInfoVO | null
  profile: MemberProfileVO | null
}>()

const emit = defineEmits<{
  (e: 'update-avatar'): void
  (e: 'open-upgrade'): void
}>()

const memberTypeLabel = computed(() => {
  if (!props.memberInfo) return ''
  return MemberTypeLabel[props.memberInfo.memberType] || '普通用户'
})

const memberTypeTagType = computed(() => {
  if (!props.memberInfo) return 'info'
  return MemberTypeTag[props.memberInfo.memberType] || 'info'
})

const expireAtFormatted = computed(() => {
  if (!props.memberInfo?.expireAt) return ''
  const date = new Date(props.memberInfo.expireAt)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
})

/** 是否有待恢复的会员（VIP活跃 + 有挂起的Pro） */
const hasPendingRestore = computed(() => {
  return props.memberInfo?.suspendedMemberType && props.memberInfo?.suspendedExpireAt
})

/** 待恢复的会员类型标签 */
const pendingRestoreLabel = computed(() => {
  if (!props.memberInfo?.suspendedMemberType) return ''
  const typeMap: Record<string, string> = { pro: '专业版', vip: 'VIP会员' }
  return typeMap[props.memberInfo.suspendedMemberType] || props.memberInfo.suspendedMemberType
})

/** 恢复日期：VIP到期日 +1天 */
const pendingRestoreDate = computed(() => {
  if (!props.memberInfo?.suspendedExpireAt) return ''
  const vipExpiry = new Date(props.memberInfo.suspendedExpireAt)
  // VIP到期日 +1天 = Pro恢复日期
  vipExpiry.setDate(vipExpiry.getDate() + 1)
  return `${vipExpiry.getFullYear()}-${String(vipExpiry.getMonth() + 1).padStart(2, '0')}-${String(vipExpiry.getDate()).padStart(2, '0')}`
})

function handleAvatarClick() {
  emit('update-avatar')
}
</script>

<template>
  <div class="profile-header-card">
    <!-- 左侧枫叶装饰（大，靠近用户名/手机号区域） -->
    <div class="maple-leaf-left">
      <img :src="logoMain" alt="" class="maple-leaf-img" />
    </div>

    <!-- 右侧枫叶装饰 -->
    <div class="maple-leaf-right">
      <img :src="logoMain" alt="" class="maple-leaf-img" />
    </div>

    <!-- 头像区域 -->
    <div class="avatar-wrapper" @click="handleAvatarClick">
      <div class="avatar-ring">
        <el-avatar
          :size="80"
          :src="memberInfo?.avatar || ''"
          class="avatar-img"
        >
          <span class="avatar-initial">{{ memberInfo?.username?.charAt(0) || '?' }}</span>
        </el-avatar>
      </div>
      <div class="avatar-edit-overlay">
        <el-icon class="text-white"><Edit /></el-icon>
      </div>
    </div>

    <!-- 用户信息 -->
    <div class="user-info">
      <div class="user-name-row">
        <span class="user-name">{{ memberInfo?.username || '用户' }}</span>
        <span class="member-tag">{{ memberTypeLabel }}</span>
      </div>
      <div class="user-phone">
        <svg class="phone-icon" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
        {{ memberInfo?.phone || '未绑定手机号' }}
      </div>
      <div v-if="expireAtFormatted" class="user-expire">
        <svg class="expire-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
        </svg>
        会员到期：{{ expireAtFormatted }}
      </div>
      <div v-if="hasPendingRestore" class="user-pending-restore">
        <span class="pending-label">待恢复{{ pendingRestoreLabel }}</span>
        <span class="pending-date">{{ pendingRestoreDate }} 恢复</span>
      </div>
    </div>

    <!-- 统计区域 -->
    <div class="stats-area">
      <div class="stat-item">
        <div class="stat-value">{{ profile?.favoriteCount || 0 }}</div>
        <div class="stat-label">我的收藏</div>
      </div>
      <button class="upgrade-btn" @click="emit('open-upgrade')">
        <svg class="upgrade-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        升级会员
      </button>
    </div>
  </div>
</template>

<style scoped>
.profile-header-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  /* 去掉黑边，只保留上下橙色边框点缀 */
  border-top: 3px solid #f5a54a;
  border-bottom: 3px solid #f5a54a;
  border-left: none;
  border-right: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

/* 橙色枫叶装饰 - 右侧（小logo，反转旋转） */
.maple-leaf-right {
  position: absolute;
  right: calc(8% + 20px);
  top: -45px;
  width: 160px;
  height: auto;
  opacity: 0.18;
  pointer-events: none;
  transform: rotate(180deg) rotate(-42deg);
}

/* 橙色枫叶装饰 - 左侧（大logo，简单旋转，往右移60px） */
.maple-leaf-left {
  position: absolute;
  left: calc(28% + 60px);
  top: -40px;
  width: 240px;
  height: auto;
  opacity: 0.15;
  pointer-events: none;
  transform: rotate(12deg);
}

.maple-leaf-img {
  width: 100%;
  height: auto;
}

@media (max-width: 640px) {
  .profile-header-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}

/* 头像 */
.avatar-wrapper {
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}

.avatar-ring {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  padding: 4px;
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  box-shadow: 0 0 0 4px rgba(245, 165, 74, 0.15);
}

.avatar-img {
  width: 100%;
  height: 100%;
  border: 3px solid white;
}

.avatar-initial {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  color: white;
  font-size: 1.75rem;
  font-weight: 700;
}

.avatar-edit-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.avatar-wrapper:hover .avatar-edit-overlay {
  opacity: 1;
}

/* 用户信息 */
.user-info {
  flex: 1;
  min-width: 0;
}

@media (max-width: 640px) {
  .user-info {
    width: 100%;
  }
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 640px) {
  .user-name-row {
    justify-content: center;
  }
}

.user-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.member-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  border-radius: 9999px;
}

.user-phone {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

@media (max-width: 640px) {
  .user-phone {
    justify-content: center;
  }
}

.phone-icon {
  width: 1rem;
  height: 1rem;
  color: #9ca3af;
}

.user-expire {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #9ca3af;
  font-size: 0.75rem;
}

@media (max-width: 640px) {
  .user-expire {
    justify-content: center;
  }
}

.expire-icon {
  width: 0.875rem;
  height: 0.875rem;
}

/* 待恢复会员 */
.user-pending-restore {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.375rem;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.08));
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-radius: 9999px;
}

.pending-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #ea580c;
}

.pending-date {
  font-size: 0.75rem;
  color: #9ca3af;
}

@media (max-width: 640px) {
  .user-pending-restore {
    justify-content: center;
  }
}

/* 统计区域 */
.stats-area {
  display: flex;
  gap: 2rem;
  padding-left: 2rem;
  border-left: 1px solid #f3f4f6;
}

@media (max-width: 640px) {
  .stats-area {
    padding-left: 0;
    padding-top: 1rem;
    border-left: none;
    border-top: 1px solid #f3f4f6;
    justify-content: center;
  }
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e8722a;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

/* 升级按钮 */
.upgrade-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  white-space: nowrap;
  align-self: center;
}

.upgrade-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.upgrade-btn:active {
  transform: translateY(0);
}

.upgrade-icon {
  width: 1rem;
  height: 1rem;
}
</style>
