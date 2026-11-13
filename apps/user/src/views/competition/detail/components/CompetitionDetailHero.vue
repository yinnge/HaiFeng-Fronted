<script setup lang="ts">
import { CalendarDays, Trophy, Users } from 'lucide-vue-next'
import { HERO_BG_URL, levelTag } from '../utils'

const props = defineProps<{
  compName: string
  compLevel?: string
  /** 竞赛简介（取自 basicInfo 的「竞赛简介」项） */
  summary?: string
  /** 参赛对象（取自 basicInfo 的「参赛对象」项） */
  audience?: string
  /** 竞赛时间（取自 basicInfo 的「竞赛时间」项） */
  schedule?: string
  /** 是否已收藏 */
  favorited?: boolean
}>()

const emit = defineEmits<{ (e: 'toggle-fav'): void }>()

const level = levelTag(props.compLevel)
</script>

<template>
  <!-- 冷白蓝 Hero：与竞赛列表页同款；右栏报名参赛卡保留暖橙焦点 -->
  <section class="cd-hero" :style="{ '--hero-bg-url': `url(${HERO_BG_URL})` }">
    <div class="cd-hero__left">
      <span class="cd-hero__icon">
        <Trophy :size="30" :stroke-width="1.75" />
      </span>
      <div class="cd-hero__main">
        <h1 class="cd-hero__title">{{ compName || '竞赛详情' }}</h1>
        <p v-if="summary" class="cd-hero__desc">{{ summary }}</p>
        <div class="cd-hero__meta">
          <span
            v-if="level.text"
            class="hf-tag"
            :style="{ color: level.fg, backgroundColor: level.bg, '--tag-ring': level.ring }"
          >{{ level.text }}</span>
          <span v-if="audience" class="cd-hero__meta-item">
            <Users :size="13" :stroke-width="1.75" />
            {{ audience }}
          </span>
          <span v-if="schedule" class="cd-hero__meta-item">
            <CalendarDays :size="13" :stroke-width="1.75" />
            {{ schedule }}
          </span>
        </div>
      </div>
    </div>

    <!-- 右上角收藏星标：与列表页同款（36px 灰星 → 黄星） -->
    <button
      type="button"
      class="cd-hero__fav"
      :class="{ 'is-on': favorited }"
      :aria-label="favorited ? '取消收藏该竞赛' : '收藏该竞赛'"
      :aria-pressed="favorited"
      :title="favorited ? '取消收藏' : '收藏'"
      @click="emit('toggle-fav')"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
      </svg>
    </button>
  </section>
</template>

<style scoped>
/* 冷白蓝 Hero：与列表页 .cp-hero 同款，不挂 hf-card 避免背景被覆盖 */
.cd-hero {
  --hero-bg-pos: center 62%;
  position: relative;
  display: flex;
  align-items: center;
  min-height: clamp(180px, 15vw, 216px);
  padding: 28px 32px;
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
.cd-hero__left {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  max-width: 78%;
  min-width: 0;
}
.cd-hero__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  flex: none;
  border-radius: 16px;
  background: #dbeafe;
  color: #1d4ed8;
  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.12);
}
.cd-hero__main {
  min-width: 0;
}
.cd-hero__title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: #0f172a;
}
.cd-hero__desc {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: #475569;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.cd-hero__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}
.cd-hero__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 100%;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: #475569;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cd-hero__meta-item svg {
  flex: none;
}

/* ===== 右上角收藏星标（冷白底变体） ===== */
.cd-hero__fav {
  position: absolute;
  top: 20px;
  right: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #64748b;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.08);
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}
.cd-hero__fav svg {
  width: 22px;
  height: 22px;
}
.cd-hero__fav:hover {
  color: #f59e0b;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.28);
}
.cd-hero__fav.is-on {
  color: #f59e0b;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.28);
}
.cd-hero__fav.is-on svg {
  fill: currentColor;
}
.cd-hero__fav:focus-visible {
  outline: 2px solid rgba(37, 99, 235, 0.5);
  outline-offset: 2px;
}

@media (max-width: 767px) {
  .cd-hero {
    --hero-bg-pos: 75% 62%;
    padding: 20px;
  }
  .cd-hero__left {
    max-width: 100%;
  }
  .cd-hero__title {
    font-size: 21px;
  }
  .cd-hero__fav {
    top: 14px;
    right: 14px;
    width: 36px;
    height: 36px;
  }
}
</style>
