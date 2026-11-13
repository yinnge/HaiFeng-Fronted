<script setup lang="ts">
import { Flame } from 'lucide-vue-next'
import type { IndustryListVO } from '@/types/industry'
import { HOT_INDEX_BY_RANK, formatHotIndex } from './utils'

defineProps<{
  items: IndustryListVO[]
  loading: boolean
}>()

const emit = defineEmits<{ (e: 'open', id: string): void }>()

/** 序号徽标：1 红 / 2 琥珀 / 3 蓝 / 4、5 slate */
const RANK_COLORS = [
  { bg: '#FFF1F2', fg: '#E11D48' },
  { bg: '#FFFBEB', fg: '#B45309' },
  { bg: '#EFF6FF', fg: '#2563EB' },
  { bg: '#F1F5F9', fg: '#475569' },
  { bg: '#F1F5F9', fg: '#475569' },
]
</script>

<template>
  <!-- 失败或返回空时整卡静默隐藏，不留空阴影卡 -->
  <section v-if="loading || items.length" class="hot-rank hf-card">
    <h2 class="hf-section-title">热门行业</h2>
    <p class="hot-rank__subtitle">近期关注度最高的行业方向</p>

    <div v-if="loading" class="hot-rank__list">
      <span v-for="n in 5" :key="n" class="hf-skeleton hot-rank__skeleton" />
    </div>

    <nav v-else class="hot-rank__list" aria-label="热门行业">
      <!-- 行用 button，由父层 @open 推 /industry/:id；不嵌套链接 -->
      <button
        v-for="(item, index) in items"
        :key="item.id"
        type="button"
        class="hot-rank__row"
        :aria-label="`查看 ${item.industryName} 详情`"
        @click="emit('open', String(item.id))"
      >
        <span
          class="hot-rank__badge"
          :style="{ backgroundColor: RANK_COLORS[index]?.bg, color: RANK_COLORS[index]?.fg }"
        >{{ index + 1 }}</span>
        <span class="hot-rank__name" :title="item.industryName">{{ item.industryName }}</span>
        <span class="hot-rank__index">
          <Flame :size="14" :stroke-width="1.75" />
          <span class="hf-mono">{{ formatHotIndex(HOT_INDEX_BY_RANK[index]) }}</span>
        </span>
      </button>
    </nav>
  </section>
</template>

<style scoped>
.hot-rank {
  padding: 20px;
}
.hot-rank__subtitle {
  margin: 6px 0 0 13px;
  font-size: 13px;
  line-height: 1.4;
  color: #64748b;
}
.hot-rank__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 14px;
}
.hot-rank__skeleton {
  height: 38px;
}
.hot-rank__row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.hot-rank__row:hover {
  background: #f8fafc;
}
.hot-rank__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex: none;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}
.hot-rank__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: #1e293b;
}
.hot-rank__index {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: none;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: #475569;
}
.hot-rank__index svg {
  color: #e11d48;
}
</style>
