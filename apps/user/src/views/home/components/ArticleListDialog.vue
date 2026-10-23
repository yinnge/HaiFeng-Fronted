<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getHomeArticleNews } from '@/api/home'
import type { HomeArticleNewsVO } from '@/types/home'
import ArticleRow from './ArticleRow.vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [id: string | number]
}>()

const loading = ref(false)
const list = ref<HomeArticleNewsVO[]>([])

watch(
  () => props.modelValue,
  async (visible) => {
    if (!visible) return

    loading.value = true
    try {
      const res = await getHomeArticleNews({ page: 1, size: 100 })
      list.value = res.data.data.records
    } catch (e: any) {
      ElMessage.error(e?.message || '获取资讯失败')
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
    title="规划院资讯"
    width="min(720px, 92vw)"
    append-to-body
    class="article-dialog"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="loading" class="flex justify-center py-10">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-500"></div>
    </div>

    <ul v-else-if="list.length" class="article-list-dialog">
      <li v-for="item in list" :key="item.id">
        <ArticleRow :item="item" @select="emit('select', $event)" />
      </li>
    </ul>

    <div v-else class="article-list-dialog__empty">暂无资讯</div>
  </el-dialog>
</template>

<style scoped>
.article-list-dialog {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 60vh;
  overflow-y: auto;
  margin: 0;
  padding: 0 0.25rem 0 0;
  list-style: none;
}

.article-list-dialog__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 10rem;
  color: #9ca3af;
}
</style>
