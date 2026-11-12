<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, CalendarDays } from 'lucide-vue-next'
import type { CompetitionListVO } from '@/types/certificate'
import { getCompetitionIcon, levelTag, normalizeRegistration } from './utils'

const props = defineProps<{
  item: CompetitionListVO
  /** 是否已收藏（灰星 / 黄星切换） */
  favorited?: boolean
}>()
const emit = defineEmits<{
  (e: 'open', id: string): void
  (e: 'toggle-fav', id: string): void
}>()

const iconStyle = computed(() => getCompetitionIcon(props.item.compName, props.item.compLevel))
const level = computed(() => levelTag(props.item.compLevel))
const registration = computed(() => normalizeRegistration(props.item.registrationTime))
</script>

<template>
  <!-- 整卡由父层推 /competition/:id；根元素用 div[role=button]（内部要放收藏按钮，button 不可嵌套） -->
  <div
    class="hf-card cp-comp-card is-clickable"
    role="button"
    tabindex="0"
    :aria-label="`查看 ${item.compName} 详情`"
    @click="emit('open', String(item.id))"
    @keydown.enter="emit('open', String(item.id))"
    @keydown.space.prevent="emit('open', String(item.id))"
  >
    <span class="comp-head">
      <span
        class="comp-head__icon"
        :style="{ backgroundColor: iconStyle.bg, color: iconStyle.fg }"
      >
        <component :is="iconStyle.icon" :size="24" :stroke-width="1.75" />
      </span>
      <span class="comp-head__text">
        <span class="comp-head__name" :title="item.compName">{{ item.compName }}</span>
        <span class="comp-tags">
          <span
            v-if="level.text"
            class="hf-tag"
            :style="{ color: level.fg, backgroundColor: level.bg, '--tag-ring': level.ring }"
          >{{ level.text }}</span>
        </span>
      </span>
      <!-- 右上角收藏星标（放大版）：@click.stop 避免触发整卡跳转 -->
      <button
        type="button"
        class="cp-fav-star"
        :class="{ 'is-on': favorited }"
        :aria-label="favorited ? `取消收藏 ${item.compName}` : `收藏 ${item.compName}`"
        :title="favorited ? '取消收藏' : '收藏'"
        @click.stop="emit('toggle-fav', String(item.id))"
        @keydown.stop
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
        </svg>
      </button>
    </span>

    <span class="comp-footer">
      <span class="comp-footer__time">
        <CalendarDays :size="14" :stroke-width="1.75" class="comp-footer__icon" />
        <span class="comp-footer__label">报名时间</span>
        <span class="comp-footer__text" :title="registration">{{ registration }}</span>
      </span>
      <span class="comp-footer__action">
        查看详情
        <ArrowRight :size="14" :stroke-width="1.75" class="comp-footer__arrow" />
      </span>
    </span>
  </div>
</template>

<style scoped>
.cp-comp-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
}
.comp-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
}
.comp-head__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 14px;
}
.comp-head__text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}
.comp-head__name {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  color: #0f172a;
}
.comp-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.comp-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f8fafc;
}
.comp-footer__time {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  flex: 1;
}
.comp-footer__icon {
  flex: none;
  color: #64748b;
}
.comp-footer__label {
  flex: none;
  font-size: 13px;
  line-height: 1.4;
  color: #64748b;
}
.comp-footer__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  line-height: 1.4;
  color: #334155;
}
.comp-footer__action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: none;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: #c2410c;
  transition: color 0.2s ease;
}
.comp-footer__arrow {
  color: #334155;
  transition: transform 0.2s ease, color 0.2s ease;
}
.cp-comp-card:hover .comp-footer__action {
  color: #9a3412;
}
.cp-comp-card:hover .comp-footer__arrow {
  transform: translateX(2px);
  color: #ea580c;
}

/* ===== 右上角收藏星标（放大版） ===== */
.cp-fav-star {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #cbd5e1;
  border: none;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}
.cp-fav-star svg {
  width: 20px;
  height: 20px;
}
.cp-fav-star:hover {
  color: #d97706;
  background: #fffbeb;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.3);
}
.cp-fav-star.is-on {
  color: #f59e0b;
  background: #fffbeb;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.35);
}
.cp-fav-star.is-on svg {
  fill: currentColor;
}
.cp-fav-star:active {
  transform: translateY(1px);
}
.cp-fav-star:focus-visible {
  outline: 2px solid rgba(245, 158, 11, 0.5);
  outline-offset: 2px;
}
</style>
