<script setup lang="ts">
/**
 * 深度数据：8 个 JSONB 板块「有值才渲染」（需求 Q1 / Q8 / Q11）。
 * DB 实测 90/90 全空，此时只显示一处轻量提示卡，不摆空 Tab、不留白块；
 * admin 灌入 9-Sheet 数据后，对应板块会自动长出来，前端零改动。
 */
import { computed } from 'vue'
import { Database, Info } from 'lucide-vue-next'
import type { IndustryDetailVO } from '@/types/industry'
import IndustryJsonbSection from './IndustryJsonbSection.vue'
import { INDUSTRY_SECTIONS, hasJsonbData } from '../utils'

const props = defineProps<{ detail: IndustryDetailVO }>()

const sections = computed(() =>
  INDUSTRY_SECTIONS.map((section) => ({
    section,
    data: (props.detail as unknown as Record<string, any>)[section.key],
  })).filter((entry) => hasJsonbData(entry.data)),
)
</script>

<template>
  <section class="hf-card idt-block">
    <h2 class="hf-section-title">
      深度数据
      <Database :size="16" :stroke-width="1.75" class="idt-block__icon" />
    </h2>

    <div v-if="sections.length" class="idt-deep__list">
      <IndustryJsonbSection
        v-for="entry in sections"
        :key="entry.section.key"
        :section="entry.section"
        :data="entry.data"
      />
    </div>

    <div v-else class="idt-deep__empty">
      <span class="idt-deep__empty-icon">
        <Info :size="18" :stroke-width="1.75" />
      </span>
      <div>
        <p class="idt-deep__empty-title">深度数据整理中</p>
        <p class="idt-deep__empty-text">
          行业规模、人才需求、薪资水平、政策信息等深度资料正在整理，完成后将在此自动展示。
        </p>
      </div>
    </div>
  </section>
</template>
