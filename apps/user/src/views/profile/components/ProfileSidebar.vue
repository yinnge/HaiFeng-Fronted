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
        <div class="overview-item">
          <svg class="overview-icon icon-amber" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 5.5A1.5 1.5 0 014.5 4h11A1.5 1.5 0 0117 5.5v9a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 14.5v-9z" opacity=".12" />
            <path d="M10 6.2l1.45 2.94 3.25.47-2.35 2.29.55 3.23L10 13.59l-2.9 1.54.55-3.23-2.35-2.29 3.25-.47L10 6.2z" />
          </svg>
          <div class="overview-label">会员状态</div>
          <span class="overview-pill" :class="isVip ? 'pill-amber' : 'pill-gray'">{{ memberStatusLabel }}</span>
        </div>
        <div class="overview-item">
          <svg class="overview-icon icon-green" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 1l5.25 2.13c.46.19.75.63.75 1.12v4.44c0 3.34-2.2 6.4-5.62 7.23a.98.98 0 01-.76 0C6.2 15.09 4 12.03 4 8.69V4.25c0-.49.29-.93.75-1.12L10 1zm2.6 5.4a.75.75 0 00-1.2-.9L9.06 8.4l-.86-.86a.75.75 0 10-1.06 1.06l1.5 1.5a.75.75 0 001.13-.08l2.83-3.62z" clip-rule="evenodd" />
          </svg>
          <div class="overview-label">账号状态</div>
          <span class="overview-pill pill-green">正常</span>
        </div>
        <div class="overview-item">
          <svg class="overview-icon icon-blue" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.77l-5.2 2.75.99-5.8-4.21-4.1 5.82-.85L10 1.5z" />
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
        <svg class="side-card-icon icon-orange" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.514 5.275a.75.75 0 00.826.95 15.97 15.97 0 006.495-1.62c1.365-.644 2.6-1.522 3.65-2.578a.75.75 0 00.31-.515l.56-4.236a.75.75 0 011.174-.476l1.057.802c.295.224.72.08.816-.28.29-1.08.44-2.2.44-3.336 0-1.24-.185-2.436-.53-3.564a.75.75 0 00-.895-.51 15.973 15.973 0 00-6.462 1.61c-1.365.644-2.6 1.522-3.65 2.578a.75.75 0 01-.31.515l-4.235.56z" transform="rotate(45 10 10)" />
        </svg>
        <div>
          <div class="side-card-title">我的邀请</div>
          <div class="side-card-desc">分享给好友，一起规划未来</div>
        </div>
      </div>
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

    <!-- 账户概览 -->
    <div class="side-card">
      <div class="side-card-header">
        <svg class="side-card-icon icon-green" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a7.5 7.5 0 100 15 7.5 7.5 0 000-15zM8.798 7.45c.64-1.24 2.76-1.3 3.42-.06.2.38.65.53 1.02.33.38-.2.53-.65.33-1.02-.83-1.55-2.65-2.1-4.14-1.72A2.6 2.6 0 007.5 6.06c-.6.9-.5 2.1.32 2.87.44.41 1.04.65 1.63.79.53.12 1.02.2 1.38.34.36.14.5.28.55.38.06.12.08.35-.1.64-.4.66-1.5.75-2.19.02-.3-.32-.8-.33-1.12-.02-.32.3-.33.8-.02 1.12.6.63 1.4.94 2.17.98V14a.75.75 0 001.5 0v-.72c.5-.12 1.02-.4 1.36-.94.4-.65.45-1.44.07-2.12-.4-.72-1.13-1.03-1.9-1.24-.44-.12-.9-.2-1.3-.31-.4-.1-.72-.22-.9-.4-.2-.18-.23-.4-.14-.6l.29-.22z" />
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
          <div class="account-tile-label">可提现佣金</div>
          <div class="account-tile-value">¥{{ formatMoney(commissionBalance) }}</div>
          <div class="account-tile-note">可提现金额</div>
        </div>
        <div class="account-tile tile-amber">
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

/* ===== 状态概览 ===== */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.overview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
}

.overview-icon {
  width: 1.375rem;
  height: 1.375rem;
}

.icon-amber { color: #f59e0b; }
.icon-green { color: #10b981; }
.icon-blue { color: #3b82f6; }
.icon-orange { color: #f97316; }

.overview-label {
  font-size: 0.8125rem;
  color: #9ca3af;
}

.overview-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.1875rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  white-space: nowrap;
}

.pill-amber {
  color: #b45309;
  background: #fffbeb;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.pill-gray {
  color: #6b7280;
  background: #f3f4f6;
}

.pill-green {
  color: #059669;
  background: #ecfdf5;
}

.overview-num {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2563eb;
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
  width: 1.375rem;
  height: 1.375rem;
  flex-shrink: 0;
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
  color: #e8722a;
  background: #fff7ed;
  transition: all 0.2s ease;
}

.copy-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.copy-btn:hover {
  background: #ffedd5;
  color: #c2410c;
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
  font-size: 1.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.3;
}

.account-tile-note {
  font-size: 0.6875rem;
  color: #9ca3af;
}
</style>
