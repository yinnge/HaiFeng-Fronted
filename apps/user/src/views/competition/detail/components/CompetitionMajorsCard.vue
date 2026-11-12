<script setup lang="ts">
import { ChevronRight, Crown, LockKeyhole } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import type { CompetitionMajorBriefVO } from '@/types/certificate'
import { MAJOR_ITEM_ICON, MAJOR_ITEM_TONE, TONE_COLORS } from '../utils'

defineProps<{
  items: CompetitionMajorBriefVO[]
  /** 是否为 VIP 会员（决定展示真实列表还是引导卡） */
  isVip: boolean
  /** 是否正在加载 */
  loading?: boolean
}>()

const emit = defineEmits<{ (e: 'upgrade'): void }>()
</script>

<template>
  <section class="majors hf-card">
    <h2 class="hf-section-title">推荐相关专业</h2>
    <p class="majors__subtitle">适合参与该竞赛的本科专业方向</p>

    <!-- VIP 且有数据：真实专业列表 -->
    <div v-if="isVip && items.length" class="cd-major-list">
      <RouterLink
        v-for="item in items"
        :key="item.majorId"
        :to="`/major/${item.majorId}`"
        class="cd-major-row is-clickable"
      >
        <span
          class="cd-major-row__icon"
          :style="{
            backgroundColor: TONE_COLORS[MAJOR_ITEM_TONE].bg,
            color: TONE_COLORS[MAJOR_ITEM_TONE].fg,
          }"
        >
          <!-- 图标固定，不随打开场景变化 -->
          <component :is="MAJOR_ITEM_ICON" :size="16" :stroke-width="1.75" />
        </span>
        <span class="cd-major-row__name">{{ item.majorName }}</span>
        <ChevronRight :size="16" :stroke-width="1.75" class="cd-major-row__arrow" />
      </RouterLink>
    </div>

    <!-- 非 VIP：引导卡 -->
    <div v-else-if="!isVip" class="cd-vip">
      <span class="cd-vip__icon">
        <Crown :size="22" :stroke-width="1.75" />
      </span>
      <p class="cd-vip__title">开通 VIP 查看关联专业</p>
      <p class="cd-vip__desc">
        该竞赛暂未关联专业，开通 VIP 后可查看推荐专业方向与报考指引
      </p>
      <button type="button" class="cd-vip__btn" @click="emit('upgrade')">立即开通</button>
    </div>

    <!-- VIP 但暂无关联数据：空态说明 -->
    <div v-else class="cd-vip">
      <span class="cd-vip__icon">
        <LockKeyhole :size="22" :stroke-width="1.75" />
      </span>
      <p class="cd-vip__title">暂无关联专业</p>
      <p class="cd-vip__desc">该竞赛暂未维护关联专业，可先查看赛事流程与获奖信息</p>
    </div>
  </section>
</template>

<style scoped>
.majors {
  padding: 20px;
}
.majors__subtitle {
  margin: 6px 0 0 13px;
  font-size: 13px;
  line-height: 1.4;
  color: #64748b;
}
</style>
