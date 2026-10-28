<!-- apps/user/src/views/profile/components/ProfileHeader.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { Edit } from '@element-plus/icons-vue'
import { MemberTypeLabel, MemberTypeTag } from '@haifeng/shared'
import type { MemberInfoVO } from '@/types/member/info'
import type { MemberProfileVO } from '@/types/member/profile'
import logoMain from '@/assets/images/logo-main.png'
import { useRechargeDialog } from '@/composables/useRechargeDialog'

const props = defineProps<{
  memberInfo: MemberInfoVO | null
  profile: MemberProfileVO | null
}>()

const emit = defineEmits<{
  (e: 'update-avatar'): void
}>()

const recharge = useRechargeDialog()

const memberTypeLabel = computed(() => {
  if (!props.memberInfo) return ''
  // 教师身份独立于 member_type，由管理员授予，优先展示
  if (props.memberInfo.teacher) return '教师'
  return MemberTypeLabel[props.memberInfo.memberType] || '普通用户'
})

const memberTypeTagType = computed(() => {
  if (!props.memberInfo) return 'info'
  if (props.memberInfo.teacher) return 'warning'
  return MemberTypeTag[props.memberInfo.memberType] || 'info'
})

const expireAtFormatted = computed(() => {
  if (!props.memberInfo?.expireAt) return ''
  const date = new Date(props.memberInfo.expireAt)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
})

function handleAvatarClick() {
  emit('update-avatar')
}
</script>

<template>
  <div class="profile-header-card">
    <!-- 枫叶装饰：左大右小，暖色低透明度 -->
    <div class="maple-leaf-left">
      <img :src="logoMain" alt="" class="maple-leaf-img" />
    </div>
    <div class="maple-leaf-right">
      <img :src="logoMain" alt="" class="maple-leaf-img" />
    </div>
    <!-- 顶部渐变光带 -->
    <div class="header-glow" />

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
        <span class="member-tag">
          <svg class="member-tag-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.05 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.363-1.118L2.075 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.05 2.927z" />
          </svg>
          {{ memberTypeLabel }}
        </span>
      </div>
      <div class="user-phone">
        <svg class="phone-icon" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
        {{ memberInfo?.phone || '未绑定手机号' }}
      </div>
      <div class="user-meta-row">
        <span v-if="memberTypeLabel !== '普通用户'" class="vip-pill">
          <svg class="vip-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
          </svg>
          {{ memberTypeLabel }}权益生效中
        </span>
        <span v-if="expireAtFormatted" class="user-expire">
          <svg class="expire-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
          </svg>
          到期时间：{{ expireAtFormatted }}
        </span>
      </div>
    </div>

    <!-- 统计 + 升级入口 -->
    <div class="stats-area">
      <div class="stat-item">
        <svg class="stat-icon" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.77l-5.2 2.75.99-5.8-4.21-4.1 5.82-.85L10 1.5z" />
        </svg>
        <div class="stat-value">{{ profile?.favoriteCount || 0 }}</div>
        <div class="stat-label">我的收藏</div>
      </div>
      <button class="upgrade-btn" @click="recharge.open()">
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
  padding: 1.75rem 2rem;
  border-radius: 1rem;
  border: 1px solid rgba(249, 115, 22, 0.14);
  background:
    radial-gradient(120% 180% at 88% 8%, rgba(255, 237, 213, 0.9) 0%, rgba(255, 237, 213, 0) 55%),
    linear-gradient(105deg, #fffdf9 0%, #fff7ed 42%, #ffedd5 100%);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 8px 28px -6px rgba(249, 115, 22, 0.12);
  position: relative;
  overflow: hidden;
}

/* 顶部品牌色光带（内部伪元素，不破坏圆角） */
.header-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #f97316, #fb923c 55%, rgba(251, 146, 60, 0));
  pointer-events: none;
}

/* 枫叶装饰 - 右侧（小，反转旋转） */
.maple-leaf-right {
  position: absolute;
  right: calc(8% + 20px);
  top: -45px;
  width: 160px;
  height: auto;
  opacity: 0.16;
  pointer-events: none;
  transform: rotate(180deg) rotate(-42deg);
}

/* 枫叶装饰 - 左侧（大，简单旋转） */
.maple-leaf-left {
  position: absolute;
  left: calc(28% + 60px);
  top: -40px;
  width: 240px;
  height: auto;
  opacity: 0.13;
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
    padding: 1.5rem 1.25rem;
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
  background: linear-gradient(135deg, #f97316, #fb923c);
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.14);
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
  background: linear-gradient(135deg, #f97316, #fb923c);
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
  background: rgba(15, 23, 42, 0.4);
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
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #1f2937;
}

.member-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1875rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #f97316, #fb923c);
  border-radius: 9999px;
}

.member-tag-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.user-phone {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.625rem;
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

/* 权益胶囊 + 到期时间 */
.user-meta-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (max-width: 640px) {
  .user-meta-row {
    justify-content: center;
  }
}

/* 权益生效：翡翠绿（正向/生效语义），与到期时间竖线分隔 */
.vip-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid rgba(5, 150, 105, 0.2);
  border-radius: 9999px;
}

.vip-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: #10b981;
}

.user-expire {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding-left: 0.75rem;
  border-left: 1px solid rgba(15, 23, 42, 0.12);
  color: #9ca3af;
  font-size: 0.75rem;
}

.expire-icon {
  width: 0.875rem;
  height: 0.875rem;
}

/* 统计区域 */
.stats-area {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-left: 2rem;
  border-left: 1px solid rgba(249, 115, 22, 0.12);
}

@media (max-width: 640px) {
  .stats-area {
    padding-left: 0;
    padding-top: 1rem;
    border-left: none;
    border-top: 1px solid rgba(249, 115, 22, 0.12);
    justify-content: center;
  }
}

.stat-item {
  text-align: center;
}

.stat-icon {
  width: 1rem;
  height: 1rem;
  color: #f59e0b;
  margin-bottom: 0.125rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
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
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.32, 0.72, 0, 1);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  white-space: nowrap;
  align-self: center;
  overflow: hidden;
}

/* 光泽扫过动效 */
.upgrade-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: -120%;
  width: 60%;
  height: 100%;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.45), transparent);
  transform: skewX(-20deg);
  transition: left 0.6s ease;
}

.upgrade-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.35);
}

.upgrade-btn:hover::after {
  left: 130%;
}

.upgrade-btn:active {
  transform: translateY(0) scale(0.98);
}

.upgrade-icon {
  width: 1rem;
  height: 1rem;
}
</style>
