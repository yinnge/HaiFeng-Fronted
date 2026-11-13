<script setup lang="ts">
/**
 * 详情页在线工具：与列表页「一致」（需求 Q3）。
 * 配置从 detail/utils.ts 的 re-export 引入，源头仍是列表页 components/utils.ts 的
 * INDUSTRY_TOOLS —— 全站只维护一份；交互（coming / expert / RouterLink）与列表页同款。
 */
import { ElMessage } from 'element-plus'
import { RouterLink } from 'vue-router'
import { ChevronRight } from 'lucide-vue-next'
import { useExpertContact } from '@/composables/useExpertContact'
import { INDUSTRY_TOOLS, TONE_COLORS, type IndustryTool } from '../utils'

const expertContact = useExpertContact()
const blue = TONE_COLORS.blue

function onToolClick(tool: IndustryTool) {
  if (tool.to) return
  if (tool.action === 'expert') {
    expertContact.open()
    return
  }
  ElMessage.info({ message: '敬请期待', grouping: true })
}
</script>

<template>
  <section class="hf-card idt-aside-card">
    <h2 class="hf-section-title">在线工具</h2>
    <nav class="idt-tools" aria-label="在线工具快捷入口">
      <component
        :is="tool.to ? RouterLink : 'button'"
        v-for="tool in INDUSTRY_TOOLS"
        :key="tool.key"
        v-bind="tool.to ? { to: tool.to } : { type: 'button' }"
        class="idt-tool-row"
        @click="onToolClick(tool)"
      >
        <span
          class="idt-tool-row__icon"
          :style="{ backgroundColor: TONE_COLORS[tool.tone].bg, color: TONE_COLORS[tool.tone].fg }"
        >
          <component :is="tool.icon" :size="18" :stroke-width="1.75" />
        </span>
        <span class="idt-tool-row__label">{{ tool.label }}</span>
        <span
          v-if="tool.soon"
          class="hf-tag idt-tool-row__soon"
          :style="{ color: blue.fg, backgroundColor: blue.bg, '--tag-ring': blue.ring }"
        >即将上线</span>
        <ChevronRight :size="16" :stroke-width="1.75" class="idt-tool-row__arrow" />
      </component>
    </nav>
  </section>
</template>
