<!-- apps/admin/src/views/login/components/LoginCard.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import UserLoginForm from './UserLoginForm.vue'
import UserRegisterForm from './UserRegisterForm.vue'
import AdminLoginForm from './AdminLoginForm.vue'
import BorderBeam from '@/components/ui/BorderBeam.vue'

type TabType = 'user' | 'admin'
type FormType = 'login' | 'register'

const emit = defineEmits<{
  (e: 'forgot-password'): void
  (e: 'need-totp'): void
}>()

const activeTab = ref<TabType>('user')
const formType = ref<FormType>('login')

const handleTabChange = (tab: TabType) => {
  activeTab.value = tab
  formType.value = 'login'
}
</script>

<template>
  <div class="login-card-wrapper relative">
    <!-- 外层光晕 -->
    <div class="absolute -inset-4 bg-gradient-to-br from-brand-gold/20 via-brand-orange/10 to-brand-gold/20 rounded-3xl blur-2xl opacity-60" />

    <!-- 主卡片 -->
    <div class="login-card relative w-[420px] rounded-2xl p-8">
      <!-- 动态流光边框 - 金黄色双层效果 -->
      <BorderBeam
        :size="220"
        :duration="5"
        :border-width="2"
        color-from="#fbbf24"
        color-to="#fde68a"
        :delay="0"
      />
      <BorderBeam
        :size="220"
        :duration="5"
        :border-width="2"
        color-from="#f59e0b"
        color-to="#fbbf24"
        :delay="2.5"
      />

      <!-- 内部高光 -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/50 to-transparent" />
        <div class="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-white/30 to-transparent" />
      </div>

      <!-- Tab 切换 -->
      <div class="flex gap-8 mb-8 pb-4 relative z-10 border-b border-brand-gold/20">
        <span
          class="tab-item cursor-pointer transition-all duration-300"
          :class="activeTab === 'user' ? 'tab-active' : 'tab-inactive'"
          @click="handleTabChange('user')"
        >
          用户登录
        </span>
        <span
          class="tab-item cursor-pointer transition-all duration-300"
          :class="activeTab === 'admin' ? 'tab-active' : 'tab-inactive'"
          @click="handleTabChange('admin')"
        >
          管理员
        </span>
      </div>

      <!-- 表单区域 -->
      <div class="relative z-10">
        <template v-if="activeTab === 'user'">
          <UserLoginForm
            v-if="formType === 'login'"
            @forgot-password="emit('forgot-password')"
            @switch-to-register="formType = 'register'"
          />
          <UserRegisterForm
            v-else
            @switch-to-login="formType = 'login'"
          />
        </template>

        <AdminLoginForm
          v-else
          @forgot-password="emit('forgot-password')"
          @need-totp="emit('need-totp')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-card {
  /* 磨砂玻璃效果 */
  background: linear-gradient(
    165deg,
    rgba(255, 255, 255, 0.96) 0%,
    rgba(254, 252, 250, 0.94) 30%,
    rgba(253, 248, 242, 0.92) 60%,
    rgba(252, 245, 235, 0.94) 100%
  );
  backdrop-filter: blur(20px);
  box-shadow:
    0 25px 50px -15px rgba(191, 138, 48, 0.25),
    0 15px 30px -10px rgba(232, 114, 42, 0.15),
    inset 0 2px 6px rgba(255, 255, 255, 0.9),
    inset 0 -1px 4px rgba(191, 138, 48, 0.05);
  /* 静态金色边框作为底色 */
  border: 1px solid rgba(212, 168, 90, 0.3);
}

/* Tab 样式 */
.tab-item {
  font-size: 1rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
}

.tab-active {
  color: #bf8a30;
  text-shadow: 0 1px 2px rgba(191, 138, 48, 0.3);
  border-bottom: 2px solid #bf8a30;
  margin-bottom: -4px;
}

.tab-inactive {
  color: #9ca3af;
}
.tab-inactive:hover {
  color: #6b7280;
}
</style>
