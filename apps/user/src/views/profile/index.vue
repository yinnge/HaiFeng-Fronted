<!-- apps/user/src/views/profile/index.vue -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ProfileHeader from './components/ProfileHeader.vue'
import ProfileForm from './components/ProfileForm.vue'
import AccountInfo from './components/AccountInfo.vue'
import CommissionPanel from './components/CommissionPanel.vue'
import NotificationPanel from './components/NotificationPanel.vue'
import ProfileSidebar from './components/ProfileSidebar.vue'
import AvatarSelector from './components/AvatarSelector.vue'
import type { MemberInfoVO } from '@/types/member/info'
import type { MemberProfileVO } from '@/types/member/profile'
import { getProfile } from '@/api/member/profile'
import { getMemberInfo } from '@/api/member/info'
import { useUserStore } from '@/store'

const route = useRoute()
const userStore = useUserStore()
const activeTab = ref('profile')
const memberInfo = ref<MemberInfoVO | null>(null)
const profile = ref<MemberProfileVO | null>(null)
const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    const [infoRes, profileRes] = await Promise.all([getMemberInfo(), getProfile()])
    memberInfo.value = infoRes.data.data
    profile.value = profileRes.data.data
    userStore.setUserInfo({
      username: infoRes.data.data.username,
      phone: infoRes.data.data.phone,
      avatar: infoRes.data.data.avatar,
      memberType: infoRes.data.data.memberType,
      inviteCode: infoRes.data.data.inviteCode,
      commissionBalance: infoRes.data.data.commissionBalance,
    })
  } catch (err: any) {
    ElMessage.error(err.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function handleRefresh() {
  loadData()
}

const showAvatarSelector = ref(false)
const currentAvatar = ref('')

function handleUpdateAvatar() {
  currentAvatar.value = memberInfo.value?.avatar || ''
  showAvatarSelector.value = true
}

function handleAvatarUpdated() {
  loadData()
}

// 侧栏「账户概览 - 查看详情」→ 切到佣金提现 tab
function handleViewCommission() {
  activeTab.value = 'commission'
}

watch(
  () => route.query.tab,
  (tab) => {
    if (tab && typeof tab === 'string') {
      activeTab.value = tab
    }
  },
  { immediate: true }
)

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="profile-page">
    <main class="profile-main">
      <!-- 加载状态：骨架屏 -->
      <div v-if="loading" class="profile-skeleton">
        <div class="skeleton-banner hf-block" />
        <div class="skeleton-grid">
          <div class="hf-block skeleton-main" />
          <div class="skeleton-side">
            <div class="hf-block skeleton-card" />
            <div class="hf-block skeleton-card" />
            <div class="hf-block skeleton-card" />
          </div>
        </div>
      </div>

      <template v-else>
        <!-- 用户信息横幅 - 全宽 -->
        <ProfileHeader
          :member-info="memberInfo"
          :profile="profile"
          @update-avatar="handleUpdateAvatar"
        />

        <!-- 双栏：左主列（Tab + 内容） + 右侧栏 -->
        <div class="profile-grid">
          <el-card shadow="never" class="profile-tabs-card hf-card">
            <el-tabs v-model="activeTab" class="profile-tabs">
              <el-tab-pane name="account">
                <template #label>
                  <span class="tab-label">
                    <svg class="tab-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
                    </svg>
                    账号安全
                  </span>
                </template>
                <AccountInfo :member-info="memberInfo" @refresh="handleRefresh" />
              </el-tab-pane>
              <el-tab-pane name="profile">
                <template #label>
                  <span class="tab-label">
                    <svg class="tab-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                    </svg>
                    个人资料
                  </span>
                </template>
                <ProfileForm :profile="profile" @refresh="handleRefresh" />
              </el-tab-pane>
              <el-tab-pane name="commission">
                <template #label>
                  <span class="tab-label">
                    <svg class="tab-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.798 7.45c.64-1.24 2.76-1.3 3.42-.06.2.38.65.53 1.02.33.38-.2.53-.65.33-1.02-.83-1.55-2.65-2.1-4.14-1.72A2.6 2.6 0 007.5 6.06c-.6.9-.5 2.1.32 2.87.44.41 1.04.65 1.63.79.53.12 1.02.2 1.38.34.36.14.5.28.55.38.06.12.08.35-.1.64-.4.66-1.5.75-2.19.02-.3-.32-.8-.33-1.12-.02-.32.3-.33.8-.02 1.12.6.63 1.4.94 2.17.98V14a.75.75 0 001.5 0v-.72c.5-.12 1.02-.4 1.36-.94.4-.65.45-1.44.07-2.12-.4-.72-1.13-1.03-1.9-1.24-.44-.12-.9-.2-1.3-.31-.4-.1-.72-.22-.9-.4-.2-.18-.23-.4-.14-.6l.29-.22z" />
                    </svg>
                    佣金提现
                  </span>
                </template>
                <CommissionPanel />
              </el-tab-pane>
              <el-tab-pane name="notification">
                <template #label>
                  <span class="tab-label">
                    <svg class="tab-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a6 6 0 00-6 6c0 1.887-.454 3.665-1.243 5.234a.75.75 0 00.515 1.076 32.91 32.91 0 003.256.508 3.5 3.5 0 106.954 0 32.903 32.903 0 003.256-.508.75.75 0 00.515-1.076A11.185 11.185 0 0116 8a6 6 0 00-6-6zM8.75 15.5a1.5 1.5 0 013 0 .75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75z" />
                    </svg>
                    消息通知
                  </span>
                </template>
                <NotificationPanel @refresh="userStore.fetchUserInfo()" />
              </el-tab-pane>
            </el-tabs>
          </el-card>

          <ProfileSidebar
            :member-info="memberInfo"
            :profile="profile"
            @view-commission="handleViewCommission"
          />
        </div>
      </template>
    </main>

    <AvatarSelector
      v-model:visible="showAvatarSelector"
      :current-avatar="currentAvatar"
      @updated="handleAvatarUpdated"
    />
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: transparent;
}

.profile-main {
  max-width: 80rem;
  margin: 0 auto;
  padding: 2rem 1rem 2.75rem;
}

@media (min-width: 768px) {
  .profile-main {
    padding: 2rem 2rem 2.75rem;
  }
}

@media (min-width: 1280px) {
  .profile-main {
    padding: 2rem 3rem 3rem;
  }
}

/* ===== 双栏布局 ===== */
.profile-grid {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20rem;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .profile-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* ===== 卡片微质感：发丝边 + 双层弥散阴影（全站规范） ===== */
.hf-card {
  background: #ffffff;
  border-radius: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 20px -2px rgba(15, 23, 42, 0.04);
}

.profile-tabs-card {
  border: 1px solid rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.profile-tabs-card :deep(.el-card__body) {
  padding: 0;
}

/* ===== 骨架屏 ===== */
.profile-skeleton {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.hf-block {
  background: linear-gradient(90deg, #f5f0ea 25%, #faf7f2 50%, #f5f0ea 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease infinite;
  border-radius: 1rem;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-banner {
  height: 9.5rem;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20rem;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .skeleton-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.skeleton-main {
  height: 30rem;
}

.skeleton-side {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skeleton-card {
  height: 9rem;
}

/* ===== Tab：白底胶囊 + 图标 ===== */
.profile-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  background: #ffffff;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.05);
}

.profile-tabs :deep(.el-tabs__nav-scroll) {
  padding-left: 0;
}

.profile-tabs :deep(.el-tabs__content) {
  padding: 1.5rem;
}

/* 白卡浮于暖色画布之上：内容区保持纯白 */
.profile-tabs :deep(.el-tabs__content) {
  background: #ffffff;
}

.profile-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 0;
}

.profile-tabs :deep(.el-tabs__active-bar) {
  display: none;
}

.profile-tabs :deep(.el-tabs__item) {
  font-weight: 500;
  font-size: 0.95rem;
  color: #6b7280;
  padding: 0 1.25rem;
  height: 40px;
  line-height: 40px;
  margin: 0 0.2rem;
  border-radius: 9999px;
  border: 1px solid transparent;
  border-left: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  transition: all 0.2s ease;
}

/* 强制首尾胶囊 padding 对称：Element Plus 的规则是 .el-tabs__item:nth-child(2){padding-left:0}
   （nav 的 DOM 顺序是 [active-bar, ...items]，第一个 item 是 nth-child(2) 而非 :first-child）
   加 !important 兜底确保压过 Element Plus 同优先级规则 */
.profile-tabs :deep(.el-tabs__item:nth-child(2)),
.profile-tabs :deep(.el-tabs__item:last-child) {
  padding: 0 1.25rem !important;
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.tab-icon {
  width: 1rem;
  height: 1rem;
}

.profile-tabs :deep(.el-tabs__item:hover) {
  color: #e8722a;
  background: #fff7ed;
}

.profile-tabs :deep(.el-tabs__item.is-active),
.profile-tabs :deep(.el-tabs__item.is-active:hover) {
  color: #ffffff;
  background: linear-gradient(135deg, #f97316, #fb923c);
  font-weight: 600;
}
</style>
