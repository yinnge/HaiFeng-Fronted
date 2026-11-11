<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { MajorListVO } from '@/types/major'
import { formatRate } from './utils'

defineProps<{
  items: MajorListVO[]
  loading?: boolean
}>()
</script>

<template>
  <!-- 同专业类无其他专业时整块隐藏，不渲染空白卡 -->
  <section v-if="loading || items.length" class="related hf-card">
    <h2 class="hf-section-title">相关专业推荐</h2>

    <div v-if="loading" class="related__grid">
      <span v-for="n in 6" :key="n" class="hf-skeleton related__skeleton" />
    </div>

    <div v-else class="related__grid">
      <RouterLink
        v-for="item in items"
        :key="item.id"
        :to="`/major/${item.id}`"
        class="related__card"
      >
        <span class="related__name">{{ item.majorName }}</span>
        <span class="related__meta">
          <span class="related__code hf-mono">{{ item.majorCode }}</span>
          <span v-if="formatRate(item.employmentRate)" class="related__rate">
            {{ formatRate(item.employmentRate) }}
          </span>
        </span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.related {
  padding: 20px;
}
.related__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.related__skeleton {
  height: 66px;
}
.related__card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  text-decoration: none;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}
.related__card:hover {
  border-color: rgba(37, 99, 235, 0.35);
  background: #eff6ff;
}
.related__name {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.related__card:hover .related__name {
  color: #2563eb;
}
.related__meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.related__code {
  font-size: 12px;
  line-height: 1.4;
  color: #64748b;
}
.related__rate {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: #059669;
}
@media (max-width: 767px) {
  .related__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
