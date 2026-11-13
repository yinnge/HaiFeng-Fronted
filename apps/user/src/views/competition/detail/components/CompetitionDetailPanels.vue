<script setup lang="ts">
/**
 * 5 个分区全部同页渲染（2026-11-13 定案）：Tab 由「切换隐藏」改为「锚点跳转」。
 * - 每个 section 有稳定 id（sectionId），供主文件滚动定位与 scroll spy 使用。
 * - 分区恒定存在：即使该分区所有字段都为空，也渲染一张占位卡，
 *   否则锚点元素消失，点击对应 Tab 会「点了没反应」。
 * - 样式统一在 ../detail.css，组件不写 scoped（避免选择器作用域失配）。
 */
import { computed } from 'vue'
import { CircleHelp, ClipboardCheck, FileText, ListChecks, Target, Trophy } from 'lucide-vue-next'
import type { CompetitionBasicInfoItem } from '@/types/certificate'
import {
  COMPETITION_TABS,
  PLACEHOLDER_EMPTY,
  purposeIcon,
  sectionId,
} from '../utils'

const props = defineProps<{
  /** 基本信息项（已剔除「官方网站」） */
  basicItems: CompetitionBasicInfoItem[]
  /** 赛事背景与意义 */
  background: string
  /** 赛事目的 */
  purposes: string[]
  /** 竞赛规则 */
  rules: Array<{ title: string; content: string }>
  /** 评分标准 */
  scoring: string[]
  /** 奖项设置 */
  awards: string[]
  /** 奖项展示 */
  awardsDisplay: Array<{ title: string; content: string }>
  /** 注意事项 */
  notices: string[]
}>()

/** 分区列表：Tab 定义即分区定义，避免两处维护 */
const sections = computed(() =>
  COMPETITION_TABS.map((tab) => {
    let hasContent = false
    switch (tab.key) {
      case 'detail':
        hasContent = Boolean(props.basicItems.length || props.background || props.purposes.length)
        break
      case 'guide':
        hasContent = props.rules.length > 0
        break
      case 'scoring':
        hasContent = props.scoring.length > 0
        break
      case 'awards':
        hasContent = Boolean(props.awards.length || props.awardsDisplay.length)
        break
      case 'faq':
        hasContent = props.notices.length > 0
        break
    }
    return { ...tab, id: sectionId(tab.key), hasContent }
  }),
)
</script>

