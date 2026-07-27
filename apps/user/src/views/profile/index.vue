<!-- apps/user/src/views/profile/index.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import ProfileHeader from './components/ProfileHeader.vue'
import ProfileForm from './components/ProfileForm.vue'
import AccountInfo from './components/AccountInfo.vue'
import CommissionPanel from './components/CommissionPanel.vue'
import type { MemberInfoVO } from '@/types/member/info'
import type { MemberProfileVO } from '@/types/member/profile'
import { getProfile } from '@/api/member/profile'
import { getMemberInfo, updateAvatar } from '@/api/member/info'

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
  } catch (err: any) {
    ElMessage.error(err.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function handleRefresh() {
  loadData()
}

function handleUpdateAvatar() {
  ElMessage.info('头像上传功能待实现')
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="profile-page">
    <AppHeader :show-nav-links="true" />

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
            <el-tab-pane label="个人资料" name="profile">
              <ProfileForm :profile="profile" @refresh="handleRefresh" />
            </el-tab-pane>
            <el-tab-pane label="账号安全" name="account">
              <AccountInfo :member-info="memberInfo" @refresh="handleRefresh" />
            </el-tab-pane>
            <el-tab-pane label="佣金提现" name="commission">
              <CommissionPanel />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </template>
    </main>
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
  border-radius: 0;
  border-top: 2px solid #f5a54a;
  border-bottom: 2px solid #f5a54a;
  border-left: none;
  border-right: none;
}

.profile-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  background: white;
  border-radius: 0;
  padding: 0;
  border-bottom: 2px solid #f5a54a;
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
