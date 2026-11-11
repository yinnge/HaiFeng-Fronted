<script setup lang="ts">
import type { MajorDetailVO } from '@/types/major'
import { PLACEHOLDER_DASH } from './utils'

defineProps<{ detail: MajorDetailVO }>()
</script>

<template>
  <section class="basic-info hf-card">
    <h2 class="hf-section-title">专业基本信息</h2>
    <dl class="basic-info__list">
      <div class="basic-info__row">
        <dt>专业名称</dt>
        <dd>{{ detail.majorName || PLACEHOLDER_DASH }}</dd>
      </div>
      <div class="basic-info__row">
        <dt>专业代码</dt>
        <dd class="hf-mono">{{ detail.majorCode || PLACEHOLDER_DASH }}</dd>
      </div>
      <div class="basic-info__row">
        <dt>学科门类</dt>
        <dd>{{ detail.parentCategory || PLACEHOLDER_DASH }}</dd>
      </div>
      <div class="basic-info__row">
        <dt>专业类</dt>
        <dd>{{ detail.majorCategory || PLACEHOLDER_DASH }}</dd>
      </div>
      <div class="basic-info__row">
        <dt>授予学位</dt>
        <dd>{{ detail.degreeAwarded || PLACEHOLDER_DASH }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.basic-info {
  padding: 20px;
}
/* 行间无分割线、无斑马纹，只用 padding 呼吸 */
.basic-info__list {
  margin: 0;
}
.basic-info__row {
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr);
  gap: 10px;
  align-items: baseline;
  padding: 8px 0;
}
.basic-info__row dt {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}
.basic-info__row dd {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6;
  color: #1e293b;
  overflow-wrap: anywhere;
}
</style>
