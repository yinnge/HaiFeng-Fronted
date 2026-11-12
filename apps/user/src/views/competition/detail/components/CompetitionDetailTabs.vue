<script setup lang="ts">
import { COMPETITION_TABS, type CompetitionTabKey } from '../utils'

defineProps<{
  modelValue: CompetitionTabKey
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: CompetitionTabKey): void
}>()
</script>

<template>
  <nav class="cd-tabs" aria-label="竞赛详情内容分区">
    <button
      v-for="tab in COMPETITION_TABS"
      :key="tab.key"
      type="button"
      class="cd-tab"
      :class="{ 'is-active': tab.key === modelValue }"
      :aria-current="tab.key === modelValue ? 'page' : undefined"
      @click="emit('update:modelValue', tab.key)"
    >
      <component :is="tab.icon" :size="15" :stroke-width="1.75" />
      {{ tab.label }}
    </button>
  </nav>
</template>
