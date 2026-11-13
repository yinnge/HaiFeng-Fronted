<script setup lang="ts">
/**
 * 关联企业（需求 Q4）：
 * - 非 VIP → 黄橙渐变 VIP 引导卡（接口 /industry/enterprises 是 @RequireVip）
 * - VIP 且加载中 → 轻量加载态
 * - VIP 且有数据 → 企业列表，点击去岗位页
 * - VIP 且无数据 → 明确写「暂无关联企业数据」，不留白块
 * ⚠️ 不能用 e.response.status === 403 判断：shared request 抛的是 Error，无 .response 字段。
 */
import { RouterLink } from 'vue-router'
import { ArrowUpRight, Building2, Crown } from 'lucide-vue-next'
import type { EnterpriseJumpVO } from '@/types/enterprise'

defineProps<{
  isVip: boolean
  loading: boolean
  items: EnterpriseJumpVO[]
}>()

const emit = defineEmits<{ (e: 'upgrade'): void }>()
</script>

<template>
  <section class="hf-card idt-aside-card">
    <h2 class="hf-section-title">
      关联企业
      <Building2 :size="16" :stroke-width="1.75" class="idt-block__icon" />
    </h2>

    <div v-if="!isVip" class="idt-vip">
      <span class="idt-vip__icon"><Crown :size="20" :stroke-width="1.75" /></span>
      <p class="idt-vip__title">升级 VIP 查看关联企业</p>
      <p class="idt-vip__desc">解锁行业代表企业及其在招岗位信息</p>
      <button type="button" class="idt-vip__btn" @click="emit('upgrade')">了解会员权益</button>
    </div>

    <div v-else-if="loading" class="idt-aside-empty">正在加载关联企业…</div>

    <div v-else-if="items.length" class="idt-ent-list">
      <RouterLink
        v-for="ent in items"
        :key="ent.enterpriseId"
        class="idt-ent-row"
        :to="{ path: `/enterprise/${ent.enterpriseId}/positions`, query: { name: ent.enterpriseName } }"
      >
        <span class="idt-ent-row__icon"><Building2 :size="15" :stroke-width="1.75" /></span>
        <span class="idt-ent-row__name">{{ ent.enterpriseName }}</span>
        <ArrowUpRight :size="15" :stroke-width="1.75" class="idt-ent-row__arrow" />
      </RouterLink>
    </div>

    <div v-else class="idt-aside-empty">暂无关联企业数据</div>
  </section>
</template>
