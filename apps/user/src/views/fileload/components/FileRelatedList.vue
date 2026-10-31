<script setup lang="ts">
import { computed } from 'vue'
import type { FileLoadListVO } from '@/types/fileload'
import FileCard from './FileCard.vue'

const props = withDefaults(
  defineProps<{
    items: FileLoadListVO[]
    /** related=相关推荐（OSS 详情页） / rank=排行榜（网盘详情页） */
    variant?: 'related' | 'rank'
    loading?: boolean
  }>(),
  { variant: 'related', loading: false },
)

const emit = defineEmits<{ (e: 'open', item: FileLoadListVO): void }>()

const title = computed(() => (props.variant === 'rank' ? '排行榜' : '相关推荐'))
</script>

<template>
  <section class="rl-panel">
    <header class="rl-head">
      <span class="rl-head-icon" :class="variant === 'rank' ? 'is-rank' : 'is-related'" aria-hidden="true">
        <!-- 排行榜：柱状趋势 -->
        <svg v-if="variant === 'rank'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        </svg>
        <!-- 相关推荐：火焰 -->
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2s4 4.2 4 8a4 4 0 0 1-8 0c0-1.2.4-2.3 1-3.2" />
          <path d="M12 22a6 6 0 0 0 6-6c0-2.2-1.2-4.2-2.6-5.6" />
          <path d="M12 22a6 6 0 0 1-6-6c0-1.6.6-3 1.6-4.2" />
        </svg>
      </span>
      <h2 class="rl-title">{{ title }}</h2>
    </header>

    <div v-if="loading" class="rl-skeleton">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="items.length" class="rl-list">
      <FileCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        view="list"
        @open="emit('open', item)"
      />
    </div>

    <p v-else class="rl-empty">暂无{{ title }}文件</p>
  </section>
</template>

<style scoped>
.rl-panel {
  padding: 16px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 20px -2px rgba(15, 23, 42, 0.04);
}

.rl-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.rl-head-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 9px;
  color: #ffffff;
}

.rl-head-icon svg {
  width: 15px;
  height: 15px;
}

.rl-head-icon.is-related {
  background: linear-gradient(135deg, #fb7185, #e11d48);
  box-shadow: 0 2px 8px -2px rgba(225, 29, 72, 0.45);
}

.rl-head-icon.is-rank {
  background: linear-gradient(135deg, #fbbf24, #d97706);
  box-shadow: 0 2px 8px -2px rgba(217, 119, 6, 0.45);
}

.rl-title {
  color: #0f172a;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.rl-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rl-skeleton {
  padding: 4px 2px;
}

.rl-empty {
  padding: 18px 0;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}
</style>
