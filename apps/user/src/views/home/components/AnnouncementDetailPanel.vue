<script setup lang="ts">
import type { AnnouncementDetailVO } from '@/types/home'

defineProps<{
  detail: AnnouncementDetailVO | null
  loading?: boolean
}>()
</script>

<template>
  <div class="flex h-[320px] flex-col rounded-2xl bg-gradient-to-b from-orange-50/70 to-white p-6 shadow-lg border-t-[3px] border-t-orange-500 border-b-[3px] border-b-orange-400 lg:h-[440px]">
    <div v-if="loading" class="flex flex-1 items-center justify-center">
      <div class="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
    </div>

    <article v-else-if="detail" class="flex min-h-0 flex-1 flex-col">
      <div v-if="detail.tag" class="flex justify-center">
        <span class="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-600">
          {{ detail.tag }}
        </span>
      </div>
      <h3 class="mt-4 text-center text-2xl font-bold text-gray-800">{{ detail.title }}</h3>
      <div class="mb-5 mt-4 h-px shrink-0 bg-gradient-to-r from-orange-500 to-amber-400"></div>
      <div class="announcement-content min-h-0 flex-1 overflow-y-auto pr-1 text-gray-600 leading-relaxed" v-html="detail.content"></div>
    </article>

    <div v-else class="flex flex-1 items-center justify-center text-gray-400">暂无公告</div>
  </div>
</template>

<style>
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
