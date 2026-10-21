<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ tag?: string }>()

const text = computed(() => {
  const value = (props.tag || '公告').replace(/[【】[\]]/g, '').trim() || '公告'
  return `【${value}】`
})

const className = computed(() => {
  const value = props.tag ?? ''
  if (value.includes('政策')) return 'is-policy'
  if (value.includes('资讯')) return 'is-news'
  if (value.includes('招录')) return 'is-exam'
  if (value.includes('就业')) return 'is-job'
  return 'is-default'
})
</script>

<template>
  <span class="notice-tag" :class="className">{{ text }}</span>
</template>

<style scoped>
.notice-tag {
  flex-shrink: 0;
  padding: 0.1rem 0.4rem;
  border-radius: 0.3rem;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
}

.notice-tag.is-policy {
  background: #fff1e6;
  color: #ff7a00;
}

.notice-tag.is-news {
  background: #e8f3ff;
  color: #2e7dff;
}

.notice-tag.is-exam {
  background: #e9f9ee;
  color: #16a34a;
}

.notice-tag.is-job {
  background: #f3e8ff;
  color: #9333ea;
}

.notice-tag.is-default {
  background: #fff1e6;
  color: #f97316;
}
</style>
