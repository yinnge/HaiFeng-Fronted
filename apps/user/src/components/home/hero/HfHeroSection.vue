<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Sparkles, ShieldCheck } from 'lucide-vue-next'
import { useExpertContact } from '@/composables/useExpertContact'
import HfHeroSearch from './HfHeroSearch.vue'
import HfHeroCompass from './HfHeroCompass.vue'
import HfHeroChips from './HfHeroChips.vue'
import {
  HERO_BADGE_TEXT,
  HERO_TITLE,
  HERO_SUBTITLE,
  HERO_DATA_SOURCE,
  HERO_CTA,
  type HeroCta,
} from './hero.config'

const router = useRouter()
const expert = useExpertContact()

function onCta(c: HeroCta) {
  if (c.kind === 'route' && c.route) router.push(c.route)
  else if (c.kind === 'expert') expert.open()
}

/* 入场动效（§11）：mount 后下一帧置 entered，触发左栏 stagger 淡入 */
const reduce =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
const entered = ref(reduce)
onMounted(() => {
  if (!reduce) requestAnimationFrame(() => (entered.value = true))
})
</script>

<template>
  <section class="hf-hero" :class="{ 'is-entered': entered }">
    <!-- 背景统一交给页面级 fixed 网格层（home/index.vue 的 .bg-grid-aurora）：
         Hero 不自带任何底色/光斑，避免「里面有色、外面没色」的矩形硬切边（§9 无缝）。 -->
    <div class="hf-hero-inner">
      <div class="hf-hero-grid">
        <!-- 左栏：价值主张 + 搜索 + 引导 -->
        <div class="hf-hero-left">
          <span class="hf-badge">
            <Sparkles :size="14" :stroke-width="1.75" />
            {{ HERO_BADGE_TEXT }}
          </span>

          <h1 class="hf-title">
            {{ HERO_TITLE.prefix }}<br />
            <span class="hf-title-hl">{{ HERO_TITLE.highlight }}</span>
          </h1>

          <p class="hf-subtitle">{{ HERO_SUBTITLE }}</p>

          <p class="hf-source">
            <ShieldCheck :size="16" :stroke-width="1.75" />
            {{ HERO_DATA_SOURCE }}
          </p>

          <HfHeroSearch class="hf-search" />

          <HfHeroChips />

          <div class="hf-cta">
            <button
              v-for="(c, i) in HERO_CTA"
              :key="i"
              type="button"
              class="hf-cta-btn"
              :class="c.primary ? 'is-primary' : 'is-secondary'"
              @click="onCta(c)"
            >
              {{ c.label }}
            </button>
          </div>
        </div>

        <!-- 右栏：罗盘 -->
        <div class="hf-hero-right">
          <HfHeroCompass />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hf-hero {
  position: relative;
  /* 无背景、无装饰层、无 isolation：让页面级 fixed 网格背景连续贯穿，
     避免 Hero 矩形边界与下方区块之间出现可见接缝 / 色块硬切。 */
  background: transparent;
}

.hf-hero-inner {
  position: relative;
  padding: 40px 0 28px;
}

/* 主网格（§5）：左 1.05fr / 右 .95fr，垂直居中 */
.hf-hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 32px;
  align-items: center;
  min-height: 460px;
}

/* 左栏 */
.hf-hero-left {
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* 入场动效（§11）：左栏元素 fade-up stagger 60ms */
.hf-hero-left > * {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.32, 0.72, 0, 1);
}
.hf-hero.is-entered .hf-hero-left > * {
  opacity: 1;
  transform: none;
}
.hf-hero-left > *:nth-child(1) { transition-delay: 0ms; }
.hf-hero-left > *:nth-child(2) { transition-delay: 60ms; }
.hf-hero-left > *:nth-child(3) { transition-delay: 120ms; }
.hf-hero-left > *:nth-child(4) { transition-delay: 180ms; }
.hf-hero-left > *:nth-child(5) { transition-delay: 240ms; }
.hf-hero-left > *:nth-child(6) { transition-delay: 300ms; }
.hf-hero-left > *:nth-child(7) { transition-delay: 360ms; }
.hf-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9999px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.hf-title {
  margin: 16px 0 12px;
  font-size: clamp(30px, 3.4vw, 46px);
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
  text-align: left;
}
.hf-title-hl {
  background: linear-gradient(135deg, #f97316, #ea580c);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hf-subtitle {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #475569;
}
.hf-source {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 14px 0 0;
  font-size: 13px;
  color: #64748b;
}
.hf-source :deep(svg) {
  color: #059669;
}
.hf-search {
  margin-top: 20px;
}
.hf-cta {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}
.hf-cta-btn {
  height: 44px;
  padding: 0 22px;
  border-radius: 9999px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.hf-cta-btn.is-primary {
  border: none;
  color: #fff;
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 8px 20px rgba(249, 115, 22, 0.28);
}
.hf-cta-btn.is-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(249, 115, 22, 0.34);
}
.hf-cta-btn.is-secondary {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #334155;
}
.hf-cta-btn.is-secondary:hover {
  background: #fff;
  border-color: #cbd5e1;
}
.hf-cta-btn:active {
  /* 归 none 而不是 translateY(0)：后者仍是变换节点，文字会常驻合成层 */
  transform: none;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.22);
}

.hf-hero-right {
  display: flex;
  justify-content: center;
}

/* ============ 响应式（§12，P0 先保证单栏不退化为空白） ============ */
@media (max-width: 1023px) {
  .hf-hero-grid {
    grid-template-columns: 1fr;
    min-height: 0;
  }
  .hf-hero-right {
    display: none;
  }
}
@media (max-width: 640px) {
  .hf-hero-inner {
    padding: 28px 0 24px;
  }
  .hf-title {
    font-size: 28px;
  }
  .hf-hero-left {
    max-width: 100%;
  }
  .hf-search {
    max-width: 100%;
  }
  .hf-cta {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  .hf-cta-btn {
    width: 100%;
  }
  .hf-search :deep(.hf-input-wrap) {
    max-width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hf-cta-btn {
    transition: none;
  }
  .hf-hero-left > * {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
