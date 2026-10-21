<script setup lang="ts">
import type { AnnouncementListVO } from '@/types/home'
import NoticeTag from './NoticeTag.vue'

defineProps<{
  item: AnnouncementListVO
  isNew?: boolean
}>()

defineEmits<{
  select: [id: string]
}>()

function formatDate(value?: string) {
  if (!value) return '--'
  const date = value.slice(0, 10)
  return date.length >= 10 ? date.slice(5) : value
}
</script>

<template>
  <button type="button" class="notice-item" @click="$emit('select', item.id)">
    <span v-if="isNew" class="notice-new">NEW</span>
    <NoticeTag :tag="item.tag" />
    <span class="notice-title">{{ item.title }}</span>
    <span class="notice-date">{{ formatDate(item.updatedAt) }}</span>
  </button>
</template>

<style scoped>
.notice-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  height: 100%;
  min-height: 2.4rem;
  min-width: 0;
  padding: 0.45rem 0.1rem;
  background: none;
  border: none;
  border-bottom: 1px dashed #eeeeee;
  text-align: left;
  cursor: pointer;
}

.notice-new {
  flex-shrink: 0;
  padding: 0.05rem 0.32rem;
  border-radius: 0.25rem;
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #ffffff;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.5;
}

.notice-title {
  flex: 1;
  min-width: 0;
  font-size: 0.86rem;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.notice-item:hover .notice-title {
  color: #f97316;
}

.notice-date {
  flex-shrink: 0;
  font-size: 0.72rem;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;
}
</style>
