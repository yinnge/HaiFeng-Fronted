<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ tag?: string }>()

const categoryRules = [
  { keywords: ['政策'], text: '政策', className: 'is-policy' },
  { keywords: ['资讯', '新闻'], text: '资讯', className: 'is-news' },
  { keywords: ['招录', '招生'], text: '招录', className: 'is-exam' },
  { keywords: ['就业', '招聘'], text: '就业', className: 'is-job' },
]

const meta = computed(() => {
  const raw = (props.tag || '').replace(/[【】[\]]/g, '').trim()
  if (!raw || /^\d+$/.test(raw)) return { text: '公告', className: 'is-default' }

  const rule = categoryRules.find(item => item.keywords.some(keyword => raw.includes(keyword)))
  if (rule) return { text: rule.text, className: rule.className }

  if (/[\u4e00-\u9fff]/.test(raw)) {
    return { text: raw.length > 4 ? raw.slice(0, 4) : raw, className: 'is-default' }
  }

  return { text: '公告', className: 'is-default' }
})

const text = computed(() => meta.value.text)
const className = computed(() => meta.value.className)
</script>

<template>
  <span class="notice-tag" :class="className" :title="text">{{ text }}</span>
</template>

<style scoped>
.notice-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  max-width: 3.5rem;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-tag.is-policy {
  background: #fff7ed;
  color: #ea580c;
}

.notice-tag.is-news {
  background: #eff6ff;
  color: #2563eb;
}

.notice-tag.is-exam {
  background: #ecfdf5;
  color: #059669;
}

.notice-tag.is-job {
  background: #fffbeb;
  color: #d97706;
}

.notice-tag.is-default {
  background: #f1f5f9;
  color: #64748b;
}
</style>
