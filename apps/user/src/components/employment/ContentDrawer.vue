<script setup lang="ts">
import { ref } from 'vue'
import ExamGuideDialog from './ExamGuideDialog.vue'
import NoticeDialog from './NoticeDialog.vue'

const drawerExpanded = ref(true)
const examGuideVisible = ref(false)
const noticeVisible = ref(false)
</script>

<template>
  <div
    :class="[
      'shrink-0 transition-all duration-300 relative',
      drawerExpanded ? 'w-56' : 'w-3 cursor-pointer'
    ]"
    @click="!drawerExpanded && (drawerExpanded = true)"
  >
    <div v-if="drawerExpanded" class="sticky top-24 space-y-3">
      <button
        class="w-full rounded-2xl bg-white p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all text-left group"
        @click="examGuideVisible = true"
      >
        <div class="text-2xl mb-1">📚</div>
        <div class="font-bold text-gray-800 group-hover:text-orange-500 transition-colors">备考指南</div>
        <div class="text-xs text-gray-400 mt-0.5">备考文章·经验·技巧</div>
      </button>

      <button
        class="w-full rounded-2xl bg-white p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all text-left group"
        @click="noticeVisible = true"
      >
        <div class="text-2xl mb-1">📢</div>
        <div class="font-bold text-gray-800 group-hover:text-orange-500 transition-colors">公告</div>
        <div class="text-xs text-gray-400 mt-0.5">招考·招聘·通知</div>
      </button>

      <button
        class="w-full text-center text-xs text-gray-400 hover:text-orange-500 transition-colors py-1"
        @click.stop="drawerExpanded = false"
      >
        ◀ 收起
      </button>
    </div>

    <div
      v-else
      class="sticky top-24 flex items-center justify-center h-32 w-3 bg-white/80 rounded-r-lg shadow-sm border border-gray-200 text-gray-400 hover:text-orange-500 transition-colors text-xs"
      title="展开"
    >
      ▶
    </div>

    <ExamGuideDialog v-model:visible="examGuideVisible" />
    <NoticeDialog v-model:visible="noticeVisible" />
  </div>
</template>
