<script setup lang="ts">
import { RotateCcw, Search } from 'lucide-vue-next'

defineProps<{
  total: number
  levelOptions: string[]
  /** 是否处于「只看收藏」模式 */
  favOnly?: boolean
}>()

const emit = defineEmits<{
  (e: 'search'): void
  (e: 'reset'): void
  (e: 'filter-change'): void
  (e: 'toggle-fav'): void
}>()

/** 竞赛名称是本地输入态：只有回车或点搜索才提交到查询 */
const compName = defineModel<string>('compName', { default: '' })
const compLevel = defineModel<string>('compLevel', { default: '' })
</script>

<template>
  <section class="search-card hf-card">
    <div class="search-card__head">
      <h2 class="hf-section-title">
        <Search :size="16" :stroke-width="1.75" class="search-card__head-icon" />
        竞赛检索
      </h2>
      <div class="search-card__head-right">
        <span class="search-card__count">
          共 <strong>{{ total }}</strong> 个竞赛
        </span>
        <!-- 查看收藏 toggle：开启后仅查已收藏竞赛，与检索条件 AND 叠加 -->
        <button
          type="button"
          class="cp-fav-toggle"
          :class="{ 'is-on': favOnly }"
          :aria-pressed="favOnly"
          @click="emit('toggle-fav')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
          </svg>
          {{ favOnly ? '收藏中' : '查看收藏' }}
        </button>
      </div>
    </div>

    <div class="search-card__row">
      <el-input
        v-model="compName"
        class="cp-input search-card__name"
        placeholder="输入竞赛名称搜索"
        :maxlength="100"
        clearable
        @keyup.enter="emit('search')"
      >
        <template #prefix><Search :size="16" :stroke-width="1.75" /></template>
      </el-input>

      <el-select
        v-model="compLevel"
        class="cp-select search-card__select"
        placeholder="竞赛级别"
        clearable
        filterable
        popper-class="competition-select-popper"
        @change="emit('filter-change')"
      >
        <el-option v-for="item in levelOptions" :key="item" :label="item" :value="item" />
      </el-select>

      <button type="button" class="search-card__btn search-card__btn--primary" @click="emit('search')">
        <Search :size="16" :stroke-width="1.75" />
        搜索
      </button>
      <button type="button" class="search-card__btn search-card__btn--ghost" @click="emit('reset')">
        <RotateCcw :size="16" :stroke-width="1.75" />
        重置
      </button>
    </div>
  </section>
</template>

<style scoped>
.search-card {
  padding: 20px;
}
.search-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}
.search-card__head-icon {
  color: #64748b;
}
.search-card__count {
  font-size: 13px;
  line-height: 1.4;
  color: #64748b;
}
.search-card__count strong {
  font-weight: 600;
  color: #0f172a;
}
.search-card__head-right {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* ===== 查看收藏 toggle：黄色实底；开启后加深 + 内凹按下态 ===== */
.cp-fav-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 30px;
  padding: 0 12px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: 999px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  box-shadow: 0 2px 6px -1px rgba(245, 158, 11, 0.35);
  cursor: pointer;
  transition: all 0.2s ease;
}
.cp-fav-toggle svg {
  width: 14px;
  height: 14px;
}
.cp-fav-toggle:hover {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 4px 10px -2px rgba(245, 158, 11, 0.45);
}
.cp-fav-toggle:active {
  transform: translateY(1px);
}
.cp-fav-toggle:focus-visible {
  outline: 2px solid rgba(245, 158, 11, 0.5);
  outline-offset: 2px;
}
.cp-fav-toggle.is-on {
  border-color: rgba(180, 83, 9, 0.4);
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow:
    inset 0 2px 4px rgba(120, 53, 15, 0.25),
    0 1px 3px rgba(245, 158, 11, 0.3);
}
.cp-fav-toggle.is-on svg {
  fill: currentColor;
}

.search-card__row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.search-card__name {
  flex: 1;
  min-width: 0;
}
.search-card__select {
  width: 180px;
  flex: none;
}
.search-card__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  flex: none;
  padding: 0 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease,
    transform 0.2s ease;
}
/* 本页唯一的橙色实心主按钮 */
.search-card__btn--primary {
  border: 0;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.18);
}
.search-card__btn--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(249, 115, 22, 0.24);
}
.search-card__btn--primary:active {
  transform: none;
}
.search-card__btn--ghost {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #334155;
}
.search-card__btn--ghost:hover {
  color: #c2410c;
  border-color: rgba(249, 115, 22, 0.3);
}
@media (max-width: 767px) {
  .search-card__row {
    flex-wrap: wrap;
  }
  .search-card__name,
  .search-card__select {
    width: 100%;
    flex: 1 1 100%;
  }
  .search-card__btn {
    flex: 1 1 calc(50% - 6px);
  }
}
</style>
