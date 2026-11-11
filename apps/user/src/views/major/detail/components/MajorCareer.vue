<script setup lang="ts">
import { ref } from 'vue'
import { Briefcase, ChevronDown } from 'lucide-vue-next'
import { PLACEHOLDER_TEXT, TONE_COLORS, isBlankText, useClampExpand } from './utils'

const props = defineProps<{ text?: string | null }>()
const bodyRef = ref<HTMLElement | null>(null)
const { expanded, overflowing, toggle } = useClampExpand(bodyRef, () => props.text)
const amber = TONE_COLORS.amber
</script>

<template>
  <section class="career hf-card">
    <h2 class="hf-section-title">
      <span class="hf-title-icon" :style="{ backgroundColor: amber.bg, color: amber.fg }">
        <Briefcase :size="16" :stroke-width="1.75" />
      </span>
      就业方向
    </h2>

    <p v-if="isBlankText(text)" class="hf-placeholder">{{ PLACEHOLDER_TEXT }}</p>
    <template v-else>
      <!-- 沿用旧页纯文本 + pre-line 渲染，不改成 Markdown / v-html -->
      <p
        ref="bodyRef"
        class="career__body"
        :class="{ 'is-expanded': expanded }"
      >{{ text }}</p>
      <button
        v-if="overflowing"
        type="button"
        class="hf-more"
        @click="toggle"
      >
        {{ expanded ? '收起' : '查看更多' }}
        <ChevronDown :size="14" :stroke-width="2" class="hf-chevron" :class="{ 'is-open': expanded }" />
      </button>
    </template>
  </section>
</template>

<style scoped>
.career {
  padding: 20px;
}
.career__body {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: #475569;
  white-space: pre-line;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  overflow: hidden;
}
.career__body.is-expanded {
  display: block;
  overflow: visible;
  -webkit-line-clamp: unset;
}
</style>
