<script setup lang="ts">
/**
 * 同门类出口（需求 Q13）：零额外请求，复用 Q9 补取到的 category。
 * ⚠️ 后端 category 是 eq 精准匹配，URL 值必须原样写回，不能只传首字母。
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, Layers } from 'lucide-vue-next'
import { categoryName, categoryRoute } from '../utils'

const props = defineProps<{ category?: string }>()

const name = computed(() => categoryName(props.category))
const to = computed(() => categoryRoute(props.category ?? ''))
</script>

<template>
  <RouterLink v-if="name" class="idt-same" :to="to">
    <span class="idt-same__icon"><Layers :size="18" :stroke-width="1.75" /></span>
    <span class="idt-same__text">
      <span class="idt-same__title">查看「{{ name }}」的其他行业</span>
      <span class="idt-same__hint">返回行业列表，按同一门类筛选浏览</span>
    </span>
    <ArrowRight :size="18" :stroke-width="1.75" class="idt-same__arrow" />
  </RouterLink>
</template>
