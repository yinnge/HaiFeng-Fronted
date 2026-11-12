<script setup lang="ts">
import { VALUE_CARD_ICONS } from './utils'
</script>

<template>
  <section class="value-cards hf-card">
    <h2 class="hf-section-title">学术竞赛的价值</h2>
    <div class="value-cards__grid">
      <div v-for="item in VALUE_CARD_ICONS" :key="item.title" class="value-card">
        <span
          class="value-card__icon"
          :style="{ backgroundColor: item.bg, color: item.fg }"
        >
          <component :is="item.icon" :size="24" :stroke-width="1.75" />
        </span>
        <h3 class="value-card__title">{{ item.title }}</h3>
        <p class="value-card__desc">{{ item.desc }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.value-cards {
  padding: 20px;
}
.value-cards__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;
}
@media (max-width: 767px) {
  .value-cards__grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }
}
.value-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  border-radius: 14px;
  background: #f8fafc;
  text-align: center;
}
.value-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 14px;
}
.value-card__title {
  margin: 12px 0 0;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  color: #0f172a;
}
.value-card__desc {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}
</style>
