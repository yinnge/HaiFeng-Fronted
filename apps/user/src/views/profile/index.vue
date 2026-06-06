<!-- apps/user/src/views/profile/index.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
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

// 加载数据
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

// 刷新数据
function handleRefresh() {
  loadData()
}

// 更新头像
function handleUpdateAvatar() {
  // TODO: 实现头像上传逻辑
  ElMessage.info('头像上传功能待实现')
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-6">
    <div class="mx-auto max-w-4xl px-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex justify-center py-20">
        <el-icon class="is-loading text-4xl text-orange-500"><Loading /></el-icon>
      </div>

      <!-- 内容区域 -->
      <div v-else class="space-y-6">
        <!-- 头部 -->
        <ProfileHeader
          :member-info="memberInfo"
          :profile="profile"
          @update-avatar="handleUpdateAvatar"
        />

        <!-- Tab 切换 -->
        <el-card shadow="never">
          <el-tabs v-model="activeTab">
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
      </div>
    </div>
  </div>
</template>
