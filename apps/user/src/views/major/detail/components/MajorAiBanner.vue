<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Sparkles } from 'lucide-vue-next'
import { TONE_COLORS } from './utils'

const blue = TONE_COLORS.blue

function onStart() {
  // TODO: 后续接入 AI 就业规划落地页 / 对话能力时，在此替换为路由跳转或能力调用
  ElMessage.info({ message: '敬请期待', grouping: true })
}
</script>

<template>
  <section class="ai-banner hf-card">
    <span class="ai-banner__icon" :style="{ backgroundColor: TONE_COLORS.blue.bg, color: blue.fg }">
      <Sparkles :size="22" :stroke-width="1.75" />
    </span>

    <div class="ai-banner__text">
      <div class="ai-banner__head">
        <h3 class="ai-banner__title">AI 专属就业规划</h3>
        <span
          class="hf-tag"
          :style="{ color: blue.fg, backgroundColor: blue.bg, '--tag-ring': blue.ring }"
        >即将上线</span>
      </div>
      <p class="ai-banner__desc">结合专业背景与就业数据，为你梳理专属的职业发展路径。</p>
    </div>

    <button type="button" class="ai-banner__cta" @click="onStart">开始规划</button>
  </section>
</template>

<style scoped>
.ai-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 88px;
  padding: 16px 20px;
}
.ai-banner__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex: none;
  border-radius: 12px;
}
.ai-banner__text {
  flex: 1;
  min-width: 0;
}
.ai-banner__head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.ai-banner__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  color: #0f172a;
}
.ai-banner__desc {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: #64748b;
}
.ai-banner__cta {
  flex: none;
  padding: 10px 22px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.18);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.ai-banner__cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(249, 115, 22, 0.24);
}
.ai-banner__cta:active {
  transform: none;
}
@media (max-width: 767px) {
  .ai-banner {
    flex-wrap: wrap;
  }
  .ai-banner__cta {
    width: 100%;
  }
}
</style>
