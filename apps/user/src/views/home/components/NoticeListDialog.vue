<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getAnnouncements } from '@/api/home'
import type { AnnouncementListVO } from '@/types/home'
import NoticeRow from './NoticeRow.vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [id: string]
}>()

const loading = ref(false)
const list = ref<AnnouncementListVO[]>([])

watch(
  () => props.modelValue,
  async (visible) => {
    if (!visible) return

    loading.value = true
    try {
      const res = await getAnnouncements({ page: 1, size: 100 })
      list.value = res.data.data.records
    } catch (e: any) {
      ElMessage.error(e?.message || '获取公告失败')
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
    title="规划院公告"
    width="min(720px, 92vw)"
    append-to-body
    class="notice-dialog"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="loading" class="flex justify-center py-10">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-500"></div>
    </div>

    <ul v-else-if="list.length" class="notice-list-dialog">
      <li v-for="(item, index) in list" :key="item.id">
        <NoticeRow :item="item" :is-new="index === 0" @select="emit('select', $event)" />
      </li>
    </ul>

    <div v-else class="notice-list-dialog__empty">暂无公告</div>
  </el-dialog>
</template>

<style scoped>
.notice-list-dialog {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 60vh;
  overflow-y: auto;
  margin: 0;
  padding: 0 0.25rem 0 0;
  list-style: none;
}

.notice-list-dialog__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 10rem;
  color: #9ca3af;
}
</style>
