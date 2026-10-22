<script setup lang="ts">
import type { AnnouncementListVO } from '@/types/home'
import NoticeTag from './NoticeTag.vue'

defineProps<{
  item: AnnouncementListVO
  isNew?: boolean
  featured?: boolean
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
  <button
    type="button"
    class="notice-item"
    :class="{ 'notice-item--featured': featured }"
    @click="$emit('select', item.id)"
  >
    <template v-if="featured">
      <span class="notice-item__eyebrow">
        <span v-if="isNew" class="notice-new">NEW</span>
        <NoticeTag :tag="item.tag" />
        <span class="notice-date">{{ formatDate(item.updatedAt) }}</span>
      </span>
      <span class="notice-item__title">{{ item.title }}</span>
    </template>

    <template v-else>
      <span v-if="isNew" class="notice-new">NEW</span>
      <NoticeTag :tag="item.tag" />
      <span class="notice-title">{{ item.title }}</span>
      <span class="notice-date">{{ formatDate(item.updatedAt) }}</span>
    </template>
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

.notice-item--featured {
  flex-direction: column;
  align-items: stretch;
  gap: 0.45rem;
  min-height: 5.5rem;
  padding: 0.8rem 0.85rem;
  background: #fff7ed;
  border: 1px solid rgba(249, 115, 22, 0.12);
}

.notice-item--featured:hover {
  background: #fff4e8;
}

.notice-item__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
}

.notice-item__eyebrow .notice-date {
  margin-left: auto;
}

.notice-item__title {
  display: -webkit-box;
  overflow: hidden;
  color: #1e293b;
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  transition: color 0.2s ease;
}

.notice-item--featured:hover .notice-item__title {
  color: #ea580c;
}

.notice-new {
  flex-shrink: 0;
  padding: 0.08rem 0.32rem;
  border-radius: 0.25rem;
  background: #fff1f2;
  color: #e11d48;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  line-height: 1.5;
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
