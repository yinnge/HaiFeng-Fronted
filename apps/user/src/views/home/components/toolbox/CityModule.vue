<script setup lang="ts">
import type { CityListVO } from '@/types/city'
import ToolboxSkeleton from './ToolboxSkeleton.vue'
import { formatGdp } from './format'

defineProps<{
  items: CityListVO[]
  total: number
  loading: boolean
  error: boolean
}>()

defineEmits<{
  (e: 'retry'): void
}>()

function subline(item: CityListVO) {
  return [item.province, item.region].filter(Boolean).join(' · ') || '—'
}
</script>

<template>
  <section id="toolbox-city" class="tbx-panel">
    <header class="tbx-head">
      <span class="tbx-num">03</span>
      <div class="tbx-head-main">
        <div class="tbx-title-row">
          <h3 class="tbx-title">城市库</h3>
        </div>
        <p class="tbx-desc">城市发展、高校资源与地区分布速览，帮你圈定目标城市</p>
      </div>
      <div class="tbx-head-actions">
        <span v-if="total" class="tbx-count">共收录 {{ total }} 座城市</span>
        <router-link to="/city" class="tbx-link">
          查看全部城市
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </router-link>
      </div>
    </header>

    <ToolboxSkeleton v-if="loading && !items.length" variant="city" :count="4" />

    <div v-else-if="items.length" class="tbx-grid tbx-grid--city">
      <router-link v-for="item in items" :key="item.id" :to="`/city/${item.id}`" class="tbx-card">
        <div class="tbx-card-top">
          <div class="tbx-card-main">
            <h4 class="tbx-card-title">{{ item.cityName }}</h4>
            <p class="tbx-subline">{{ subline(item) }}</p>
          </div>
          <span class="tbx-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </span>
        </div>
        <div class="tbx-meta">
          <span>GDP</span>
          <strong>{{ formatGdp(item.gdp) }}</strong>
        </div>
        <div class="tbx-meta">
          <span>高校 <strong>{{ item.collegeCount ?? 0 }}</strong></span>
          <span>重点 <strong>{{ item.keyCollegeCount ?? 0 }}</strong></span>
        </div>
      </router-link>
    </div>

    <div v-else class="tbx-empty">
      <p>暂无城市数据</p>
      <button v-if="error" type="button" class="tbx-retry" @click="$emit('retry')">重新加载</button>
    </div>
  </section>
</template>
