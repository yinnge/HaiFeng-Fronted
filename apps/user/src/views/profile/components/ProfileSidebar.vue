<!-- apps/user/src/views/profile/components/ProfileSidebar.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { MemberTypeLabel, MemberType } from '@haifeng/shared'
import type { MemberInfoVO } from '@/types/member/info'
import type { MemberProfileVO } from '@/types/member/profile'

const props = defineProps<{
  memberInfo: MemberInfoVO | null
  profile: MemberProfileVO | null
}>()

const emit = defineEmits<{
  (e: 'view-commission'): void
}>()

const memberStatusLabel = computed(() => {
  if (!props.memberInfo) return '-'
  return MemberTypeLabel[props.memberInfo.memberType] || '普通用户'
})

const isVip = computed(() => props.memberInfo?.memberType === MemberType.VIP)

const commissionBalance = computed(() => props.memberInfo?.commissionBalance ?? 0)
const commissionTotalEarned = computed(() => props.memberInfo?.commissionTotalEarned ?? 0)

function formatMoney(val: number) {
  return val.toFixed(2)
}

async function handleCopyInviteCode() {
  const code = props.memberInfo?.inviteCode
  if (!code) return
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('邀请码已复制')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}
</script>

<template>
  <aside class="profile-sidebar">
    <!-- 状态概览 -->
    <div class="side-card">
      <div class="overview-grid">
        <div class="overview-tile tile-blue">
          <svg class="overview-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 8.2l4.1 2.8L12 4.5l4.9 6.5L21 8.2l-1.6 9.1a1.6 1.6 0 01-1.58 1.32H6.18a1.6 1.6 0 01-1.58-1.32L3 8.2zm3.2 3.1a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6zm11.6 0a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6z" />
          </svg>
          <div class="overview-label">会员状态</div>
          <span class="overview-pill" :class="isVip ? 'pill-blue' : 'pill-gray'">{{ memberStatusLabel }}</span>
        </div>
        <div class="overview-tile tile-green">
          <svg class="overview-icon" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M12 1.8l6.3 2.56c.55.22.9.75.9 1.35v5.32c0 4.01-2.64 7.68-6.74 8.68a1.18 1.18 0 01-.92 0C7.44 18.71 4.8 15.04 4.8 11.03V5.71c0-.6.35-1.13.9-1.35L12 1.8zm3.12 6.48a.9.9 0 00-1.44-1.08l-2.82 3.6-1.92-1.92a.9.9 0 10-1.27 1.27l2.62 2.62a.9.9 0 001.36-.1l3.47-4.39z" clip-rule="evenodd" />
          </svg>
          <div class="overview-label">账号状态</div>
          <span class="overview-pill pill-green">正常</span>
        </div>
        <div class="overview-tile tile-blue">
          <svg class="overview-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1.8l3.12 6.32 6.98 1.02-5.05 4.92 1.19 6.96L12 17.68l-6.24 3.34 1.19-6.96L1.9 9.14l6.98-1.02L12 1.8z" />
          </svg>
          <div class="overview-label">收藏院校</div>
          <div class="overview-num">
            {{ profile?.favoriteCount || 0 }}<span class="overview-unit">所</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 我的邀请 -->
    <div class="side-card invite-card">
      <div class="side-card-header">
        <svg class="side-card-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.4 2.6a1 1 0 00-1.32 1.2l2.13 6.74a1 1 0 00.72.68l6.53 1.55a.4.4 0 010 .78l-6.53 1.55a1 1 0 00-.72.68L2.08 22.5a1 1 0 001.32 1.2l18.2-8.34a1.3 1.3 0 000-2.36L3.4 2.6z" transform="scale(0.86) translate(2 -0.8)" />
        </svg>
        <div>
          <div class="side-card-title">我的邀请</div>
          <div class="side-card-desc">分享给好友，一起规划未来</div>
        </div>
      </div>
      <div class="invite-body">
        <div class="invite-label">邀请码</div>
        <div class="invite-row">
          <div class="invite-code">{{ memberInfo?.inviteCode || '-' }}</div>
          <button class="copy-btn" aria-label="复制邀请码" @click="handleCopyInviteCode">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3.5A1.5 1.5 0 018.5 2h7A1.5 1.5 0 0117 3.5v7a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 017 10.5v-7z" />
              <path d="M5 6a.75.75 0 01.75.75v8a.75.75 0 00.75.75h6.5a.75.75 0 010 1.5h-6.5A2.25 2.25 0 014 14.75v-8A.75.75 0 015 6z" opacity=".55" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 账户概览 -->
    <div class="side-card">
      <div class="side-card-header">
        <svg class="side-card-icon icon-amber" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 3h2.5v18H4a1.5 1.5 0 01-1.5-1.5v-15A1.5 1.5 0 014 3zm5 0h11a1.5 1.5 0 011.5 1.5v15a1.5 1.5 0 01-1.5 1.5H9V3zm2.5 5.25a.75.75 0 000 1.5h6a.75.75 0 000-1.5h-6zm0 3.5a.75.75 0 000 1.5h6a.75.75 0 000-1.5h-6zm0 3.5a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z" />
        </svg>
        <div class="side-card-title">账户概览</div>
        <button class="detail-link" @click="emit('view-commission')">
          查看详情
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      <div class="account-grid">
        <div class="account-tile tile-green">
          <svg class="account-tile-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 6.5A2.5 2.5 0 015.5 4h13A2.5 2.5 0 0121 6.5v11a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 17.5v-11zm2 0a.9.9 0 000 1.8h6.25a.9.9 0 000-1.8H5zm0 4a.9.9 0 000 1.8h3.5a.9.9 0 000-1.8H5zM16.75 12a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
          </svg>
          <div class="account-tile-label">可提现佣金</div>
          <div class="account-tile-value">¥{{ formatMoney(commissionBalance) }}</div>
          <div class="account-tile-note">可提现金额</div>
        </div>
        <div class="account-tile tile-amber">
          <svg class="account-tile-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3c-4.28 0-7.5 1.65-7.5 3.75v10.5C4.5 19.35 7.72 21 12 21s7.5-1.65 7.5-3.75V6.75C19.5 4.65 16.28 3 12 3zm0 2c3.87 0 5.5 1.4 5.5 1.75S15.87 8.5 12 8.5 6.5 7.1 6.5 6.75 8.13 5 12 5zM6.6 9.4c1.36.72 3.3 1.1 5.4 1.1s4.04-.38 5.4-1.1v2.35c0 .35-1.63 1.75-5.4 1.75s-5.4-1.4-5.4-1.75V9.4zm0 5c1.36.72 3.3 1.1 5.4 1.1s4.04-.38 5.4-1.1v2.35c0 .35-1.63 1.75-5.4 1.75s-5.4-1.4-5.4-1.75V14.4z" />
          </svg>
          <div class="account-tile-label">累计获得</div>
          <div class="account-tile-value">¥{{ formatMoney(commissionTotalEarned) }}</div>
          <div class="account-tile-note">累计收益金额</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

