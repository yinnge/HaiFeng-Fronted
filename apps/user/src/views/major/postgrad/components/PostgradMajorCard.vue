<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, Flame, ListChecks } from 'lucide-vue-next'
import type { PostgradMajorListVO } from '@/types/postgrad-major'
import {
  PLACEHOLDER_BRIEF,
  PLACEHOLDER_SUBJECTS,
  TONE_COLORS,
  degreeTag,
  getDifficultyStyle,
  getPostgradMajorIcon,
  normalizeSubjects,
} from './utils'

const props = defineProps<{
  item: PostgradMajorListVO
  /** 是否已收藏（灰星 / 黄星切换） */
  favorited?: boolean
}>()
const emit = defineEmits<{
  (e: 'open', id: string): void
  (e: 'toggle-fav', id: string): void
}>()

const iconStyle = computed(() =>
  getPostgradMajorIcon(props.item.majorName, props.item.disciplineCategory),
)
const degree = computed(() => degreeTag(props.item.degreeType))
const difficulty = computed(() => getDifficultyStyle(props.item.difficulty))
const subjects = computed(() => normalizeSubjects(props.item.examSubjects))
const subjectsText = computed(() => subjects.value.join(' · '))
const briefText = computed(() => props.item.brief?.trim() || PLACEHOLDER_BRIEF)
const popularity = computed(() => props.item.popularity?.trim() || '')
const isHot = computed(() => popularity.value === '热门')
</script>

<template>
  <!-- 整卡由父层推 /postgrad-major/:id；根元素用 div[role=button]（内部要放收藏按钮，button 不可嵌套） -->
  <div
    class="hf-card pg-major-card is-clickable"
    role="button"
    tabindex="0"
    :aria-label="`查看 ${item.majorName} 详情`"
    @click="emit('open', String(item.id))"
    @keydown.enter="emit('open', String(item.id))"
    @keydown.space.prevent="emit('open', String(item.id))"
  >
    <span class="major-head">
      <span
        class="major-head__icon"
        :style="{ backgroundColor: iconStyle.bg, color: iconStyle.fg }"
      >
        <component :is="iconStyle.icon" :size="24" :stroke-width="1.75" />
      </span>
      <span class="major-head__text">
        <span class="major-head__name-row">
          <span class="major-head__name" :title="item.majorName">{{ item.majorName }}</span>
          <span v-if="item.majorCode" class="major-head__code hf-mono">{{ item.majorCode }}</span>
        </span>
        <span class="major-tags">
          <span
            v-if="degree.text"
            class="hf-tag"
            :style="{ color: degree.fg, backgroundColor: degree.bg, '--tag-ring': degree.ring }"
          >{{ degree.text }}</span>
          <span
            v-if="item.disciplineCategory"
            class="hf-tag"
            :style="{
              color: TONE_COLORS.slate.fg,
              backgroundColor: TONE_COLORS.slate.bg,
              '--tag-ring': TONE_COLORS.slate.ring,
            }"
          >{{ item.disciplineCategory }}</span>
          <span
            v-if="popularity"
            class="hf-tag"
            :style="isHot
              ? { color: TONE_COLORS.red.fg, backgroundColor: TONE_COLORS.red.bg, '--tag-ring': TONE_COLORS.red.ring }
              : { color: TONE_COLORS.slate.fg, backgroundColor: TONE_COLORS.slate.bg, '--tag-ring': TONE_COLORS.slate.ring }"
          >
            <Flame v-if="isHot" :size="12" :stroke-width="1.75" />
            {{ popularity }}
          </span>
          <span
            v-if="difficulty"
            class="major-difficulty"
            role="img"
            :aria-label="`难度：${difficulty.label}`"
          >
            <span class="major-difficulty__bars">
              <i
                v-for="n in 3"
                :key="n"
                class="major-difficulty__bar"
                :style="{ backgroundColor: n <= difficulty.level ? difficulty.color : '#E2E8F0' }"
              />
            </span>
            <span class="major-difficulty__label" :style="{ color: difficulty.textColor }">
              难度 {{ difficulty.label }}
            </span>
          </span>
        </span>
      </span>
      <!-- 右上角收藏星标（放大版）：@click.stop 避免触发整卡跳转 -->
      <button
        type="button"
        class="pg-fav-star"
        :class="{ 'is-on': favorited }"
        :aria-label="favorited ? `取消收藏 ${item.majorName}` : `收藏 ${item.majorName}`"
        :title="favorited ? '取消收藏' : '收藏'"
        @click.stop="emit('toggle-fav', String(item.id))"
        @keydown.stop
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
        </svg>
      </button>
    </span>

    <span class="major-brief" :title="item.brief || ''">{{ briefText }}</span>

    <span class="major-footer">
      <span class="major-footer__subjects">
        <ListChecks :size="14" :stroke-width="1.75" class="major-footer__icon" />
        <span class="major-footer__label">考试科目：</span>
        <span class="major-footer__text" :title="subjectsText">
          {{ subjects.length ? subjectsText : PLACEHOLDER_SUBJECTS }}
        </span>
      </span>
      <span class="major-footer__action">
        查看详情
        <ArrowRight :size="14" :stroke-width="1.75" class="major-footer__arrow" />
      </span>
    </span>
  </div>
</template>

<style scoped>
.pg-major-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
}
.major-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
}
.major-head__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 14px;
}
.major-head__text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}
.major-head__name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}
.major-head__name {
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
.major-head__code {
  padding: 2px 7px;
  border-radius: 6px;
  background: #f1f5f9;
  font-size: 12px;
  line-height: 1.5;
  color: #64748b;
}
.major-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.major-difficulty {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.major-difficulty__bars {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.major-difficulty__bar {
  display: block;
  width: 12px;
  height: 4px;
  border-radius: 2px;
}
.major-difficulty__label {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}
.major-brief {
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
.major-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f8fafc;
}
.major-footer__subjects {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  flex: 1;
}
.major-footer__icon {
  flex: none;
  color: #64748b;
}
.major-footer__label {
  flex: none;
  font-size: 13px;
  line-height: 1.4;
  color: #64748b;
}
.major-footer__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  line-height: 1.4;
  color: #334155;
}
.major-footer__action {
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
.major-footer__arrow {
  color: #334155;
  transition: transform 0.2s ease, color 0.2s ease;
}
.pg-major-card:hover .major-footer__action {
  color: #9a3412;
}
.pg-major-card:hover .major-footer__arrow {
  transform: translateX(2px);
  color: #ea580c;
}

/* ===== 右上角收藏星标（放大版） ===== */
.pg-fav-star {
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

.pg-fav-star svg {
  width: 20px;
  height: 20px;
}

.pg-fav-star:hover {
  color: #d97706;
  background: #fffbeb;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.3);
}

.pg-fav-star.is-on {
  color: #f59e0b;
  background: #fffbeb;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.35);
}

.pg-fav-star.is-on svg {
  fill: currentColor;
}

.pg-fav-star:active {
  transform: translateY(1px);
}

.pg-fav-star:focus-visible {
  outline: 2px solid rgba(245, 158, 11, 0.5);
  outline-offset: 2px;
}
</style>
