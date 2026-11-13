<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { RouterLink } from 'vue-router'
import { ChevronRight } from 'lucide-vue-next'
import { useExpertContact } from '@/composables/useExpertContact'
import { INDUSTRY_TOOLS, TONE_COLORS, type IndustryTool } from './utils'

const expertContact = useExpertContact()
const blue = TONE_COLORS.blue

/**
 * coming 项统一 ElMessage.info('敬请期待', grouping:true)（连点不刷屏）；
 * 「专家一对一指导」复用 useExpertContact.open()（未登录 → 引导登录；非 VIP → 引导开通）。
 */
function onToolClick(tool: IndustryTool) {
  if (tool.to) return
  if (tool.action === 'expert') {
    expertContact.open()
    return
  }
  // TODO: 后续功能上线后替换为目标路由
  ElMessage.info({ message: '敬请期待', grouping: true })
}
</script>

<template>
  <section class="tools hf-card">
    <h2 class="hf-section-title">在线工具</h2>
    <nav class="tools__list" aria-label="在线工具快捷入口">
      <component
        :is="tool.to ? RouterLink : 'button'"
        v-for="tool in INDUSTRY_TOOLS"
        :key="tool.key"
        v-bind="tool.to ? { to: tool.to } : { type: 'button' }"
        class="tool-row"
        @click="onToolClick(tool)"
      >
        <span
          class="tool-row__icon"
          :style="{ backgroundColor: TONE_COLORS[tool.tone].bg, color: TONE_COLORS[tool.tone].fg }"
        >
          <component :is="tool.icon" :size="18" :stroke-width="1.75" />
        </span>
        <span class="tool-row__label">{{ tool.label }}</span>
        <span
          v-if="tool.soon"
          class="hf-tag tool-row__soon"
          :style="{ color: blue.fg, backgroundColor: blue.bg, '--tag-ring': blue.ring }"
        >即将上线</span>
        <ChevronRight :size="16" :stroke-width="1.75" class="tool-row__arrow" />
      </component>
    </nav>
  </section>
</template>

<style scoped>
.tools {
  padding: 20px;
}
.tools__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 14px;
}
.tool-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 8px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.tool-row:hover {
  background: #f8fafc;
}
.tool-row__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex: none;
  border-radius: 10px;
}
.tool-row__label {
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
.tool-row__soon {
  flex: none;
}
.tool-row__arrow {
  flex: none;
  color: #334155;
  transition: transform 0.2s ease, color 0.2s ease;
}
.tool-row:hover .tool-row__arrow {
  transform: translateX(2px);
  color: #ea580c;
}
</style>
