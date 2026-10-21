<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'university' | 'major' | 'city' | 'stack'
    count?: number
  }>(),
  {
    variant: 'major',
    count: 4,
  },
)

const gridClass = computed(() => {
  const map = {
    university: 'tbx-grid--uni',
    major: 'tbx-grid--major',
    city: 'tbx-grid--city',
    stack: 'tbx-stack',
  }
  return map[props.variant]
})
</script>

<template>
  <div class="tbx-grid" :class="gridClass" aria-hidden="true">
    <div v-for="i in count" :key="i" class="tbx-skeleton">
      <div class="tbx-skel-row">
        <span class="tbx-skel-block" />
        <div class="tbx-skel-line" />
      </div>
      <div class="tbx-skel-line tbx-skel-line--mid" />
      <div class="tbx-skel-line tbx-skel-line--short" />
    </div>
  </div>
</template>
