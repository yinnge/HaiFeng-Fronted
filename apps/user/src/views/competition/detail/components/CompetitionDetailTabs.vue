<script setup lang="ts">
/**
 * 顶部 5 个 Tab：现在只做「同页锚点导航」，不再切换隐藏内容。
 * 点击后由主文件平滑滚动到 sectionId(key) 对应的分区，并在滚动时反向高亮。
 */
import { COMPETITION_TABS, sectionId, type CompetitionTabKey } from '../utils'

defineProps<{
  /** 当前滚动位置对应的分区（scroll spy 反向回填） */
  active: CompetitionTabKey
}>()

const emit = defineEmits<{
  (e: 'select', key: CompetitionTabKey): void
}>()
</script>

<template>
  <nav class="cd-tabs" aria-label="竞赛详情内容分区">
    <button
      v-for="tab in COMPETITION_TABS"
      :key="tab.key"
      type="button"
      class="cd-tab"
      :class="{ 'is-active': tab.key === active }"
      :aria-current="tab.key === active ? 'location' : undefined"
      :aria-controls="sectionId(tab.key)"
      @click="emit('select', tab.key)"
    >
      <component :is="tab.icon" :size="15" :stroke-width="1.75" />
      {{ tab.label }}
    </button>
  </nav>
</template>