<template>
  <div class="cd-panels">
    <section
      v-for="sec in sections"
      :id="sec.id"
      :key="sec.key"
      class="cd-section"
      :data-tab="sec.key"
    >
      <header class="cd-section__head">
        <span class="cd-section__icon">
          <component :is="sec.icon" :size="16" :stroke-width="1.75" />
        </span>
        <h2 class="cd-section__title">{{ sec.label }}</h2>
        <span class="cd-section__line" aria-hidden="true" />
      </header>

      <!-- ========== 竞赛详情 ========== -->
      <template v-if="sec.key === 'detail'">
        <section v-if="basicItems.length" class="hf-card cd-block">
          <h3 class="cd-block__title">
            <FileText :size="16" :stroke-width="1.75" class="cd-block__icon" />
            基本信息
          </h3>
          <div class="cd-basic-list">
            <div v-for="item in basicItems" :key="item.title" class="cd-basic">
              <p class="cd-basic__label">{{ item.title }}</p>
              <p class="cd-basic__text">{{ item.content || PLACEHOLDER_EMPTY }}</p>
            </div>
          </div>
        </section>

        <section v-if="background" class="hf-card cd-block">
          <h3 class="cd-block__title">
            <FileText :size="16" :stroke-width="1.75" class="cd-block__icon" />
            竞赛背景与意义
          </h3>
          <p class="cd-block__body">{{ background }}</p>
        </section>

        <section v-if="purposes.length" class="hf-card cd-block">
          <h3 class="cd-block__title">
            <Target :size="16" :stroke-width="1.75" class="cd-block__icon" />
            赛事目的
          </h3>
          <div class="cd-purpose-grid">
            <div v-for="(purpose, i) in purposes" :key="i" class="cd-purpose">
              <span class="cd-purpose__icon">
                <component :is="purposeIcon(i)" :size="15" :stroke-width="1.75" />
              </span>
              <p class="cd-purpose__text">{{ purpose }}</p>
            </div>
          </div>
        </section>

        <div v-if="!sec.hasContent" class="hf-card cd-block">
          <p class="cd-block__body">{{ PLACEHOLDER_EMPTY }}</p>
        </div>
      </template>

      <!-- ========== 参赛指南 ========== -->
      <template v-else-if="sec.key === 'guide'">
        <section class="hf-card cd-block">
          <h3 class="cd-block__title">
            <ListChecks :size="16" :stroke-width="1.75" class="cd-block__icon" />
            竞赛规则
          </h3>
          <div v-if="rules.length" class="cd-list">
            <div v-for="(rule, i) in rules" :key="i" class="cd-list__item">
              <span class="cd-list__index">{{ i + 1 }}</span>
              <div class="cd-list__body">
                <p class="cd-list__title">{{ rule.title }}</p>
                <p v-if="rule.content" class="cd-list__text">{{ rule.content }}</p>
              </div>
            </div>
          </div>
          <p v-else class="cd-block__body">{{ PLACEHOLDER_EMPTY }}</p>
        </section>
      </template>

      <!-- ========== 评审标准 ========== -->
      <template v-else-if="sec.key === 'scoring'">
        <section class="hf-card cd-block">
          <h3 class="cd-block__title">
            <ClipboardCheck :size="16" :stroke-width="1.75" class="cd-block__icon" />
            评分标准
          </h3>
          <ul v-if="scoring.length" class="cd-bullet-list">
            <li v-for="(item, i) in scoring" :key="i">{{ item }}</li>
          </ul>
          <p v-else class="cd-block__body">{{ PLACEHOLDER_EMPTY }}</p>
        </section>
      </template>

      <!-- ========== 奖项设置 ========== -->
      <template v-else-if="sec.key === 'awards'">
        <section v-if="awards.length" class="hf-card cd-block">
          <h3 class="cd-block__title">
            <Trophy :size="16" :stroke-width="1.75" class="cd-block__icon" />
            奖项设置
          </h3>
          <div class="cd-purpose-grid">
            <div v-for="(item, i) in awards" :key="i" class="cd-purpose">
              <span class="cd-purpose__icon">
                <Trophy :size="15" :stroke-width="1.75" />
              </span>
              <p class="cd-purpose__text">{{ item }}</p>
            </div>
          </div>
        </section>

        <section v-if="awardsDisplay.length" class="hf-card cd-block">
          <h3 class="cd-block__title">
            <Trophy :size="16" :stroke-width="1.75" class="cd-block__icon" />
            奖项说明
          </h3>
          <div class="cd-list">
            <div v-for="(item, i) in awardsDisplay" :key="i" class="cd-list__item">
              <span class="cd-list__index">{{ i + 1 }}</span>
              <div class="cd-list__body">
                <p class="cd-list__title">{{ item.title }}</p>
                <p v-if="item.content" class="cd-list__text">{{ item.content }}</p>
              </div>
            </div>
          </div>
        </section>

        <div v-if="!sec.hasContent" class="hf-card cd-block">
          <p class="cd-block__body">{{ PLACEHOLDER_EMPTY }}</p>
        </div>
      </template>

      <!-- ========== 常见问题 ========== -->
      <template v-else>
        <section class="hf-card cd-block">
          <h3 class="cd-block__title">
            <CircleHelp :size="16" :stroke-width="1.75" class="cd-block__icon" />
            注意事项
          </h3>
          <ul v-if="notices.length" class="cd-bullet-list">
            <li v-for="(item, i) in notices" :key="i">{{ item }}</li>
          </ul>
          <p v-else class="cd-block__body">{{ PLACEHOLDER_EMPTY }}</p>
        </section>
      </template>
    </section>
  </div>
</template>
