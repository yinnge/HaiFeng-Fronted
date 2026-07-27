<!-- apps/admin/src/views/profile/index.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/store'
import AvatarCard from './components/AvatarCard.vue'
import ProfileForm from './components/ProfileForm.vue'

const userStore = useUserStore()

onMounted(() => {
  if (!userStore.profile) {
    userStore.fetchProfile()
  }
})

function handleRefresh() {
  userStore.fetchProfile()
}
</script>

<template>
  <div class="profile-page">
    <!-- 枫叶装饰 -->
    <div class="watermark-left"><img src="@/assets/images/logo-main.png" alt="" /></div>
    <div class="watermark-right"><img src="@/assets/images/logo-main.png" alt="" /></div>

    <div class="page-header">
      <div class="page-title">个人中心</div>
      <div class="page-subtitle">管理个人资料、密码安全与双因素认证</div>
    </div>

    <div class="profile-layout">
      <AvatarCard :profile="userStore.profile" />
      <ProfileForm :profile="userStore.profile" @refresh="handleRefresh" />
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.5) 0%, #fff 100%);
  padding: 24px;
  position: relative;
  overflow: hidden;
}

/* 枫叶水印 */
.watermark-left,
.watermark-right {
  position: absolute;
  opacity: 0.05;
  pointer-events: none;
  z-index: 0;
}
.watermark-left {
  top: -60px;
  right: 40px;
  transform: rotate(18deg);
}
.watermark-right {
  bottom: -40px;
  left: 30px;
  transform: rotate(-12deg);
}
.watermark-left img,
.watermark-right img {
  width: 180px;
  height: auto;
}

/* 页面标题 */
.page-header {
  position: relative;
  z-index: 1;
  margin-bottom: 24px;
}
.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}
.page-subtitle {
  font-size: 13px;
  color: #9ca3af;
}

.profile-layout {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

@media (max-width: 768px) {
  .profile-layout {
    flex-direction: column;
  }
}
</style>