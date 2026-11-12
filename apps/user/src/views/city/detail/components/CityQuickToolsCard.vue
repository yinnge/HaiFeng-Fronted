<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { RouterLink } from 'vue-router'
import { ChevronRight } from 'lucide-vue-next'
import { CITY_QUICK_TOOLS, CITY_TONES, type CityQuickTool } from '../utils'

/**
 * Q1 选 ①：4 项配置复制自 views/city/List.vue:223-228，List.vue 零改动。
 * Q3：3 项用 RouterLink，AI 项用 button + ElMessage.info(grouping) 连点不刷屏；
 *     四色分流去掉列表页第 4 项的紫色；不做整卡位移，只有箭头右移。
 */
function onToolClick(tool: CityQuickTool) {
  if (tool.to) return
  ElMessage.info({ message: '敬请期待', grouping: true })
}
</script>

<template>
  <section class="city-tools hf-card">
    <h2 class="hf-section-title">快捷工具</h2>

    <nav class="city-tools__list" aria-label="快捷工具">
      <component
        :is="tool.to ? RouterLink : 'button'"
        v-for="tool in CITY_QUICK_TOOLS"
        :key="tool.key"
        v-bind="tool.to ? { to: tool.to } : { type: 'button' }"
        class="city-tools__row"
        @click="onToolClick(tool)"
      >
        <span
          class="city-tools__icon"
          :style="{ backgroundColor: CITY_TONES[tool.tone].bg, color: CITY_TONES[tool.tone].fg }"
        >
          <component :is="tool.icon" :size="18" :stroke-width="1.75" />
        </span>
        <span class="city-tools__label">{{ tool.label }}</span>
        <ChevronRight :size="16" :stroke-width="1.75" class="city-tools__arrow" />
      </component>
    </nav>
  </section>
</template>

<style scoped>
.city-tools__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 14px;
}
.city-tools__row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.city-tools__row:hover {
  background: #f8fafc;
}
.city-tools__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex: none;
  border-radius: 10px;
}
.city-tools__label {
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
.city-tools__arrow {
  flex: none;
  color: #64748b;
  transition: transform 0.2s ease, color 0.2s ease;
}
.city-tools__row:hover .city-tools__arrow {
  transform: translateX(2px);
  color: #c2410c;
}
</style>
