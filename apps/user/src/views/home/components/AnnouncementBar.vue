<script setup lang="ts">
import { computed } from 'vue'
import type { AnnouncementListVO } from '@/types/home'
import NoticeTag from './NoticeTag.vue'

const props = defineProps<{
  announcements: AnnouncementListVO[]
  loading?: boolean
}>()

const emit = defineEmits<{
  select: [id: string]
  'view-all': []
}>()

// 复制一份实现首尾无缝衔接
const loopItems = computed(() => {
  const base = props.announcements
  return base.length ? [...base, ...base] : []
})

const duration = computed(() => {
  // 条数越多滚动越慢，保证可读性
  const n = props.announcements.length || 1
  return Math.max(18, n * 7)
})

function formatDate(value?: string) {
  if (!value) return '--'
  const date = value.slice(0, 10)
  return date.length >= 10 ? date.slice(5) : value
}
</script>

<template>
  <div class="ann-bar">
    <span class="ann-bar__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 11l18-5v12L3 14v-3z" />
        <path d="M11.6 16.8a3 3 0 0 1-5.8-1.6" />
      </svg>
    </span>

    <div class="ann-bar__viewport">
      <template v-if="loading">
        <span class="ann-bar__loading">公告加载中…</span>
      </template>
      <template v-else-if="loopItems.length">
        <div class="ann-bar__track" :style="{ '--ann-duration': duration + 's' }">
          <button
            v-for="(item, i) in loopItems"
            :key="item.id + '-' + i"
            type="button"
            class="ann-bar__item"
            @click="emit('select', item.id)"
          >
            <NoticeTag :tag="item.tag" />
            <span class="ann-bar__title">{{ item.title }}</span>
            <span class="ann-bar__date">{{ formatDate(item.updatedAt) }}</span>
            <span class="ann-bar__sep" aria-hidden="true">·</span>
          </button>
        </div>
      </template>
      <span v-else class="ann-bar__loading">暂无公告</span>
    </div>

    <button type="button" class="ann-bar__more" @click="emit('view-all')">
      更多
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M7 4l6 6-6 6" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.ann-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.75rem;
  margin-bottom: 1rem;
  padding: 0 0.5rem 0 0.75rem;
  background: #ffffff;
  border: 1px solid rgba(249, 115, 22, 0.14);
  border-radius: 0.75rem;
  box-shadow: 0 1px 6px rgba(15, 23, 42, 0.04);
  overflow: hidden;
}

.ann-bar__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  color: #ea580c;
}

.ann-bar__icon svg {
  width: 1.15rem;
  height: 1.15rem;
}

.ann-bar__viewport {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  height: 100%;
  display: flex;
  align-items: center;
  -webkit-mask-image: linear-gradient(to right, transparent, #000 2.5%, #000 95%, transparent);
  mask-image: linear-gradient(to right, transparent, #000 2.5%, #000 95%, transparent);
}

.ann-bar__loading {
  font-size: 0.8rem;
  color: #94a3b8;
  white-space: nowrap;
}

.ann-bar__track {
  display: flex;
  align-items: center;
  width: max-content;
  animation: ann-marquee var(--ann-duration, 24s) linear infinite;
}

/* hover 暂停，便于点击 */
.ann-bar__viewport:hover .ann-bar__track {
  animation-play-state: paused;
}

.ann-bar__item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  padding: 0 0.5rem;
  background: none;
  border: none;
  font: inherit;
  cursor: pointer;
  color: #475569;
  transition: color 0.2s ease;
}

.ann-bar__item:hover {
  color: #ea580c;
}

.ann-bar__title {
  font-size: 0.82rem;
  white-space: nowrap;
}

.ann-bar__date {
  font-size: 0.7rem;
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.ann-bar__sep {
  margin-left: 0.5rem;
  color: #cbd5e1;
}

.ann-bar__more {
  display: inline-flex;
  align-items: center;
  gap: 0.1rem;
  flex-shrink: 0;
  padding: 0.3rem 0.6rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #ea580c;
  background: #fff7ed;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.ann-bar__more:hover {
  background: #ffedd5;
}

.ann-bar__more svg {
  width: 0.85rem;
  height: 0.85rem;
}

@keyframes ann-marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ann-bar__track {
    animation: none;
  }
}
</style>
