<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getHomeArticleDetail } from '@/api/home'
import type { HomeArticleDetailVO } from '@/types/home'
import { formatArticleDate } from '@/utils/articleModule'
import ArticleTag from './ArticleTag.vue'

const props = defineProps<{
  modelValue: boolean
  articleId: string | number | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const loading = ref(false)
const detail = ref<HomeArticleDetailVO | null>(null)
const cache = new Map<string, HomeArticleDetailVO>()

watch(
  () => [props.modelValue, props.articleId] as const,
  async ([visible, id]) => {
    if (!visible || !id) return

    const cacheKey = String(id)
    const cached = cache.get(cacheKey)
    if (cached) {
      detail.value = cached
      return
    }

    loading.value = true
    detail.value = null
    try {
      const res = await getHomeArticleDetail(id)
      const data = res.data.data
      cache.set(cacheKey, data)
      detail.value = data
    } catch (e: any) {
      ElMessage.error(e?.message || '获取资讯详情失败')
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
    title="资讯详情"
    width="min(720px, 92vw)"
    append-to-body
    class="article-dialog"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="loading" class="flex justify-center py-10">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-500"></div>
    </div>

    <article v-else-if="detail" class="article-detail">
      <div class="article-detail__head">
        <ArticleTag :module-name="detail.moduleName" />
        <h3 class="article-detail__title">{{ detail.title }}</h3>
        <span class="article-detail__meta">
          <span>{{ formatArticleDate(detail.publishTime, detail.year) }}</span>
          <span v-if="detail.viewCount">· {{ detail.viewCount }} 阅读</span>
        </span>
        <p v-if="detail.summary" class="article-detail__summary">{{ detail.summary }}</p>
      </div>
      <div class="article-detail__divider"></div>
      <div class="article-content" v-html="detail.content"></div>
    </article>

    <div v-else class="article-detail__empty">暂无资讯</div>
  </el-dialog>
</template>

<style scoped>
.article-detail {
  max-height: 62vh;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.article-detail__head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  text-align: center;
}

.article-detail__title {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1f2937;
  line-height: 1.45;
}

.article-detail__meta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  color: #94a3b8;
}

.article-detail__summary {
  margin: 0;
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.6;
}

.article-detail__divider {
  height: 1px;
  margin: 1rem 0;
  background: var(--neutral-border);
}

.article-detail__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 10rem;
  color: #9ca3af;
}
</style>

<style>
/* 资讯正文排版（v-html 注入，需非 scoped） */
.article-content {
  color: #4b5563;
  line-height: 1.85;
  font-size: 0.9rem;
}

.article-content p {
  margin-bottom: 12px;
}

.article-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 8px 0;
}

.article-content h1,
.article-content h2,
.article-content h3,
.article-content h4 {
  font-weight: 700;
  color: #1f2937;
  margin: 20px 0 10px;
  line-height: 1.4;
}

.article-content ul {
  list-style: disc;
  padding-left: 20px;
  margin: 8px 0 12px;
}

.article-content ol {
  list-style: decimal;
  padding-left: 20px;
  margin: 8px 0 12px;
}

.article-content li {
  margin-bottom: 4px;
}

.article-content a {
  color: #2563eb;
  text-decoration: underline;
}

.article-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
}

.article-content td,
.article-content th {
  border: 1px solid #e5e7eb;
  padding: 6px 10px;
}

.article-content blockquote {
  border-left: 3px solid var(--sem-blue);
  padding-left: 12px;
  color: #6b7280;
  margin: 8px 0 12px;
}
</style>
