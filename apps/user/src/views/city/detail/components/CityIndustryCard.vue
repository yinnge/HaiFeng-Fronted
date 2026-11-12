<script setup lang="ts">
import { computed } from 'vue'
import type { CityDetailVO } from '@/types/city'
import { PLACEHOLDER_TEXT, normalizeList } from '../utils'

const props = defineProps<{ detail: CityDetailVO }>()

const mainIndustries = computed(() => normalizeList(props.detail.mainIndustries))
const emergingIndustries = computed(() => normalizeList(props.detail.emergingIndustries))
const description = computed(() => props.detail.industryDescription?.trim() || '')
</script>

<template>
  <section class="city-industry hf-card">
    <h2 class="hf-section-title">产业发展</h2>

    <div class="city-industry__group">
      <h3 class="city-industry__sub">主导产业</h3>
      <div v-if="mainIndustries.length" class="city-industry__tags">
        <span v-for="item in mainIndustries" :key="item" class="ct-chip">{{ item }}</span>
      </div>
      <p v-else class="ct-placeholder">{{ PLACEHOLDER_TEXT }}</p>
    </div>

    <div class="city-industry__group">
      <h3 class="city-industry__sub">新兴产业</h3>
      <div v-if="emergingIndustries.length" class="city-industry__tags">
        <span v-for="item in emergingIndustries" :key="item" class="ct-chip">{{ item }}</span>
      </div>
      <p v-else class="ct-placeholder">{{ PLACEHOLDER_TEXT }}</p>
    </div>

    <div v-if="description" class="city-industry__desc">
      <p class="city-industry__text">{{ description }}</p>
    </div>
  </section>
</template>

<style scoped>
.city-industry__group {
  margin-top: 16px;
}
.city-industry__sub {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  color: #475569;
}
.city-industry__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.city-industry__desc {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}
.city-industry__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: #475569;
  white-space: pre-line;
}
</style>
