<script setup lang="ts">
import { computed } from 'vue'
import { Building2 } from 'lucide-vue-next'
import type { EnterpriseListVO } from '@/types/enterprise'

const props = defineProps<{
  enterprise: EnterpriseListVO | null
}>()

/**
 * 企业信息 6 项：性质 / 类型 / 城市 / 地区 / 规模 / 主营业务。
 * 全部来自列表 VO 的非空字段（实测除 logo_url、official_website 外均为真值）。
 */
const rows = computed(() => {
  const e = props.enterprise
  if (!e) return []
  return [
    { key: 'nature', label: '企业性质', text: e.enterpriseNature },
    { key: 'type', label: '企业类型', text: e.enterpriseType },
    { key: 'city', label: '所在城市', text: e.cityName },
    { key: 'region', label: '所属地区', text: e.region },
    { key: 'scale', label: '企业规模', text: e.enterpriseScale },
    { key: 'business', label: '主营业务', text: e.mainBusiness },
  ].filter((r) => Boolean(r.text && r.text.trim()))
    .map((r) => ({ ...r, text: r.text as string }))
})
</script>

<template>
  <section class="hf-card info">
    <h2 class="hf-section-title">
      <Building2 :size="16" :stroke-width="1.75" class="info__head-icon" />
      企业信息
    </h2>

    <p v-if="!rows.length" class="info__empty">企业信息待补充</p>

    <dl v-else class="info__list">
      <div v-for="row in rows" :key="row.key" class="info__row">
        <dt class="info__label">{{ row.label }}</dt>
        <dd class="info__value" :title="row.text">{{ row.text }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.info {
  padding: 20px;
}
.info__head-icon {
  color: #64748b;
}
.info__empty {
  margin: 14px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #94a3b8;
}
.info__list {
  margin: 14px 0 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.info__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 12px;
  border-radius: 8px;
  background: #f8fafc;
}
.info__label {
  flex: none;
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #64748b;
}
.info__value {
  min-width: 0;
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  color: #1e293b;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
