<script setup lang="ts">
import { BookOpenCheck, FileText, ListChecks, Shuffle, UserCheck } from 'lucide-vue-next'
import { HERO_BG_URL, TONE_COLORS } from './utils'

/** 4 个不可点击的说明项：无背景、无描边、无 pointer、无 hover */
const features = [
  { icon: FileText, label: '专业介绍', tone: TONE_COLORS.blue },
  { icon: ListChecks, label: '考试科目', tone: TONE_COLORS.green },
  { icon: UserCheck, label: '报考条件', tone: TONE_COLORS.amber },
  { icon: Shuffle, label: '跨考难度', tone: TONE_COLORS.blue },
]
</script>

<template>
  <section class="postgrad-hero" :style="{ '--hero-bg-url': `url(${HERO_BG_URL})` }">
    <div class="postgrad-hero__left">
      <span class="postgrad-hero__icon">
        <BookOpenCheck :size="28" :stroke-width="1.75" />
      </span>
      <div class="postgrad-hero__main">
        <h1 class="postgrad-hero__title">考研专业全景 · 助你精准备考</h1>
        <p class="postgrad-hero__desc">
          覆盖学术学位与专业学位硕士研究生招生专业，提供专业介绍、考试科目、报考条件与跨考难度等信息
        </p>
        <div class="postgrad-hero__features">
          <div v-for="item in features" :key="item.label" class="postgrad-hero__feature">
            <span
              class="postgrad-hero__feature-icon"
              :style="{ backgroundColor: item.tone.bg, color: item.tone.fg }"
            >
              <component :is="item.icon" :size="16" :stroke-width="1.75" />
            </span>
            <span class="postgrad-hero__feature-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 不挂 hf-card：避免其 background:#fff 与多层 Hero 背景互相覆盖 */
.postgrad-hero {
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
  .postgrad-hero {
    --hero-bg-pos: 75% 62%;
  }
}
.postgrad-hero__left {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  max-width: 76%;
  min-width: 0;
}
.postgrad-hero__icon {
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
.postgrad-hero__main {
  min-width: 0;
}
.postgrad-hero__title {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: #0f172a;
}
.postgrad-hero__desc {
  margin: 6px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
}
.postgrad-hero__features {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 16px;
}
.postgrad-hero__feature {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.postgrad-hero__feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: none;
  border-radius: 8px;
}
.postgrad-hero__feature-label {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: #334155;
}
@media (max-width: 767px) {
  .postgrad-hero {
    padding: 18px;
  }
  .postgrad-hero__left {
    max-width: 100%;
  }
  .postgrad-hero__title {
    font-size: 22px;
  }
  .postgrad-hero__features {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 12px;
    margin-top: 12px;
  }
}
</style>
