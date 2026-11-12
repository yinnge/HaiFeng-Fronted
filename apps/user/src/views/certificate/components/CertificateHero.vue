<script setup lang="ts">
import { BadgeCheck } from 'lucide-vue-next'
import { HERO_BG_URL, HERO_FEATURES, TONE_COLORS } from './utils'

/**
 * Hero：背景图走 JS 内联 url() 注入（--hero-bg-url），
 * 不写进 CSS 产物，避免中文路径被构建器改写。
 * 4 个特性项不可点击：无背景、无描边、无 pointer、无 hover。
 */
</script>

<template>
  <section class="cert-hero" :style="{ '--hero-bg-url': `url(${HERO_BG_URL})` }">
    <div class="cert-hero__left">
      <span class="cert-hero__icon">
        <BadgeCheck :size="28" :stroke-width="1.75" />
      </span>
      <div class="cert-hero__main">
        <h1 class="cert-hero__title">职业技能证书大全 · 打造硬核职场竞争力</h1>
        <p class="cert-hero__desc">
          汇集计算机、财会、语言、工程、教师、医疗等各类职业资格证书，提供级别、适用专业、报名与考试安排、报考条件与官方查询入口，助你精准规划考证路径
        </p>
        <div class="cert-hero__features">
          <div v-for="item in HERO_FEATURES" :key="item.label" class="cert-hero__feature">
            <span
              class="cert-hero__feature-icon"
              :style="{ backgroundColor: TONE_COLORS[item.tone].bg, color: TONE_COLORS[item.tone].fg }"
            >
              <component :is="item.icon" :size="16" :stroke-width="1.75" />
            </span>
            <span class="cert-hero__feature-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 不挂 hf-card：避免其 background:#fff 与多层 Hero 背景互相覆盖 */
.cert-hero {
  --hero-bg-pos: center 62%;
  display: flex;
  align-items: center;
  height: clamp(176px, 14vw, 208px);
  padding: 24px 28px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02), 0 4px 20px -2px rgba(15, 23, 42, 0.04);
  background-color: #fff7ed;
  background-image:
    linear-gradient(90deg, #fffaf5 0%, rgba(255, 250, 245, 0.94) 36%, rgba(255, 250, 245, 0) 72%),
    var(--hero-bg-url);
  background-position: center, var(--hero-bg-pos);
  background-size: auto, cover;
  background-repeat: no-repeat, no-repeat;
}
@media (max-width: 767px) {
  .cert-hero {
    --hero-bg-pos: 75% 62%;
  }
}
.cert-hero__left {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  max-width: 76%;
  min-width: 0;
}
.cert-hero__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  flex: none;
  border-radius: 16px;
  background: #f97316;
  color: #ffffff;
}
.cert-hero__main {
  min-width: 0;
}
.cert-hero__title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: #0f172a;
}
.cert-hero__desc {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
}
.cert-hero__features {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 16px;
}
.cert-hero__feature {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.cert-hero__feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: none;
  border-radius: 8px;
}
.cert-hero__feature-label {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: #334155;
}
@media (max-width: 767px) {
  .cert-hero {
    padding: 18px;
  }
  .cert-hero__left {
    max-width: 100%;
  }
  .cert-hero__title {
    font-size: 22px;
  }
  .cert-hero__features {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 12px;
    margin-top: 12px;
  }
}
</style>
