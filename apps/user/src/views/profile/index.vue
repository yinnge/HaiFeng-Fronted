<!-- apps/user/src/views/profile/index.vue -->
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import ProfileHeader from './components/ProfileHeader.vue'
import ProfileForm from './components/ProfileForm.vue'
import AccountInfo from './components/AccountInfo.vue'
import CommissionPanel from './components/CommissionPanel.vue'
import NotificationPanel from './components/NotificationPanel.vue'
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
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-20">
        <el-icon class="is-loading text-4xl text-orange-500"><Loading /></el-icon>
      </div>

      <template v-else>
        <!-- 用户信息卡 - 全宽 -->
        <ProfileHeader
          :member-info="memberInfo"
          :profile="profile"
          @update-avatar="handleUpdateAvatar"
        />

        <!-- Tab 切换 + 内容区 -->
        <el-card shadow="never" class="profile-tabs-card">
          <el-tabs v-model="activeTab" class="profile-tabs">
            <el-tab-pane label="账号安全" name="account">
              <AccountInfo :member-info="memberInfo" @refresh="handleRefresh" />
            </el-tab-pane>
            <el-tab-pane label="个人资料" name="profile">
              <ProfileForm :profile="profile" @refresh="handleRefresh" />
            </el-tab-pane>
            <el-tab-pane label="佣金提现" name="commission">
              <CommissionPanel />
            </el-tab-pane>
            <el-tab-pane label="消息通知" name="notification">
              <NotificationPanel @refresh="userStore.fetchUserInfo()" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
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
  background: linear-gradient(to bottom, rgba(255, 247, 237, 0.4), white);
}

.profile-main {
  max-width: 80rem;
  margin: 0 auto;
  padding: 2rem 1rem;
}

@media (min-width: 768px) {
  .profile-main {
    padding: 2rem 2rem;
  }
}

@media (min-width: 1280px) {
  .profile-main {
    padding: 2rem 3rem;
  }
}

.profile-tabs-card {
  margin-top: 1.5rem;
  /* 恢复：只保留上下橙色边框，去掉左右黑边 */
  border-radius: 0;
  border-top: 2px solid #f5a54a;
  border-bottom: 2px solid #f5a54a;
  border-left: none;
  border-right: none;
}

/* el-card 默认 body 有 20px 内边距，会让白色 tab 条缩进、不贴左右边缘；
   去掉内边距让 tab 条与卡片左右边缘对齐 */
.profile-tabs-card :deep(.el-card__body) {
  padding: 0;
}

.profile-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  background: linear-gradient(to right, #fff7ed, #fffaf5);
  padding: 0.875rem 1rem;
  border-bottom: none;
}

/* 胶囊式导航：取消左缩进 */
.profile-tabs :deep(.el-tabs__nav-scroll) {
  padding-left: 0;
}

/* 内容区单独加内边距 + 暖橙渐变底（配合页面根背景暖色调，白卡片浮于其上） */
.profile-tabs :deep(.el-tabs__content) {
  padding: 1.5rem;
  background: linear-gradient(to right, #fff7ed, #fffaf5 50%, #ffffff);
}

.profile-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 0;
}

/* 胶囊式导航不需要下划线 */
.profile-tabs :deep(.el-tabs__active-bar) {
  display: none;
}

/* 胶囊式标签 */
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

.profile-tabs :deep(.el-tabs__item:hover) {
  color: #e8722a;
  background: #fff7ed;
}

.profile-tabs :deep(.el-tabs__item.is-active),
.profile-tabs :deep(.el-tabs__item.is-active:hover) {
  color: #ffffff;
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  font-weight: 600;
}
</style>
