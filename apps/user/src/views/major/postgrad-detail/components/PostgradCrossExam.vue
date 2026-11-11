<script setup lang="ts">
import { computed } from 'vue'
import type { PostgradMajorDetailVO } from '@/types/postgrad-major'
import {
  getDifficultyStyle,
  normalizeSubjects,
  TONE_COLORS,
} from '../../postgrad/components/utils'

const props = defineProps<{ detail: PostgradMajorDetailVO }>()

const difficulty = computed(() => getDifficultyStyle(props.detail.crossExamDifficulty))
const description = computed(() => props.detail.crossExamDescription?.trim() || '')
const factors = computed(() => normalizeSubjects(props.detail.crossExamFactors))
/** 模块级空数据整块隐藏，不留空壳卡 */
const hasContent = computed(
  () =>
    Boolean(props.detail.crossExamDifficulty?.trim()) ||
    Boolean(description.value) ||
    factors.value.length > 0,
)
const slate = TONE_COLORS.slate
</script>

<template>
  <section v-if="hasContent" class="hf-card pgd-card">
    <h2 class="hf-section-title">跨考信息</h2>
    <div class="pgd-card__body">
      <div class="pgd-cross-row">
        <span class="pgd-cross-label">跨考难度</span>
        <span v-if="difficulty" class="pgd-difficulty">
          <span
            v-for="n in 3"
            :key="n"
            class="pgd-difficulty__bar"
            :style="{ backgroundColor: n <= difficulty.level ? difficulty.color : '#e2e8f0' }"
          />
          <span class="pgd-difficulty__text" :style="{ color: difficulty.textColor }">{{ difficulty.label }}</span>
        </span>
        <span
          v-else
          class="hf-tag"
          :style="{ color: slate.fg, backgroundColor: slate.bg, '--tag-ring': slate.ring }"
        >{{ detail.crossExamDifficulty || '—' }}</span>
      </div>

      <p v-if="description" class="pgd-cross-desc">{{ description }}</p>

      <div v-if="factors.length" class="pgd-cross-block">
        <span class="pgd-cross-block-label">影响因素</span>
        <div class="pgd-chip-row">
          <span v-for="(factor, index) in factors" :key="`${factor}-${index}`" class="pgd-chip">{{ factor }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
