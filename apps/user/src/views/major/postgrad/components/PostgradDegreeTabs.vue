<script setup lang="ts">
import { DEGREE_TABS } from './utils'

const value = defineModel<string>({ default: '' })
</script>

<template>
  <div class="degree-tabs" role="tablist" aria-label="学位类型">
    <button
      v-for="tab in DEGREE_TABS"
      :key="tab.value"
      type="button"
      role="tab"
      class="degree-tabs__item"
      :class="{ 'is-active': value === tab.value }"
      :aria-selected="value === tab.value"
      @click="value = tab.value"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.degree-tabs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.degree-tabs__item {
  height: 40px;
  padding: 0 20px;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  background: #ffffff;
  color: #334155;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease,
    box-shadow 0.2s ease;
}
.degree-tabs__item:hover {
  color: #c2410c;
  border-color: rgba(249, 115, 22, 0.3);
}
.degree-tabs__item.is-active {
  background: #fff7ed;
  border-color: transparent;
  color: #c2410c;
  font-weight: 600;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.2);
}
@media (max-width: 767px) {
  .degree-tabs__item {
    flex: 1;
    padding: 0 10px;
    font-size: 13px;
  }
}
</style>
