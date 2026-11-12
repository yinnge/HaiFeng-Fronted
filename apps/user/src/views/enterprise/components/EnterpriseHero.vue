<script setup lang="ts">
import { Building2 } from 'lucide-vue-next'
import { HERO_BG_URL, HERO_FEATURES, TONE_COLORS } from './utils'

/**
 * Hero：背景图走 JS 内联 url() 注入（--hero-bg-url），
 * 不写进 CSS 产物，避免中文路径被构建器改写。
 * 4 个特性项不可点击：无背景、无描边、无 pointer、无 hover。
 */
</script>

<template>
  <section class="ent-hero" :style="{ '--hero-bg-url': `url(${HERO_BG_URL})` }">
    <div class="ent-hero__left">
      <span class="ent-hero__icon">
        <Building2 :size="28" :stroke-width="1.75" />
      </span>
      <div class="ent-hero__main">
        <h1 class="ent-hero__title">企业探索 · 找到值得投简历的那家公司</h1>
        <p class="ent-hero__desc">
          汇集央企、国企、民企与外企，覆盖企业性质、企业类型、企业规模、主营业务与所在地，助你高效锁定目标公司、规划求职路径
        </p>
        <div class="ent-hero__features">
          <div v-for="item in HERO_FEATURES" :key="item.label" class="ent-hero__feature">
            <span
              class="ent-hero__feature-icon"
              :style="{ backgroundColor: TONE_COLORS[item.tone].bg, color: TONE_COLORS[item.tone].fg }"
            >
              <component :is="item.icon" :size="16" :stroke-width="1.75" />
            </span>
            <span class="ent-hero__feature-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 不挂 hf-card：避免其 background:#fff 与多层 Hero 背景互相覆盖 */
.ent-hero {
  --hero-bg-pos: center 62%;
  display: flex;
  align-items: center;
  height: clamp(176px, 14vw, 208px);
  padding: 24px 28px;
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
  .ent-hero {
    --hero-bg-pos: 75% 62%;
  }
}
.ent-hero__left {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  max-width: 76%;
  min-width: 0;
}
.ent-hero__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  flex: none;
  border-radius: 16px;
  background: #2563eb;
  color: #ffffff;
}
.ent-hero__main {
  min-width: 0;
}
.ent-hero__title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: #0f172a;
}
.ent-hero__desc {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
}
.ent-hero__features {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 16px;
}
.ent-hero__feature {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ent-hero__feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: none;
  border-radius: 8px;
}
.ent-hero__feature-label {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: #334155;
}
@media (max-width: 767px) {
  .ent-hero {
    padding: 18px;
  }
  .ent-hero__left {
    max-width: 100%;
  }
  .ent-hero__title {
    font-size: 22px;
  }
  .ent-hero__features {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 12px;
    margin-top: 12px;
  }
}
</style>
