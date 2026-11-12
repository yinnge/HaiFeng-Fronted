<script setup lang="ts">
import { CalendarDays, Send, Trophy, Users } from 'lucide-vue-next'
import { HERO_BG_URL, TONE_COLORS, levelTag } from '../utils'

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
  <!-- 暖橙 Hero：品牌橙实心底 + 背景图透出，冷白画布衬托 -->
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
            class="hf-tag cd-hero__tag"
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
.cd-hero {
  position: relative;
  display: flex;
  align-items: center;
  min-height: clamp(180px, 15vw, 216px);
  padding: 28px 32px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(249, 115, 22, 0.16);
  box-shadow: 0 8px 24px -8px rgba(249, 115, 22, 0.28);
  background-color: #f97316;
  background-image:
    linear-gradient(100deg, rgba(249, 115, 22, 0.97) 0%, rgba(249, 115, 22, 0.92) 46%, rgba(234, 88, 12, 0.82) 74%, rgba(234, 88, 12, 0.62) 100%),
    var(--hero-bg-url);
  background-position: center, center 62%;
  background-size: cover, cover;
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
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
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
  color: #ffffff;
}
.cd-hero__desc {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.92);
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
.cd-hero__tag {
  background: rgba(255, 255, 255, 0.94) !important;
}
.cd-hero__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 100%;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.95);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cd-hero__meta-item svg {
  flex: none;
}

/* ===== 右上角收藏星标（与列表页同款） ===== */
.cd-hero__fav {
  position: absolute;
  top: 20px;
  right: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: rgba(255, 255, 255, 0.75);
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
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
}
.cd-hero__fav.is-on {
  color: #f59e0b;
  background: #ffffff;
}
.cd-hero__fav.is-on svg {
  fill: currentColor;
}
.cd-hero__fav:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

@media (max-width: 767px) {
  .cd-hero {
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
