<script setup lang="ts">
import { computed } from 'vue'
import { articleModuleMeta } from '@/utils/articleModule'

const props = defineProps<{ moduleName?: string | null }>()

const meta = computed(() => articleModuleMeta(props.moduleName))
</script>

<template>
  <span class="article-tag" :style="{ color: meta.color, background: meta.bg }" :title="meta.text">
    {{ meta.text }}
  </span>
</template>

<style scoped>
.article-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  max-width: 5rem;
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
