<script setup lang="ts">
import { ref } from 'vue'
import logoMain from '@/assets/images/logo-main.png'
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
      drawerExpanded ? 'w-80' : 'w-12'
    ]"
    @click="!drawerExpanded && (drawerExpanded = true)"
  >
    <div v-if="drawerExpanded" class="sticky top-24 flex flex-col gap-3 items-center min-h-[calc(100vh-6rem)] justify-center">
      <button
        class="group relative flex h-44 w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-b from-orange-50/70 to-white p-5 text-left shadow-lg border-t-[3px] border-t-[#F97316] border-b-[3px] border-b-[#FB923C] hover:-translate-y-0.5 hover:shadow-xl transition-all"
        @click="examGuideVisible = true"
      >
        <div class="text-3xl">📚</div>
        <div class="text-center">
          <div class="text-lg font-bold text-gray-800 transition-colors group-hover:text-orange-500">备考指南</div>
          <div class="mt-1 text-xs text-gray-400">备考文章 · 经验 · 技巧</div>
        </div>
        <img :src="logoMain" alt="" class="pointer-events-none absolute -bottom-6 -right-6 w-24 opacity-[0.05]" />
        <div class="pointer-events-none absolute inset-x-0 bottom-0 h-12 rounded-b-2xl bg-gradient-to-t from-orange-100/60 to-transparent"></div>
      </button>

      <button
        class="group relative flex h-44 w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-b from-orange-50/70 to-white p-5 text-left shadow-lg border-t-[3px] border-t-[#F97316] border-b-[3px] border-b-[#FB923C] hover:-translate-y-0.5 hover:shadow-xl transition-all"
        @click="noticeVisible = true"
      >
        <div class="text-3xl">📢</div>
        <div class="text-center">
          <div class="text-lg font-bold text-gray-800 transition-colors group-hover:text-orange-500">公告</div>
          <div class="mt-1 text-xs text-gray-400">招考 · 招聘 · 通知</div>
        </div>
        <img :src="logoMain" alt="" class="pointer-events-none absolute -bottom-6 -right-6 w-24 opacity-[0.05]" />
        <div class="pointer-events-none absolute inset-x-0 bottom-0 h-12 rounded-b-2xl bg-gradient-to-t from-orange-100/60 to-transparent"></div>
      </button>

      <button
        class="shrink-0 w-full py-1 text-center text-xs text-gray-400 transition-colors hover:text-orange-500"
        @click.stop="drawerExpanded = false"
      >
        ◀ 收起
      </button>
    </div>

    <div
      v-else
      class="sticky top-24 flex flex-col items-center gap-2 rounded-l-xl border border-r-0 border-gray-200 bg-white/90 py-3 shadow-md min-h-[calc(100vh-6rem)] justify-center"
    >
      <button
        class="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-400 transition-all hover:bg-orange-50 hover:text-orange-500"
        title="备考指南"
        @click.stop="examGuideVisible = true"
      >
        📚
      </button>
      <button
        class="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-400 transition-all hover:bg-orange-50 hover:text-orange-500"
        title="公告"
        @click.stop="noticeVisible = true"
      >
        📢
      </button>
      <div class="w-6 border-t border-gray-200"></div>
      <button
        class="flex h-9 w-9 items-center justify-center rounded-lg text-xs text-gray-400 transition-all hover:bg-orange-50 hover:text-orange-500"
        title="展开"
        @click.stop="drawerExpanded = true"
      >
        ◀
      </button>
    </div>

    <ExamGuideDialog v-model:visible="examGuideVisible" />
    <NoticeDialog v-model:visible="noticeVisible" />
  </div>
</template>
