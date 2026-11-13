<script setup lang="ts">
import { Briefcase } from 'lucide-vue-next'
import type { EnterprisePositionVO } from '@/types/enterprise'
import PositionCard from './PositionCard.vue'
import { EMPTY_POSITIONS } from '../utils'

defineProps<{
  positions: EnterprisePositionVO[]
  loading?: boolean
  /** 接口错误信息 */
  error?: string
}>()

const emit = defineEmits<{
  (e: 'retry'): void
}>()
</script>

<template>
  <section class="pos-list">
    <header class="pos-list__head">
      <h2 class="hf-section-title">
        <Briefcase :size="16" :stroke-width="1.75" class="pos-list__head-icon" />
        岗位列表
      </h2>
      <span class="pos-list__count">
        共 <strong>{{ positions.length }}</strong> 个岗位
      </span>
    </header>

    <!-- 骨架 -->
    <div v-if="loading" class="pos-list__skeleton" aria-hidden="true">
      <div v-for="n in 2" :key="n" class="hf-skeleton pos-list__skeleton-card">
        <span class="pos-list__skeleton-line pos-list__skeleton-line--title" />
        <span class="pos-list__skeleton-line pos-list__skeleton-line--tag" />
        <span class="pos-list__skeleton-line pos-list__skeleton-line--text" />
        <span class="pos-list__skeleton-line pos-list__skeleton-line--text-short" />
      </div>
    </div>

    <!-- 错误态 -->
    <div v-else-if="error" class="pos-state">
      <p class="pos-state__text">{{ error }}</p>
      <button type="button" class="pos-state__btn" @click="emit('retry')">重试</button>
    </div>

    <!-- 空态：761 家企业（32%）无岗位，是常态而非异常 -->
    <div v-else-if="!positions.length" class="pos-state">
      <p class="pos-state__text">{{ EMPTY_POSITIONS }}</p>
      <p class="pos-state__hint">可先在右侧了解企业信息，或使用在线工具探索更多就业机会</p>
    </div>

    <!-- 岗位卡片 -->
    <div v-else class="pos-list__items">
      <PositionCard v-for="(item, index) in positions" :key="index" :position="item" />
    </div>
  </section>
</template>

<style scoped>
.pos-list {
  display: block;
}
.pos-list__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}
.pos-list__head-icon {
  color: #64748b;
}
.pos-list__count {
  font-size: 13px;
  line-height: 1.4;
  color: #64748b;
}
.pos-list__count strong {
  font-weight: 600;
  color: #0f172a;
}
.pos-list__items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pos-list__skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pos-list__skeleton-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 16px;
}
.pos-list__skeleton-line {
  display: block;
  height: 14px;
  border-radius: 6px;
  background: #e2e8f0;
}
.pos-list__skeleton-line--title {
  width: 40%;
  height: 18px;
}
.pos-list__skeleton-line--tag {
  width: 30%;
  height: 16px;
}
.pos-list__skeleton-line--text {
  width: 100%;
}
.pos-list__skeleton-line--text-short {
  width: 70%;
}
</style>
