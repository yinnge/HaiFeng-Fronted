<script setup lang="ts">
import { CircleHelp, ClipboardCheck, FileText, ListChecks, Target, Trophy } from 'lucide-vue-next'
import type { CompetitionBasicInfoItem } from '@/types/certificate'
import { PLACEHOLDER_EMPTY, purposeIcon, type CompetitionTabKey } from '../utils'

defineProps<{
  tab: CompetitionTabKey
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
</script>

<template>
  <div class="cd-panels">
    <!-- ========== 竞赛详情 ========== -->
    <div v-if="tab === 'detail'" class="cd-panel">
      <section v-if="basicItems.length" class="hf-card cd-block">
        <h2 class="cd-block__title">
          <FileText :size="16" :stroke-width="1.75" class="cd-block__icon" />
          基本信息
        </h2>
        <div class="cd-basic-list">
          <div v-for="item in basicItems" :key="item.title" class="cd-basic">
            <p class="cd-basic__label">{{ item.title }}</p>
            <p class="cd-basic__text">{{ item.content || PLACEHOLDER_EMPTY }}</p>
          </div>
        </div>
      </section>

      <section v-if="background" class="hf-card cd-block">
        <h2 class="cd-block__title">
          <FileText :size="16" :stroke-width="1.75" class="cd-block__icon" />
          竞赛背景与意义
        </h2>
        <p class="cd-block__body">{{ background }}</p>
      </section>

      <section v-if="purposes.length" class="hf-card cd-block">
        <h2 class="cd-block__title">
          <Target :size="16" :stroke-width="1.75" class="cd-block__icon" />
          赛事目的
        </h2>
        <div class="cd-purpose-grid">
          <div v-for="(purpose, i) in purposes" :key="i" class="cd-purpose">
            <span class="cd-purpose__icon">
              <component :is="purposeIcon(i)" :size="15" :stroke-width="1.75" />
            </span>
            <p class="cd-purpose__text">{{ purpose }}</p>
          </div>
        </div>
      </section>
    </div>

    <!-- ========== 参赛指南 ========== -->
    <div v-else-if="tab === 'guide'" class="cd-panel">
      <section class="hf-card cd-block">
        <h2 class="cd-block__title">
          <ListChecks :size="16" :stroke-width="1.75" class="cd-block__icon" />
          竞赛规则
        </h2>
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
    </div>

    <!-- ========== 评审标准 ========== -->
    <div v-else-if="tab === 'scoring'" class="cd-panel">
      <section class="hf-card cd-block">
        <h2 class="cd-block__title">
          <ClipboardCheck :size="16" :stroke-width="1.75" class="cd-block__icon" />
          评分标准
        </h2>
        <ul v-if="scoring.length" class="cd-bullet-list">
          <li v-for="(item, i) in scoring" :key="i">{{ item }}</li>
        </ul>
        <p v-else class="cd-block__body">{{ PLACEHOLDER_EMPTY }}</p>
      </section>
    </div>

    <!-- ========== 奖项设置 ========== -->
    <div v-else-if="tab === 'awards'" class="cd-panel">
      <section v-if="awards.length" class="hf-card cd-block">
        <h2 class="cd-block__title">
          <Trophy :size="16" :stroke-width="1.75" class="cd-block__icon" />
          奖项设置
        </h2>
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
        <h2 class="cd-block__title">
          <Trophy :size="16" :stroke-width="1.75" class="cd-block__icon" />
          奖项说明
        </h2>
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
    </div>

    <!-- ========== 常见问题 ========== -->
    <div v-else class="cd-panel">
      <section class="hf-card cd-block">
        <h2 class="cd-block__title">
          <CircleHelp :size="16" :stroke-width="1.75" class="cd-block__icon" />
          注意事项
        </h2>
        <ul v-if="notices.length" class="cd-bullet-list">
          <li v-for="(item, i) in notices" :key="i">{{ item }}</li>
        </ul>
        <p v-else class="cd-block__body">{{ PLACEHOLDER_EMPTY }}</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.cd-panels,
.cd-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
