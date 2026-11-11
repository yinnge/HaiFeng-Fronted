<script setup lang="ts">
import { RotateCcw, Search } from 'lucide-vue-next'
import { DIFFICULTY_OPTIONS, POPULARITY_OPTIONS } from './utils'

defineProps<{
  total: number
  disciplineOptions: string[]
}>()

const emit = defineEmits<{
  (e: 'search'): void
  (e: 'reset'): void
  (e: 'filter-change'): void
}>()

/** 名称 / 代码是本地输入态：只有回车或点搜索才提交到查询 */
const name = defineModel<string>('name', { default: '' })
const code = defineModel<string>('code', { default: '' })
const disciplineCategory = defineModel<string>('disciplineCategory', { default: '' })
const popularity = defineModel<string>('popularity', { default: '' })
const difficulty = defineModel<string>('difficulty', { default: '' })
</script>

<template>
  <section class="search-card hf-card">
    <div class="search-card__head">
      <h2 class="hf-section-title">
        <Search :size="16" :stroke-width="1.75" class="search-card__head-icon" />
        专业检索
      </h2>
      <span class="search-card__count">
        共 <strong>{{ total }}</strong> 个专业
      </span>
    </div>

    <div class="search-card__row">
      <el-input
        v-model="name"
        class="pg-input search-card__name"
        placeholder="输入考研专业名称或关键词"
        :maxlength="100"
        clearable
        @keyup.enter="emit('search')"
      >
        <template #prefix><Search :size="16" :stroke-width="1.75" /></template>
      </el-input>

      <el-input
        v-model="code"
        class="pg-input search-card__code"
        placeholder="专业代码"
        :maxlength="20"
        clearable
        @keyup.enter="emit('search')"
      />

      <button type="button" class="search-card__btn search-card__btn--primary" @click="emit('search')">
        <Search :size="16" :stroke-width="1.75" />
        搜索
      </button>
      <button type="button" class="search-card__btn search-card__btn--ghost" @click="emit('reset')">
        <RotateCcw :size="16" :stroke-width="1.75" />
        重置
      </button>
    </div>

    <div class="search-card__row search-card__row--selects">
      <el-select
        v-model="disciplineCategory"
        class="pg-select search-card__select"
        placeholder="学科门类"
        clearable
        filterable
        popper-class="postgrad-select-popper"
        @change="emit('filter-change')"
      >
        <el-option v-for="item in disciplineOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select
        v-model="popularity"
        class="pg-select search-card__select"
        placeholder="热度"
        clearable
        popper-class="postgrad-select-popper"
        @change="emit('filter-change')"
      >
        <el-option v-for="item in POPULARITY_OPTIONS" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select
        v-model="difficulty"
        class="pg-select search-card__select"
        placeholder="难度"
        clearable
        popper-class="postgrad-select-popper"
        @change="emit('filter-change')"
      >
        <el-option v-for="item in DIFFICULTY_OPTIONS" :key="item" :label="item" :value="item" />
      </el-select>
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
.search-card__row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.search-card__row--selects {
  margin-top: 12px;
}
.search-card__name {
  flex: 1;
  min-width: 0;
}
.search-card__code {
  width: 160px;
  flex: none;
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
  .search-card__code,
  .search-card__select {
    width: 100%;
    flex: 1 1 100%;
  }
  .search-card__btn {
    flex: 1 1 calc(50% - 6px);
  }
}
</style>
