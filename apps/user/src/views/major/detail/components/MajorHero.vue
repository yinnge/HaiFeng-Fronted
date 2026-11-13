<script setup lang="ts">
import { computed } from 'vue'
import { Clock, FolderTree, GraduationCap, Layers } from 'lucide-vue-next'
import type { MajorDetailVO } from '@/types/major'
import { HERO_BG_URL, PLACEHOLDER_DASH, getDisciplineIcon, parseTags } from './utils'

const props = defineProps<{
  detail: MajorDetailVO
  /** 是否已收藏（灰星 / 黄星切换） */
  favorited?: boolean
  /** 收藏请求进行中 */
  favBusy?: boolean
}>()

const emit = defineEmits<{ (e: 'toggle-fav'): void }>()

const discipline = computed(() => getDisciplineIcon(props.detail.parentCategory))
const tags = computed(() => parseTags(props.detail.majorTags))

/** 学科门类 / 专业类 / 授予学位 三项；studyYears 有值才追加「学制」 */
const infoItems = computed(() => {
  const d = props.detail
  const items = [
    { icon: Layers, label: '学科门类', value: d.parentCategory },
    { icon: FolderTree, label: '专业类', value: d.majorCategory },
    { icon: GraduationCap, label: '授予学位', value: d.degreeAwarded },
  ]
  if (d.studyYears) items.push({ icon: Clock, label: '学制', value: d.studyYears })
  return items
})
</script>

<template>
  <section class="major-hero" :style="{ '--hero-bg-url': `url(${HERO_BG_URL})` }">
    <div class="major-hero__left">
      <span
        class="major-hero__icon"
        :style="{ backgroundColor: discipline.bg, boxShadow: `0 0 0 1px ${discipline.ring}`, color: discipline.fg }"
      >
        <component :is="discipline.icon" :size="28" :stroke-width="1.75" />
      </span>

      <div class="major-hero__main">
        <div class="major-hero__name-row">
          <h1 class="major-hero__name">{{ detail.majorName || PLACEHOLDER_DASH }}</h1>
          <template v-if="tags.length">
            <span
              v-for="tag in tags"
              :key="tag.text"
              class="hf-tag"
              :style="{ color: tag.fg, backgroundColor: tag.bg, '--tag-ring': tag.ring }"
            >{{ tag.text }}</span>
          </template>
        </div>

        <p class="major-hero__code hf-mono">{{ detail.majorCode || PLACEHOLDER_DASH }}</p>

        <div class="major-hero__info">
          <div v-for="item in infoItems" :key="item.label" class="major-hero__info-item">
            <component :is="item.icon" :size="15" :stroke-width="1.75" />
            <span class="major-hero__info-label">{{ item.label }}</span>
            <span class="major-hero__info-value">{{ item.value || PLACEHOLDER_DASH }}</span>
          </div>

          <!-- 收藏：元数据行末尾第 5 项，琥珀底高亮药丸，区别于普通元数据 -->
          <button
            type="button"
            class="major-hero__fav"
            :class="{ 'is-on': favorited, 'is-busy': favBusy }"
            :aria-pressed="favorited"
            :title="favorited ? '点击取消收藏' : '点击收藏该专业'"
            @click="emit('toggle-fav')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
            </svg>
            <span class="major-hero__fav-label">收藏</span>
            <span class="major-hero__fav-state">{{ favorited ? '已收藏' : '未收藏' }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 不使用 hf-card 类：避免其 background:#fff 与 Hero 的多层背景互相覆盖 */
.major-hero {
  --hero-bg-pos: center 62%;
  position: relative;
  display: flex;
  align-items: center;
  height: clamp(168px, 14vw, 200px);
  padding: 20px 28px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02), 0 4px 20px -2px rgba(15, 23, 42, 0.04);
  background-color: #eff6ff;
  background-image:
    linear-gradient(90deg, #f8fbff 0%, rgba(248, 251, 255, 0.94) 36%, rgba(248, 251, 255, 0) 72%),
    var(--hero-bg-url);
  background-position: center, var(--hero-bg-pos);
  background-size: auto, cover;
  background-repeat: no-repeat, no-repeat;
}
@media (max-width: 767px) {
  .major-hero {
    --hero-bg-pos: 75% 62%;
  }
}
.major-hero__left {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  max-width: 72%;
}
.major-hero__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  flex: none;
  border-radius: 16px;
}
.major-hero__main {
  min-width: 0;
}
.major-hero__name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.major-hero__name {
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: #0f172a;
}
.major-hero__code {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.4;
  color: #64748b;
}
.major-hero__info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 20px;
  margin-top: 14px;
}
.major-hero__info-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
}
.major-hero__info-label {
  font-size: 12px;
  line-height: 1.4;
  color: #64748b;
}
.major-hero__info-value {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: #1e293b;
}

/* ---------- 收藏药丸：元数据行末尾，琥珀底高亮，与普通元数据明显区分 ---------- */
.major-hero__fav {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 28px;
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
  color: #64748b;
  border: none;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.08);
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.major-hero__fav svg {
  width: 14px;
  height: 14px;
  color: #cbd5e1;
}

.major-hero__fav:hover {
  background: #fffbeb;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.3);
}

.major-hero__fav:hover svg {
  color: #d97706;
}

.major-hero__fav.is-on {
  color: #b45309;
  background: #fffbeb;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.35);
}

.major-hero__fav.is-on svg {
  color: #f59e0b;
  fill: currentColor;
}

.major-hero__fav.is-on .major-hero__fav-label,
.major-hero__fav.is-on .major-hero__fav-state {
  color: #b45309;
}

.major-hero__fav.is-busy {
  opacity: 0.65;
  pointer-events: none;
}

@media (max-width: 767px) {
  .major-hero {
    /* 元数据第 5 项加入后允许内容撑开，避免固定高度裁切 */
    height: auto;
    min-height: 168px;
  }
  .major-hero__fav-label,
  .major-hero__fav-state {
    /* 移动端只保留星标，减小占位 */
    display: none;
  }
  .major-hero__fav {
    padding: 4px;
  }
}
@media (max-width: 767px) {
  .major-hero {
    padding: 16px 18px;
  }
  .major-hero__left {
    max-width: 100%;
  }
  .major-hero__name {
    font-size: 20px;
  }
  .major-hero__info {
    gap: 8px 14px;
    margin-top: 10px;
  }
}
</style>
