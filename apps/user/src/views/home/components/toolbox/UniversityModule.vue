<script setup lang="ts">
import { ref } from 'vue'
import type { UniversityListVO } from '@/types/university'
import ToolboxSkeleton from './ToolboxSkeleton.vue'

defineProps<{
  items: UniversityListVO[]
  loading: boolean
  error: boolean
}>()

defineEmits<{
  (e: 'retry'): void
}>()

const failedLogos = ref<string[]>([])

function onLogoError(id: string) {
  if (!failedLogos.value.includes(id)) {
    failedLogos.value.push(id)
  }
}

function locationText(item: UniversityListVO) {
  return [item.provinceName, item.cityName].filter(Boolean).join('·') || '—'
}

function majorCountText(item: UniversityListVO) {
  return item.majorCount ? `${item.majorCount} 个专业` : '专业整理中'
}
</script>

<template>
  <section id="toolbox-university" class="tbx-panel">
    <header class="tbx-head">
      <span class="tbx-num">01</span>
      <div class="tbx-head-main">
        <div class="tbx-title-row">
          <h3 class="tbx-title">院校库</h3>
        </div>
        <p class="tbx-desc">覆盖全国高校信息、历年录取与培养画像，211、985 一网打尽</p>
      </div>
      <div class="tbx-head-actions">
        <router-link to="/university" class="tbx-link">
          查看全部院校
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </router-link>
      </div>
    </header>

    <ToolboxSkeleton v-if="loading && !items.length" variant="university" :count="4" />

    <div v-else-if="items.length" class="tbx-grid tbx-grid--uni">
      <router-link v-for="item in items" :key="item.id" :to="`/university/${item.id}`" class="tbx-card tbx-card--uni">
        <div class="tbx-uni-top">
          <div class="tbx-uni-logo">
            <img
              v-if="item.imageUrl && !failedLogos.includes(item.id)"
              :src="item.imageUrl"
              :alt="item.name"
              @error="onLogoError(item.id)"
            />
            <span v-else>{{ item.name.charAt(0) }}</span>
          </div>
          <div class="tbx-uni-body">
            <div class="tbx-uni-head">
              <h4 class="tbx-card-title">{{ item.name }}</h4>
              <span v-if="item.nature" class="tbx-pill tbx-pill--type tbx-pill--round">{{ item.nature }}</span>
            </div>
            <div v-if="item.tags?.length" class="tbx-tags">
              <span v-for="tag in item.tags" :key="tag" class="tbx-pill tbx-pill--tag">{{ tag }}</span>
            </div>
            <div class="tbx-info">
              <span>{{ locationText(item) }}</span>
              <span>{{ item.category || '—' }}</span>
              <span>{{ item.educationLevel || '—' }}</span>
              <span>{{ majorCountText(item) }}</span>
            </div>
          </div>
        </div>
      </router-link>
    </div>

    <div v-else class="tbx-empty">
      <p>暂无院校数据</p>
      <button v-if="error" type="button" class="tbx-retry" @click="$emit('retry')">重新加载</button>
    </div>
  </section>
</template>
