<script setup lang="ts">
/**
 * 证书详情弹框（证书详情 / 报名指南）。
 *
 * 设计依据（AGENTS.md）：
 * - 第二节色彩令牌：四色活力光谱分流；第三节方块微质感（白卡 + 发丝边 + 双层弥散阴影，禁彩色实线外框）
 * - 第四节图标铁律：全站 lucide 线性图标，严禁 Emoji
 * - 第六节文字毛边：稳态零 transform / filter / will-change，字号取整 px
 *
 * 数据事实（DB 实测 t_certificate，275 行）：
 * - 所有文本列都很短（cert_intro ≤27 字、applicable_major ≤11 字、exam_arrangement ≤26 字）
 *   → 不需要折叠 / 滚动条 / 展开更多
 * - exam_fee 全表 NULL，且后端 jackson non_null 会省略该键 → 本弹框不展示费用
 * - official_website 275/275 均为合法 http/https URL
 */
import { computed } from 'vue'
import { ElDialog } from 'element-plus'
import {
  ArrowUpRight,
  CalendarDays,
  ClipboardCheck,
  FileText,
  GraduationCap,
  ListChecks,
} from 'lucide-vue-next'
import type { CertificateDetailVO } from '@/types/certificate'
import {
  categoryTag,
  getCertificateIcon,
  levelTag,
  normalizeExamTime,
  normalizeIntro,
  normalizeMajor,
} from './utils'

const props = defineProps<{
  /** 当前证书详情；为 null 时内容区留空 */
  cert: CertificateDetailVO | null
  /** 详情加载中 */
  loading: boolean
}>()

/** 弹框可见性（父层 v-model 绑定） */
const visible = defineModel<boolean>({ default: false })

const iconStyle = computed(() =>
  props.cert ? getCertificateIcon(props.cert.certName, props.cert.category) : null,
)
const category = computed(() => categoryTag(props.cert?.category))
const level = computed(() => levelTag(props.cert?.certLevel))
const intro = computed(() => normalizeIntro(props.cert?.certIntro))
const major = computed(() => normalizeMajor(props.cert?.applicableMajor))
const examTime = computed(() => normalizeExamTime(props.cert?.examTime))
const requirements = computed(() =>
  Array.isArray(props.cert?.examRequirements)
    ? props.cert!.examRequirements.filter((r) => typeof r === 'string' && r.trim() !== '')
    : [],
)
</script>

<template>
  <ElDialog
    v-model="visible"
    title="证书详情"
    width="min(760px, 92vw)"
    :close-on-click-modal="false"
    v-loading="loading"
    class="cert-detail-dialog"
  >
    <div v-if="cert" class="cert-detail">
      <!-- 顶部：图标底座 + 证书名 + 分类/级别标签（左对齐，全站规范） -->
      <header class="cert-detail__head">
        <span
          class="cert-detail__icon"
          :style="{ backgroundColor: iconStyle?.bg, color: iconStyle?.fg }"
        >
          <component :is="iconStyle!.icon" :size="26" :stroke-width="1.75" />
        </span>
        <div class="cert-detail__head-main">
          <h3 class="cert-detail__name">{{ cert.certName }}</h3>
          <div class="cert-detail__tags">
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
          </div>
        </div>
      </header>

      <!-- 概览：3 格（费用格已移除，后端 non_null + 全表 NULL 拿不到该键） -->
      <div class="cert-detail__facts">
        <div class="cert-detail__fact">
          <GraduationCap :size="15" :stroke-width="1.75" class="cert-detail__fact-icon" />
          <div class="cert-detail__fact-body">
            <span class="cert-detail__fact-label">适用专业</span>
            <span class="cert-detail__fact-value">{{ major }}</span>
          </div>
        </div>
        <div class="cert-detail__fact">
          <CalendarDays :size="15" :stroke-width="1.75" class="cert-detail__fact-icon" />
          <div class="cert-detail__fact-body">
            <span class="cert-detail__fact-label">报名时间</span>
            <span class="cert-detail__fact-value">{{ cert.registrationTime || '待公布' }}</span>
          </div>
        </div>
        <div class="cert-detail__fact">
          <ListChecks :size="15" :stroke-width="1.75" class="cert-detail__fact-icon" />
          <div class="cert-detail__fact-body">
            <span class="cert-detail__fact-label">考试时间</span>
            <span class="cert-detail__fact-value">{{ examTime }}</span>
          </div>
        </div>
      </div>

      <!-- 证书简介 -->
      <section class="cert-detail__section">
        <h4 class="cert-detail__section-title">
          <FileText :size="15" :stroke-width="1.75" class="cert-detail__section-icon" />
          证书简介
        </h4>
        <p class="cert-detail__text">{{ intro }}</p>
      </section>

      <!-- 报考条件：每项一个说明性标签（数据最多 2 项） -->
      <section v-if="requirements.length" class="cert-detail__section">
        <h4 class="cert-detail__section-title">
          <ClipboardCheck :size="15" :stroke-width="1.75" class="cert-detail__section-icon" />
          报考条件
        </h4>
        <div class="cert-detail__reqs">
          <span
            v-for="req in requirements"
            :key="req"
            class="cert-detail__req"
          >{{ req }}</span>
        </div>
      </section>

      <!-- 考试安排 -->
      <section v-if="cert.examArrangement" class="cert-detail__section">
        <h4 class="cert-detail__section-title">
          <CalendarDays :size="15" :stroke-width="1.75" class="cert-detail__section-icon" />
          考试安排
        </h4>
        <p class="cert-detail__text">{{ cert.examArrangement }}</p>
      </section>

      <!-- 官网：弹框内唯一的行动点 -->
      <section v-if="cert.officialWebsite" class="cert-detail__section">
        <h4 class="cert-detail__section-title">
          <ArrowUpRight :size="15" :stroke-width="1.75" class="cert-detail__section-icon" />
          官方网站
        </h4>
        <a
          class="cert-detail__site"
          :href="cert.officialWebsite"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="cert-detail__site-label">访问官网</span>
          <ArrowUpRight :size="16" :stroke-width="1.75" class="cert-detail__site-arrow" />
          <span class="cert-detail__site-url">{{ cert.officialWebsite }}</span>
        </a>
      </section>
    </div>

    <template #footer>
      <button type="button" class="cert-detail__close" @click="visible = false">
        关闭
      </button>
    </template>
  </ElDialog>
</template>
