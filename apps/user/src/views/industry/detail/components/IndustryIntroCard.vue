<script setup lang="ts">
/**
 * 行业简介：优先取列表 VO 的 description（需求 Q9 补取），
 * 其次 detailedDescription / shortDescription；三者全空时整卡不渲染（需求 Q1 容错）。
 */
import { computed } from 'vue'
import { FileText } from 'lucide-vue-next'
import { readText } from '../utils'

const props = defineProps<{
  intro?: string
  detailed?: string
  short?: string
}>()

const text = computed(
  () => readText(props.intro) || readText(props.detailed) || readText(props.short),
)
</script>

<template>
  <section v-if="text" class="hf-card idt-block">
    <h2 class="hf-section-title">
      行业简介
      <FileText :size="16" :stroke-width="1.75" class="idt-block__icon" />
    </h2>
    <p class="idt-intro__text">{{ text }}</p>
  </section>
</template>
