<script setup lang="ts">
import { computed } from 'vue'
import { normalizeSubjects } from '../../postgrad/components/utils'
import { PLACEHOLDER_TEXT } from '../../detail/components/utils'

const props = defineProps<{ items?: string[] | null }>()

/** Q6：admissionRequirements 同为扁平数组，不按关键词猜「学历/专业/其他」分组 */
const requirements = computed(() => normalizeSubjects(props.items))
</script>

<template>
  <section class="hf-card pgd-card">
    <h2 class="hf-section-title">报考要求</h2>
    <div class="pgd-card__body">
      <ul v-if="requirements.length" class="pgd-req-list">
        <li v-for="(item, index) in requirements" :key="`${item}-${index}`" class="pgd-req-item">
          <span class="pgd-req-dot" aria-hidden="true" />
          <span>{{ item }}</span>
        </li>
      </ul>
      <p v-else class="pgd-placeholder">{{ PLACEHOLDER_TEXT }}</p>
    </div>
  </section>
</template>
