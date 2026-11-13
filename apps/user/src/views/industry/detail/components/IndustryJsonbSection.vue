<script setup lang="ts">
/**
 * 通用 JSONB 渲染器（需求 Q11）：不假设 key 名，按值类型渲染。
 * 未知 key 原样展示标签，保证 admin 后续灌入任何字段都能显示。
 */
import { computed } from 'vue'
import { TONE_COLORS, hasJsonbData, toJsonbFields, type IndustrySection } from '../utils'

const props = defineProps<{
  section: IndustrySection
  data: Record<string, any> | null | undefined
}>()

const fields = computed(() => toJsonbFields(props.data))
const visible = computed(() => hasJsonbData(props.data))
</script>

<template>
  <article v-if="visible" class="idt-jsonb">
    <div class="idt-jsonb__head">
      <span
        class="idt-jsonb__icon"
        :style="{ color: TONE_COLORS[section.tone].fg, backgroundColor: TONE_COLORS[section.tone].bg }"
      >
        <component :is="section.icon" :size="18" :stroke-width="1.75" />
      </span>
      <div class="idt-jsonb__head-text">
        <h3 class="idt-jsonb__title">{{ section.title }}</h3>
        <p class="idt-jsonb__desc">{{ section.desc }}</p>
      </div>
    </div>

    <div class="idt-jsonb__fields">
      <div v-for="field in fields" :key="field.key" class="idt-jsonb__field">
        <span class="idt-jsonb__label">{{ field.label }}</span>
        <span v-if="field.type === 'text' || field.type === 'number'" class="idt-jsonb__text">
          {{ field.text }}
        </span>
        <span v-else class="idt-jsonb__tags">
          <span v-for="(item, idx) in field.items" :key="`${field.key}-${idx}`" class="idt-jsonb__tag">
            {{ item }}
          </span>
        </span>
      </div>
    </div>
  </article>
</template>
