<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, CalendarDays, GraduationCap } from 'lucide-vue-next'
import type { CertificateListVO } from '@/types/certificate'
import {
  categoryTag,
  getCertificateIcon,
  levelTag,
  normalizeExamTime,
  normalizeIntro,
  normalizeMajor,
} from './utils'

const props = defineProps<{
  item: CertificateListVO
  /** 是否已收藏（灰星 / 黄星切换） */
  favorited?: boolean
}>()
const emit = defineEmits<{
  (e: 'open', id: string): void
  (e: 'toggle-fav', id: string): void
}>()

const iconStyle = computed(() => getCertificateIcon(props.item.certName, props.item.category))
const category = computed(() => categoryTag(props.item.category))
const level = computed(() => levelTag(props.item.certLevel))
const intro = computed(() => normalizeIntro(props.item.certIntro))
const major = computed(() => normalizeMajor(props.item.applicableMajor))
const examTime = computed(() => normalizeExamTime(props.item.examTime))
</script>

<template>
  <!-- 整卡由父层打开详情弹窗；根元素用 div[role=button]（内部要放收藏按钮，button 不可嵌套） -->
  <div
    class="hf-card cert-card is-clickable"
    role="button"
    tabindex="0"
    :aria-label="`查看 ${item.certName} 详情`"
    @click="emit('open', String(item.id))"
    @keydown.enter="emit('open', String(item.id))"
    @keydown.space.prevent="emit('open', String(item.id))"
  >
    <span class="cert-head">
      <span
        class="cert-head__icon"
        :style="{ backgroundColor: iconStyle.bg, color: iconStyle.fg }"
      >
        <component :is="iconStyle.icon" :size="24" :stroke-width="1.75" />
      </span>
      <span class="cert-head__text">
        <span class="cert-head__name" :title="item.certName">{{ item.certName }}</span>
        <span class="cert-tags">
          <span
            v-if="category.text"
            class="hf-tag"
            :style="{ color: category.fg, backgroundColor: category.bg, '--tag-ring': category.ring }"
          >{{ category.text }}</span>
          <span
            v-if="level.text"
            class="hf-tag"
            :style="{ color: level.fg, backgroundColor: level.bg, '--tag-ring': level.ring }"
          >{{ level.text }}</span>
        </span>
      </span>
      <!-- 右上角收藏星标（放大版）：@click.stop 避免触发整卡打开详情 -->
      <button
        type="button"
        class="cert-fav-star"
        :class="{ 'is-on': favorited }"
        :aria-label="favorited ? `取消收藏 ${item.certName}` : `收藏 ${item.certName}`"
        :title="favorited ? '取消收藏' : '收藏'"
        @click.stop="emit('toggle-fav', String(item.id))"
        @keydown.stop
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
        </svg>
      </button>
    </span>

    <span class="cert-intro" :title="item.certIntro || ''">{{ intro }}</span>

    <span class="cert-footer">
      <span class="cert-footer__main">
        <span class="cert-footer__row">
          <GraduationCap :size="14" :stroke-width="1.75" class="cert-footer__icon" />
          <span class="cert-footer__label">适用专业</span>
          <span class="cert-footer__text" :title="major">{{ major }}</span>
        </span>
        <span class="cert-footer__row">
          <CalendarDays :size="14" :stroke-width="1.75" class="cert-footer__icon" />
          <span class="cert-footer__label">考试时间</span>
          <span class="cert-footer__text" :title="examTime">{{ examTime }}</span>
        </span>
      </span>
      <span class="cert-footer__action">
        查看详情
        <ArrowRight :size="14" :stroke-width="1.75" class="cert-footer__arrow" />
      </span>
    </span>
  </div>
</template>

<style scoped>
.cert-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
}
.cert-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
}
.cert-head__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 14px;
}
.cert-head__text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}
.cert-head__name {
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
.cert-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.cert-intro {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  min-height: 46px;
  margin: 14px 0;
  font-size: 14px;
  line-height: 1.65;
  color: #475569;
  overflow-wrap: anywhere;
}
.cert-footer {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-top: auto;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f8fafc;
}
.cert-footer__main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
}
.cert-footer__row {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.cert-footer__icon {
  flex: none;
  color: #64748b;
}
.cert-footer__label {
  flex: none;
  font-size: 13px;
  line-height: 1.4;
  color: #64748b;
}
.cert-footer__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  line-height: 1.4;
  color: #334155;
}
.cert-footer__action {
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
.cert-footer__arrow {
  color: #334155;
  transition: transform 0.2s ease, color 0.2s ease;
}
.cert-card:hover .cert-footer__action {
  color: #9a3412;
}
.cert-card:hover .cert-footer__arrow {
  transform: translateX(2px);
  color: #ea580c;
}

/* ===== 右上角收藏星标（放大版） ===== */
.cert-fav-star {
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
.cert-fav-star svg {
  width: 20px;
  height: 20px;
}
.cert-fav-star:hover {
  color: #d97706;
  background: #fffbeb;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.3);
}
.cert-fav-star.is-on {
  color: #f59e0b;
  background: #fffbeb;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.35);
}
.cert-fav-star.is-on svg {
  fill: currentColor;
}
.cert-fav-star:active {
  transform: translateY(1px);
}
.cert-fav-star:focus-visible {
  outline: 2px solid rgba(245, 158, 11, 0.5);
  outline-offset: 2px;
}
</style>
