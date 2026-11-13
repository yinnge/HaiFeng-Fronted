<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'
import { TONE_COLORS, awardIcon, awardTone, type AwardItem } from '../utils'

defineProps<{
  awards: AwardItem[]
}>()
</script>

<template>
  <section v-if="awards.length" class="awards hf-card">
    <h2 class="hf-section-title">获奖信息</h2>
    <p class="awards__subtitle">奖项设置与评定方式</p>

    <div class="cd-award-list">
      <div v-for="item in awards" :key="item.title" class="cd-award">
        <span
          class="cd-award__icon"
          :style="{
            backgroundColor: TONE_COLORS[awardTone(item.title)].bg,
            color: TONE_COLORS[awardTone(item.title)].fg,
          }"
        >
          <component :is="awardIcon(item.title)" :size="15" :stroke-width="1.75" />
        </span>
        <div class="cd-award__body">
          <p class="cd-award__title">{{ item.title }}</p>
          <p v-if="item.content" class="cd-award__text">{{ item.content }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.awards {
  padding: 20px;
}
.awards__subtitle {
  margin: 6px 0 0 13px;
  font-size: 13px;
  line-height: 1.4;
  color: #64748b;
}
</style>
