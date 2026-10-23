<script setup lang="ts">
import type { AnnouncementListVO } from '@/types/home'
import NoticeTag from './NoticeTag.vue'

defineProps<{
  item: AnnouncementListVO
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
  min-width: 0;
  min-height: 2.4rem;
  padding: 0.45rem 0.55rem;
  background: none;
  border: none;
  border-radius: 0.625rem;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
}

.notice-item:hover {
  background: #f8fafc;
}

.notice-title {
  flex: 1;
  min-width: 0;
  color: #475569;
  font-size: 0.86rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.notice-item:hover .notice-title {
  color: #ea580c;
}

.notice-date {
  flex-shrink: 0;
  color: #94a3b8;
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
}
</style>
