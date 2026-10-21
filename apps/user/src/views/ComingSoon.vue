<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const from = computed(() => (route.query.from as string) || '')
const titleMap: Record<string, string> = {
  'career-map': '生涯规划图谱',
  'data-compare': '大数据对比',
  consultation: '专家咨询预约',
}
const label = computed(() => titleMap[from.value] || '')
</script>

<template>
  <div class="cs-wrap">
    <div class="cs-card">
      <div class="cs-icon">
        <svg viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" stroke="#ff7a00" stroke-width="2" opacity="0.25" />
          <path
            d="M20 40l8-8 6 6 12-14"
            stroke="#ff7a00"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="46" cy="22" r="3" fill="#ff7a00" />
        </svg>
      </div>
      <h1 class="cs-title">敬请期待</h1>
      <p class="cs-sub">
        {{ label ? `「${label}」即将上线，我们正在全力打磨` : '该功能正在紧锣密鼓开发中' }}
      </p>
      <button type="button" class="cs-btn" @click="router.push('/')">返回首页</button>
    </div>
  </div>
</template>

<style scoped>
.cs-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 24px;
  background: linear-gradient(170deg, #fffdfa 0%, #fff6ec 100%);
}
.cs-card {
  text-align: center;
  max-width: 460px;
}
.cs-icon {
  width: 96px;
  height: 96px;
  margin: 0 auto 24px;
}
.cs-icon svg {
  width: 100%;
  height: 100%;
}
.cs-title {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #292524;
}
.cs-sub {
  margin-top: 12px;
  font-size: 15px;
  color: #a8a29e;
}
.cs-btn {
  margin-top: 28px;
  padding: 12px 32px;
  border: none;
  border-radius: 9999px;
  background: linear-gradient(135deg, #ff9a3d, #ff7a00);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(255, 122, 0, 0.3);
  transition: all 0.2s ease;
}
.cs-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(255, 122, 0, 0.4);
}
</style>
