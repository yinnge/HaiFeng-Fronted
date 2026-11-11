<script setup lang="ts">
import { computed } from 'vue'
import { PLACEHOLDER_SUBJECTS, normalizeSubjects } from '../../postgrad/components/utils'

const props = defineProps<{ items?: string[] | null }>()

/**
 * Q6：接口 examSubjects 是扁平 string[]，无「初试/复试/同等学力加试」分组结构，
 * 故不造分组，统一渲染为 6px 圆角标签行。
 */
const subjects = computed(() => normalizeSubjects(props.items))
</script>

<template>
  <section class="hf-card pgd-card">
    <h2 class="hf-section-title">考试科目</h2>
    <div class="pgd-card__body">
      <div v-if="subjects.length" class="pgd-chip-row">
        <span v-for="subject in subjects" :key="subject" class="pgd-chip">{{ subject }}</span>
      </div>
      <p v-else class="pgd-placeholder">{{ PLACEHOLDER_SUBJECTS }}</p>
    </div>
  </section>
</template>
