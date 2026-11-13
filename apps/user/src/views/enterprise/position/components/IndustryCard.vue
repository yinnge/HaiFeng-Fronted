<script setup lang="ts">
import { Building2, ChevronRight, Crown } from 'lucide-vue-next'
import { EMPTY_INDUSTRIES, VIP_INDUSTRY_TIP } from '../utils'

defineProps<{
  /** 关联行业名称列表（当前 DB 关联表为空，通常是空数组） */
  industries: string[]
  /** 当前用户是否为 VIP（决定展示升级引导还是空态） */
  isVip: boolean
  /** 关联行业数据是否已加载完成 */
  loaded: boolean
}>()

const emit = defineEmits<{
  (e: 'upgrade'): void
}>()
</script>

<template>
  <section class="hf-card industry">
    <h2 class="hf-section-title">
      <Building2 :size="16" :stroke-width="1.75" class="industry__head-icon" />
      关联行业
    </h2>

    <!-- 加载中 -->
    <p v-if="!loaded" class="industry__placeholder">加载中…</p>

    <!-- VIP：展示关联行业（当前关联表 0 行 → 空态） -->
    <template v-else-if="isVip">
      <div v-if="industries.length" class="industry__list">
        <span v-for="name in industries" :key="name" class="industry__item">
          {{ name }}
          <ChevronRight :size="12" :stroke-width="1.75" class="industry__item-arrow" />
        </span>
      </div>
      <p v-else class="industry__placeholder">{{ EMPTY_INDUSTRIES }}</p>
    </template>

    <!-- 非 VIP：升级引导 -->
    <div v-else class="industry__upgrade">
      <Crown :size="18" :stroke-width="1.75" class="industry__upgrade-icon" />
      <p class="industry__upgrade-text">{{ VIP_INDUSTRY_TIP }}</p>
      <button type="button" class="industry__upgrade-btn" @click="emit('upgrade')">
        前往开通
      </button>
    </div>
  </section>
</template>

<style scoped>
.industry {
  padding: 20px;
}
.industry__head-icon {
  color: #64748b;
}
.industry__placeholder {
  margin: 14px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #94a3b8;
}
.industry__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.industry__item {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
}
.industry__item-arrow {
  flex: none;
  color: #2563eb;
}
.industry__upgrade {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  margin-top: 14px;
  padding: 14px;
  border-radius: 12px;
  background: #fffbeb;
  border: 1px solid rgba(245, 158, 11, 0.22);
}
.industry__upgrade-icon {
  color: #d97706;
  flex: none;
}
.industry__upgrade-text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #92400e;
}
.industry__upgrade-btn {
  padding: 6px 14px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.industry__upgrade-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(249, 115, 22, 0.26);
}
.industry__upgrade-btn:active {
  transform: none;
}
</style>
