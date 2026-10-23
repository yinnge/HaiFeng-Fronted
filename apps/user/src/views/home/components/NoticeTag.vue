<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ tag?: string }>()

// 直接展示后台返回的 tag，去掉写死的「公告」；仅在 tag 为空时兜底显示「公告」
const text = computed(() => {
  const raw = (props.tag || '').replace(/[【】[\]]/g, '').trim()
  return raw || '公告'
})
</script>

<template>
  <span class="notice-tag" :title="text">{{ text }}</span>
</template>

<style scoped>
.notice-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  max-width: 5rem;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* 固定橙色（公告 tag 专用配色） */
  background: #fff7ed;
  color: #ea580c;
}
</style>