/* 三卡 flex:1 均分侧栏高度，与左栏卡片底部对齐 */
.side-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
  border-radius: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 20px -2px rgba(15, 23, 42, 0.04);
  padding: 1.5rem;
  transition: all 0.28s cubic-bezier(0.32, 0.72, 0, 1);
}

.side-card:hover {
  transform: translateY(-2px);
  border-color: rgba(249, 115, 22, 0.22);
  box-shadow:
    0 4px 12px rgba(15, 23, 42, 0.04),
    0 12px 28px -4px rgba(249, 115, 22, 0.08);
}

/* ===== 状态概览：浅色圆角小 tile（对照原型） ===== */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.625rem;
}

.overview-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  border-radius: 0.75rem;
  padding: 0.875rem 0.5rem;
}

.tile-blue {
  background: #eff6ff;
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.tile-green {
  background: #ecfdf5;
  border: 1px solid rgba(5, 150, 105, 0.1);
}

.overview-icon {
  width: 1.75rem;
  height: 1.75rem;
  color: #3b82f6;
}

.tile-green .overview-icon {
  color: #10b981;
}

.overview-label {
  font-size: 0.8125rem;
  color: #6b7280;
}

.overview-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  white-space: nowrap;
}

/* 会员状态：蓝色实心（对照原型 PRO 会员胶囊） */
.pill-blue {
  color: #ffffff;
  background: #3b82f6;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
}

.pill-gray {
  color: #6b7280;
  background: #f3f4f6;
}

/* 账号状态：白底绿字（浮于浅绿 tile 之上） */
.pill-green {
  color: #059669;
  background: rgba(255, 255, 255, 0.85);
}

.overview-num {
  font-size: 1.375rem;
  font-weight: 700;
  color: #3b82f6;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.overview-unit {
  font-size: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
  margin-left: 0.125rem;
}

/* ===== 卡片头 ===== */
.side-card-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 1.25rem;
}

.side-card-icon {
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  color: #3b82f6;
}

.icon-amber {
  color: #f97316;
}

.side-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.side-card-desc {
  font-size: 0.8125rem;
  color: #9ca3af;
  margin-top: 0.125rem;
}

/* ===== 我的邀请 ===== */
.invite-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.invite-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
}

.invite-row {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
}

.invite-code {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
  color: #374151;
  background: #f9fafb;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 0.625rem;
}

.copy-btn {
  flex-shrink: 0;
  width: 2.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 0.625rem;
  cursor: pointer;
  color: #3b82f6;
  background: #eff6ff;
  transition: all 0.2s ease;
}

.copy-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.copy-btn:hover {
  background: #dbeafe;
  color: #2563eb;
}

.copy-btn:active {
  transform: scale(0.96);
}

/* ===== 账户概览 ===== */
.detail-link {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
  transition: color 0.2s ease;
  padding: 0;
}

.detail-link:hover {
  color: #e8722a;
}

.detail-link svg {
  width: 0.875rem;
  height: 0.875rem;
}

.account-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.account-tile {
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3125rem;
}

.tile-green {
  background: #ecfdf5;
  border: 1px solid rgba(5, 150, 105, 0.12);
}

.tile-amber {
  background: #fff7ed;
  border: 1px solid rgba(249, 115, 22, 0.14);
}

.account-tile-icon {
  width: 1.5rem;
  height: 1.5rem;
  margin-bottom: 0.25rem;
  color: #059669;
}

.tile-amber .account-tile-icon {
  color: #f97316;
}

.account-tile-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
}

.tile-green .account-tile-value {
  color: #059669;
}

.tile-amber .account-tile-value {
  color: #e8722a;
}

.account-tile-value {
  font-size: 1.375rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.3;
}

.account-tile-note {
  font-size: 0.6875rem;
  color: #9ca3af;
}
</style>
