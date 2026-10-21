<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getAnnouncementDetail } from '@/api/home'
import type { AnnouncementDetailVO } from '@/types/home'
import NoticeTag from './NoticeTag.vue'

const props = defineProps<{
  modelValue: boolean
  announcementId: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const loading = ref(false)
const detail = ref<AnnouncementDetailVO | null>(null)
const cache = new Map<string, AnnouncementDetailVO>()

watch(
  () => [props.modelValue, props.announcementId] as const,
  async ([visible, id]) => {
    if (!visible || !id) return

    const cached = cache.get(id)
    if (cached) {
      detail.value = cached
      return
    }

    loading.value = true
    detail.value = null
    try {
      const res = await getAnnouncementDetail(id)
      const data = res.data.data
      cache.set(id, data)
      detail.value = data
    } catch (e: any) {
      ElMessage.error(e?.message || '获取公告详情失败')
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="公告详情"
    width="min(720px, 92vw)"
    append-to-body
    class="notice-dialog"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="loading" class="flex justify-center py-10">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500"></div>
    </div>

    <article v-else-if="detail" class="notice-detail">
      <div class="notice-detail__head">
        <NoticeTag :tag="detail.tag" />
        <h3 class="notice-detail__title">{{ detail.title }}</h3>
      </div>
      <div class="notice-detail__divider"></div>
      <div class="announcement-content" v-html="detail.content"></div>
    </article>

    <div v-else class="notice-detail__empty">暂无公告</div>
  </el-dialog>
</template>

<style scoped>
.notice-detail {
  max-height: 62vh;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.notice-detail__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
}

.notice-detail__title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1f2937;
  line-height: 1.45;
}

.notice-detail__divider {
  height: 1px;
  margin: 1rem 0;
  background: linear-gradient(90deg, #f97316, #fbbf24);
}

.notice-detail__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 10rem;
  color: #9ca3af;
}
</style>

<style>
.announcement-content {
  color: #4b5563;
  line-height: 1.85;
  font-size: 0.9rem;
}

.announcement-content p {
  margin-bottom: 12px;
}

.announcement-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 8px 0;
}

.announcement-content h1,
.announcement-content h2,
.announcement-content h3,
.announcement-content h4 {
  font-weight: 700;
  color: #1f2937;
  margin: 20px 0 10px;
  line-height: 1.4;
}

.announcement-content ul {
  list-style: disc;
  padding-left: 20px;
  margin: 8px 0 12px;
}

.announcement-content ol {
  list-style: decimal;
  padding-left: 20px;
  margin: 8px 0 12px;
}

.announcement-content li {
  margin-bottom: 4px;
}

.announcement-content a {
  color: #f97316;
  text-decoration: underline;
}

.announcement-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
}

.announcement-content td,
.announcement-content th {
  border: 1px solid #e5e7eb;
  padding: 6px 10px;
}

.announcement-content blockquote {
  border-left: 3px solid #f97316;
  padding-left: 12px;
  color: #6b7280;
  margin: 8px 0 12px;
}
</style>
