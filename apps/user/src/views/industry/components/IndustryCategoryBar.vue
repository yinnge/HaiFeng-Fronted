<script setup lang="ts">
import { categoryCode, categoryName } from './utils'

defineProps<{
  /** 全部行业分类（含字母前缀的完整值，如「C 制造业」） */
  categories: string[]
  /** 当前选中分类，空串表示全部 */
  modelValue: string
  /** 各分类的行业数量（可选，用于展示数量徽标） */
  counts?: Record<string, number>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <section class="cats hf-card">
    <h2 class="hf-section-title">行业分类</h2>
    <div class="ind-cats">
      <button
        type="button"
        class="ind-cat"
        :class="{ 'is-active': modelValue === '' }"
        :aria-pressed="modelValue === ''"
        @click="emit('update:modelValue', '')"
      >
        全部行业
      </button>
      <button
        v-for="cat in categories"
        :key="cat"
        type="button"
        class="ind-cat"
        :class="{ 'is-active': modelValue === cat }"
        :aria-pressed="modelValue === cat"
        :title="cat"
        @click="emit('update:modelValue', cat)"
      >
        <span class="ind-cat__code">{{ categoryCode(cat) }}</span>
        {{ categoryName(cat) }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.cats {
  padding: 20px;
}
</style>
