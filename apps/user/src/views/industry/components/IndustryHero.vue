<script setup lang="ts">
import { BarChart3, Building2, Flame, TrendingUp, Users } from 'lucide-vue-next'
import { HERO_BG_URL, TONE_COLORS } from './utils'

/** 4 个不可点击的说明项：无背景、无描边、无 pointer、无 hover */
const features = [
  { icon: BarChart3, label: '行业规模', tone: TONE_COLORS.blue },
  { icon: TrendingUp, label: '增长趋势', tone: TONE_COLORS.green },
  { icon: Users, label: '人才需求', tone: TONE_COLORS.amber },
  { icon: Flame, label: '投资热度', tone: TONE_COLORS.red },
]
</script>

<template>
  <section class="ind-hero" :style="{ '--hero-bg-url': `url(${HERO_BG_URL})` }">
    <div class="ind-hero__left">
      <span class="ind-hero__icon">
        <Building2 :size="28" :stroke-width="1.75" />
      </span>
      <div class="ind-hero__main">
        <h1 class="ind-hero__title">行业趋势分析 · 洞察百业态势，规划职业未来</h1>
        <p class="ind-hero__desc">
          覆盖互联网/IT、金融、教育、医疗、制造业等主流行业，提供行业规模、增长趋势、人才需求、投资热度等数据，助您把握行业发展脉搏
        </p>
        <div class="ind-hero__features">
          <div v-for="item in features" :key="item.label" class="ind-hero__feature">
            <span
              class="ind-hero__feature-icon"
              :style="{ backgroundColor: item.tone.bg, color: item.tone.fg }"
            >
              <component :is="item.icon" :size="16" :stroke-width="1.75" />
            </span>
            <span class="ind-hero__feature-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ind-hero {
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
  .ind-hero {
    --hero-bg-pos: 75% 62%;
  }
}
.ind-hero__left {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  max-width: 78%;
  min-width: 0;
}
.ind-hero__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  flex: none;
  border-radius: 16px;
  background: #eff6ff;
  color: #2563eb;
}
.ind-hero__main {
  min-width: 0;
}
.ind-hero__title {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: #0f172a;
}
.ind-hero__desc {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
}
.ind-hero__features {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 16px;
}
.ind-hero__feature {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.ind-hero__feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: none;
  border-radius: 8px;
}
.ind-hero__feature-label {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: #334155;
}
@media (max-width: 767px) {
  .ind-hero {
    padding: 18px;
  }
  .ind-hero__left {
    max-width: 100%;
  }
  .ind-hero__title {
    font-size: 21px;
  }
  .ind-hero__features {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 12px;
    margin-top: 12px;
  }
}
</style>
