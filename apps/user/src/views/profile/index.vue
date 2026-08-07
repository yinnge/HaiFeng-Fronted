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
import UpgradeMemberDialog from './components/UpgradeMemberDialog.vue'
import type { MemberInfoVO } from '@/types/member/info'
import type { MemberProfileVO } from '@/types/member/profile'
import type { SiteInfoVO } from '@/types/home'
import { getProfile } from '@/api/member/profile'
import { getMemberInfo } from '@/api/member/info'
import { getSiteInfo } from '@/api/home'
import { useUserStore } from '@/store'

const route = useRoute()
const userStore = useUserStore()
const activeTab = ref('profile')
const memberInfo = ref<MemberInfoVO | null>(null)
const profile = ref<MemberProfileVO | null>(null)
const siteInfo = ref<SiteInfoVO | null>(null)
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

async function loadSiteInfo() {
  try {
    const res = await getSiteInfo()
    siteInfo.value = res.data.data
  } catch {
    // 静默处理
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

const showUpgradeDialog = ref(false)

function handleOpenUpgrade() {
  showUpgradeDialog.value = true
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
  loadSiteInfo()
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
          @open-upgrade="handleOpenUpgrade"
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

    <UpgradeMemberDialog
      v-model:visible="showUpgradeDialog"
      :member-info="memberInfo"
      :site-info="siteInfo"
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
  background: white;
  padding: 0;
  border-bottom: 2px solid #f5a54a;
}

/* 白色切换条：左缩进 50px，让“账号安全”等标签整体右移 */
.profile-tabs :deep(.el-tabs__nav-scroll) {
  padding-left: 50px;
}

/* 内容区单独加内边距（因为上面去掉了 card body 的内边距） */
.profile-tabs :deep(.el-tabs__content) {
  padding: 1.5rem;
}

.profile-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 0;
}

.profile-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(90deg, #fbbf24, #f5a54a, #e8722a);
  height: 3px;
}

.profile-tabs :deep(.el-tabs__item) {
  font-weight: 600;
  font-size: 1.05rem;
  color: #1f2937;
  padding: 0 1.5rem;
  height: 48px;
  line-height: 48px;
}

.profile-tabs :deep(.el-tabs__item.is-active) {
  color: #e8722a;
}

.profile-tabs :deep(.el-tabs__item:hover) {
  color: #f5a54a;
}
</style>
