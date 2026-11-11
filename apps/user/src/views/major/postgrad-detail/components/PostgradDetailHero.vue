<script setup lang="ts">
import { computed } from 'vue'
import { BookText, GraduationCap, Layers } from 'lucide-vue-next'
import type { PostgradMajorDetailVO } from '@/types/postgrad-major'
import {
  HERO_BG_URL,
  TONE_COLORS,
  degreeTag,
  getPostgradMajorIcon,
} from '../../postgrad/components/utils'
import { PLACEHOLDER_DASH } from '../../detail/components/utils'

const props = defineProps<{ detail: PostgradMajorDetailVO }>()

/** 与列表页同款两级图标映射；关键词命中时底座色取所属门类色 */
const majorIcon = computed(() =>
  getPostgradMajorIcon(props.detail.majorName, props.detail.disciplineCategory),
)
/** 学术学位=蓝 / 专业学位=琥珀 / 未知=slate */
const degree = computed(() => degreeTag(props.detail.degreeType))

const tags = computed(() => [
  { key: 'category', text: props.detail.disciplineCategory || PLACEHOLDER_DASH, tone: TONE_COLORS.blue },
  { key: 'popularity', text: props.detail.popularity || PLACEHOLDER_DASH, tone: TONE_COLORS.red },
  { key: 'difficulty', text: props.detail.difficulty ? `难度 ${props.detail.difficulty}` : PLACEHOLDER_DASH, tone: TONE_COLORS.amber },
])

/** 右侧信息卡 3 项，全部来自详情 VO；空值统一破折号 */
const infoItems = computed(() => [
  { icon: Layers, label: '学科门类', value: props.detail.disciplineCategory },
  { icon: GraduationCap, label: '学位类型', value: props.detail.degreeType },
  { icon: BookText, label: '专业代码', value: props.detail.majorCode },
])
</script>

<template>
  <section class="pgd-hero" :style="{ '--hero-bg-url': `url(${HERO_BG_URL})` }">
    <div class="pgd-hero__left">
      <span
        class="pgd-hero__icon"
        :style="{ backgroundColor: majorIcon.bg, boxShadow: `0 0 0 1px ${majorIcon.ring}`, color: majorIcon.fg }"
      >
        <component :is="majorIcon.icon" :size="28" :stroke-width="1.75" />
      </span>

      <div class="pgd-hero__main">
        <div class="pgd-hero__name-row">
          <h1 class="pgd-hero__name">{{ detail.majorName || PLACEHOLDER_DASH }}</h1>
          <span
            v-if="degree.text"
            class="hf-tag"
            :style="{ color: degree.fg, backgroundColor: degree.bg, '--tag-ring': degree.ring }"
          >{{ degree.text }}</span>
        </div>

        <p class="pgd-hero__code hf-mono">{{ detail.majorCode || PLACEHOLDER_DASH }}</p>

        <div class="pgd-hero__tags">
          <span
            v-for="tag in tags"
            :key="tag.key"
            class="hf-tag"
            :style="{ color: tag.tone.fg, backgroundColor: tag.tone.bg, '--tag-ring': tag.tone.ring }"
          >{{ tag.text }}</span>
        </div>

        <p class="pgd-hero__intro">{{ detail.introduction || '内容整理中' }}</p>
      </div>
    </div>

    <div class="pgd-hero__info">
      <div v-for="item in infoItems" :key="item.label" class="pgd-hero__info-item">
        <component :is="item.icon" :size="15" :stroke-width="1.75" />
        <span class="pgd-hero__info-label">{{ item.label }}</span>
        <span class="pgd-hero__info-value hf-mono">{{ item.value || PLACEHOLDER_DASH }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 不挂 hf-card：避免其 background:#fff 与多层 Hero 背景互相覆盖 */
.pgd-hero {
  --hero-bg-pos: center 62%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  height: clamp(176px, 14vw, 208px);
  padding: 20px 28px;
  border: 1px solid rgba(15, 23, 42, 0.05);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02), 0 4px 20px -2px rgba(15, 23, 42, 0.04);
  background-color: #eff6ff;
  background-image:
    linear-gradient(90deg, #f8fbff 0%, rgba(248, 251, 255, 0.94) 36%, rgba(248, 251, 255, 0) 72%),
    var(--hero-bg-url);
  background-position: center, var(--hero-bg-pos);
  background-size: auto, cover;
  background-repeat: no-repeat, no-repeat;
}
.pgd-hero__left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;
  max-width: 68%;
}
.pgd-hero__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  flex: none;
  border-radius: 16px;
  background: #eff6ff;
}
.pgd-hero__main {
  min-width: 0;
}
.pgd-hero__name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.pgd-hero__name {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: #0f172a;
}
.pgd-hero__code {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: #475569;
}
.pgd-hero__tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.pgd-hero__intro {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  margin: 10px 0 0;
  max-width: 620px;
  font-size: 13px;
  line-height: 1.6;
  color: #475569;
  white-space: pre-line;
}
.pgd-hero__info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 210px;
  flex: none;
  padding: 14px 16px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.12);
}
.pgd-hero__info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  line-height: 1.5;
}
.pgd-hero__info-item svg {
  flex: none;
  color: #64748b;
}
.pgd-hero__info-label {
  flex: 1;
  min-width: 0;
  color: #64748b;
}
.pgd-hero__info-value {
  flex: none;
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
  color: #1e293b;
}
@media (max-width: 1023px) {
  .pgd-hero__left {
    max-width: 100%;
  }
  .pgd-hero__info {
    display: none;
  }
}
@media (max-width: 767px) {
  .pgd-hero {
    --hero-bg-pos: 75% 62%;
    height: auto;
    min-height: 176px;
    padding: 18px;
  }
  .pgd-hero__name {
    font-size: 22px;
  }
  .pgd-hero__icon {
    width: 44px;
    height: 44px;
  }
  .pgd-hero__intro {
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }
}
</style>
