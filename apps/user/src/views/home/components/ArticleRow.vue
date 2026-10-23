<script setup lang="ts">
import type { HomeArticleNewsVO } from '@/types/home'
import { formatArticleDate } from '@/utils/articleModule'
import ArticleTag from './ArticleTag.vue'

defineProps<{
  item: HomeArticleNewsVO
}>()

defineEmits<{
  select: [id: string | number]
}>()
</script>

<template>
  <button type="button" class="article-item" @click="$emit('select', item.id)">
    <ArticleTag :module-name="item.moduleName" />
    <span class="article-title">{{ item.title }}</span>
    <span class="article-date">{{ formatArticleDate(item.publishTime, item.year) }}</span>
  </button>
</template>

<style scoped>
.article-item {
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

.article-item:hover {
  background: #f8fafc;
}

.article-title {
  flex: 1;
  min-width: 0;
  color: #475569;
  font-size: 0.86rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

.article-item:hover .article-title {
  color: #ea580c;
}

.article-date {
  flex-shrink: 0;
  color: #94a3b8;
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
}
</style>
