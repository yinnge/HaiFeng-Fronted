<script setup lang="ts">
import { computed } from 'vue'
import { Layers, MapPin, Mountain } from 'lucide-vue-next'
import type { CityDetailVO } from '@/types/city'
import {
  CITY_HERO_BG,
  CITY_TONES,
  PLACEHOLDER_DASH,
  formatBasic,
  formatNum,
  formatText,
} from '../utils'

const props = defineProps<{ detail: CityDetailVO }>()

/** 城市级别标签：沿用列表页 levelClass 的四色语义，但去掉紫色、改 6px 圆角 */
const levelTone = computed(() => {
  switch (props.detail.cityLevel) {
    case '直辖市': return CITY_TONES.red
    case '省会城市': return CITY_TONES.blue
    case '地级市': return CITY_TONES.green
    case '县级市': return CITY_TONES.amber
    default: return CITY_TONES.slate
  }
})

const infoItems = computed(() => [
  { icon: Layers, label: '行政区划代码', value: formatBasic(props.detail.adminCode || null) },
  { icon: MapPin, label: '城市级别', value: formatBasic(props.detail.cityLevel || null) },
  { icon: Mountain, label: '面积', value: formatNum(props.detail.area, 'km²') },
])
</script>

<template>
  <section class="city-hero" :style="{ '--hero-bg-url': `url(${CITY_HERO_BG})` }">
    <div class="city-hero__left">
      <span class="city-hero__icon">
        <MapPin :size="28" :stroke-width="1.75" />
      </span>

      <div class="city-hero__main">
        <div class="city-hero__name-row">
          <h1 class="city-hero__name">{{ detail.cityName || PLACEHOLDER_DASH }}</h1>
          <span
            v-if="detail.cityLevel"
            class="hf-tag"
            :style="{ color: levelTone.fg, backgroundColor: levelTone.bg, '--tag-ring': levelTone.ring }"
          >{{ detail.cityLevel }}</span>
        </div>

        <p class="city-hero__code hf-mono">{{ formatBasic(detail.adminCode || null) }}</p>
        <p class="city-hero__subtitle">{{ formatText(detail.subtitle || null) }}</p>
      </div>
    </div>

    <div class="city-hero__info">
      <div v-for="item in infoItems" :key="item.label" class="city-hero__info-item">
        <component :is="item.icon" :size="15" :stroke-width="1.75" />
        <span class="city-hero__info-label">{{ item.label }}</span>
        <span class="city-hero__info-value hf-mono">{{ item.value }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 不挂 hf-card：避免其 background:#fff 与多层 Hero 背景互相覆盖 */
.city-hero {
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
.city-hero__left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;
  max-width: 68%;
}
.city-hero__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  flex: none;
  border-radius: 16px;
  background: #eff6ff;
  color: #2563eb;
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.18);
}
.city-hero__main {
  min-width: 0;
}
.city-hero__name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}
.city-hero__name {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: #0f172a;
}
.city-hero__code {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: #475569;
}
.city-hero__subtitle {
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
.city-hero__info {
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
.city-hero__info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  line-height: 1.5;
}
.city-hero__info-item svg {
  flex: none;
  color: #64748b;
}
.city-hero__info-label {
  flex: 1;
  min-width: 0;
  color: #64748b;
}
.city-hero__info-value {
  flex: none;
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
  color: #1e293b;
}
@media (max-width: 1023px) {
  .city-hero__left {
    max-width: 100%;
  }
  .city-hero__info {
    display: none;
  }
}
@media (max-width: 767px) {
  .city-hero {
    --hero-bg-pos: 75% 62%;
    height: auto;
    min-height: 176px;
    padding: 18px;
  }
  .city-hero__name {
    font-size: 22px;
  }
  .city-hero__icon {
    width: 44px;
    height: 44px;
  }
  .city-hero__subtitle {
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }
}
</style>
