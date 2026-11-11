<script setup lang="ts">
import { computed } from 'vue'
import { PLACEHOLDER_TEXT } from '../../detail/components/utils'

const props = defineProps<{ text?: string | null }>()
/** 沿用弹窗：纯文本插值 + pre-line，不用 v-html / marked（Q6 保持原渲染技术手段） */
const content = computed(() => (props.text && props.text.trim() ? props.text : PLACEHOLDER_TEXT))
</script>

<template>
  <section class="hf-card pgd-card">
    <h2 class="hf-section-title">专业介绍</h2>
    <div class="pgd-card__body">
      <p class="pgd-text">{{ content }}</p>
    </div>
  </section>
</template>
