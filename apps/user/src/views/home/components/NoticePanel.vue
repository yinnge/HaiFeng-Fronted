<script setup lang="ts">
import { computed } from 'vue'
import type { AnnouncementListVO } from '@/types/home'
import NoticeRow from './NoticeRow.vue'

const props = defineProps<{
  announcements: AnnouncementListVO[]
  loading?: boolean
  visibleCount: number
  panelHeight?: number | null
  stacked?: boolean
}>()

defineEmits<{
  select: [id: string]
  'view-all': []
}>()

const items = computed(() => props.announcements.slice(0, Math.max(0, props.visibleCount)))

const panelStyle = computed(() => {
  if (props.stacked || !props.panelHeight) return {}
  return { height: `${props.panelHeight}px` }
})
</script>

<template>
  <aside class="notice-panel" :style="panelStyle">
    <div class="notice-panel__header">
      <h3 class="notice-panel__title">规划院公告</h3>
      <button type="button" class="notice-panel__more" @click="$emit('view-all')">
        查看全部
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 4l6 6-6 6" />
        </svg>
      </button>
    </div>

    <div v-if="loading" class="notice-skeleton">
      <div v-for="n in 5" :key="n" class="notice-skeleton__row"></div>
    </div>

    <ul v-else-if="items.length" class="notice-list">
      <li v-for="(item, index) in items" :key="item.id" class="notice-list__item">
        <NoticeRow :item="item" :is-new="index === 0" @select="$emit('select', $event)" />
      </li>
    </ul>

    <div v-else class="notice-empty">暂无公告</div>
  </aside>
</template>

<style scoped>
.notice-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 1.15rem 1.25rem;
  background: #ffffff;
  border-radius: 1rem;
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #f97316, #fb923c) 1;
  border-top-width: 3px;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.06);
  overflow: hidden;
}

.notice-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-shrink: 0;
  padding-bottom: 0.7rem;
  border-bottom: 2px solid #f97316;
  margin-bottom: 0.35rem;
}

.notice-panel__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.05rem;
  font-weight: 800;
  color: #1f2937;
  line-height: 1.3;
}

.notice-panel__title::before {
  content: '';
  width: 4px;
  height: 1.1rem;
  flex-shrink: 0;
  border-radius: 2px;
  background: linear-gradient(180deg, #f97316, #fb923c);
}

.notice-panel__more {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  flex-shrink: 0;
  padding: 0;
  font-size: 0.75rem;
  color: #9ca3af;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.notice-panel__more:hover {
  color: #f97316;
}

.notice-panel__more svg {
  width: 0.8rem;
  height: 0.8rem;
}

.notice-list {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.notice-list__item {
  display: flex;
  flex: 0 0 auto;
  min-height: 0;
}

.notice-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 8rem;
  font-size: 0.85rem;
  color: #9ca3af;
}

.notice-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 0.75rem;
}

.notice-skeleton__row {
  height: 2.1rem;
  border-radius: 0.5rem;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%);
  background-size: 400% 100%;
  animation: notice-shimmer 1.4s ease infinite;
}

@keyframes notice-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .notice-skeleton__row {
    animation: none;
  }
}
</style>
