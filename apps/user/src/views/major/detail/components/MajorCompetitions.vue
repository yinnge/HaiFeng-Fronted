<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { LockKeyhole, Trophy } from 'lucide-vue-next'
import type { CompetitionBriefVO } from '@/types/certificate'
import { TONE_COLORS, YELLOW_TAG } from './utils'

defineProps<{
  items: CompetitionBriefVO[]
  isPro: boolean
  loading?: boolean
}>()

const emit = defineEmits<{ (e: 'open-recharge'): void }>()
const blue = TONE_COLORS.blue
</script>

<template>
  <!-- 非 VIP：保留原有升级引导；VIP 且数组为空：整块隐藏 -->
  <section v-if="!isPro" class="competitions hf-card">
    <h2 class="hf-section-title">关联竞赛</h2>
    <div class="hf-vip-guide">
      <LockKeyhole :size="22" :stroke-width="1.75" :style="{ color: blue.fg }" />
      <span class="hf-vip-guide__title">开通 VIP 会员，查看关联竞赛</span>
      <span class="hf-vip-guide__desc">了解该专业适合参加哪些学科竞赛</span>
      <button type="button" class="hf-vip-guide__btn" @click="emit('open-recharge')">立即升级</button>
    </div>
  </section>

  <section v-else-if="loading" class="competitions hf-card">
    <h2 class="hf-section-title">关联竞赛</h2>
    <div class="competitions__skeleton">
      <span v-for="n in 4" :key="n" class="hf-skeleton" />
    </div>
  </section>

  <section v-else-if="items.length" class="competitions hf-card">
    <h2 class="hf-section-title">关联竞赛</h2>
    <div class="competitions__items">
      <RouterLink
        v-for="item in items"
        :key="item.competitionId"
        :to="`/competition/${item.competitionId}`"
        class="competitions__tag hf-tag"
        :style="{
          color: YELLOW_TAG.fg,
          backgroundColor: YELLOW_TAG.bg,
          '--tag-ring': YELLOW_TAG.ring,
          fontSize: '13px',
        }"
      >
        <Trophy :size="13" :stroke-width="1.75" />
        {{ item.competitionName }}
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.competitions {
  padding: 20px;
}
.competitions__items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.competitions__tag {
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}
.competitions__tag:hover {
  color: #92400e;
}
.competitions__skeleton {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.competitions__skeleton .hf-skeleton {
  width: 108px;
  height: 26px;
}
</style>
