<script setup lang="ts">
import { computed } from 'vue'
import { BookOpen, Users, Wallet } from 'lucide-vue-next'
import MajorRateRing from '@/views/major/components/MajorRateRing.vue'
import type { MajorDetailVO } from '@/types/major'
import {
  PLACEHOLDER_NUMBER,
  TONE_COLORS,
  formatCourseCount,
  formatGraduateScale,
  formatSalaryRange,
  isMissingNumber,
} from './utils'

const props = defineProps<{ detail: MajorDetailVO }>()

/** 0 也按缺失处理（§1 统一占位规则）；null 时不渲染圆环，避免 MajorRateRing 内部画出「—」 */
const hasRate = computed(() => !isMissingNumber(props.detail.employmentRate))
const salary = computed(() => formatSalaryRange(props.detail.salaryMin, props.detail.salaryMax))
const courseCount = computed(() => formatCourseCount(props.detail.courseCount))
const scale = computed(() => formatGraduateScale(props.detail.graduateScale))

const amber = TONE_COLORS.amber
const blue = TONE_COLORS.blue
const slate = TONE_COLORS.slate
</script>

<template>
  <section class="stat-bar hf-card">
    <!-- ① 就业率 -->
    <div class="stat-item stat-item--rate">
      <MajorRateRing v-if="hasRate" :rate="detail.employmentRate" :size="52" :stroke="5" />
      <span v-else class="stat-item__icon stat-item__icon--rate" :style="{ backgroundColor: slate.bg, color: slate.fg }">
        <Users :size="20" :stroke-width="1.75" />
      </span>
      <div class="stat-item__text">
        <span class="stat-item__label">就业率</span>
        <span v-if="!hasRate" class="stat-item__placeholder">{{ PLACEHOLDER_NUMBER }}</span>
      </div>
    </div>

    <!-- ② 月薪范围 -->
    <div class="stat-item">
      <span class="stat-item__icon" :style="{ backgroundColor: amber.bg, color: amber.fg }">
        <Wallet :size="20" :stroke-width="1.75" />
      </span>
      <div class="stat-item__text">
        <span class="stat-item__label">月薪范围（元/月）</span>
        <strong v-if="salary" class="stat-item__number stat-item__number--amber">{{ salary }}</strong>
        <span v-else class="stat-item__placeholder">{{ PLACEHOLDER_NUMBER }}</span>
      </div>
    </div>

    <!-- ③ 开设课程 -->
    <div class="stat-item">
      <span class="stat-item__icon" :style="{ backgroundColor: blue.bg, color: blue.fg }">
        <BookOpen :size="20" :stroke-width="1.75" />
      </span>
      <div class="stat-item__text">
        <span class="stat-item__label">开设课程</span>
        <strong v-if="courseCount" class="stat-item__number stat-item__number--blue">
          {{ courseCount }}<small class="stat-item__unit">门</small>
        </strong>
        <span v-else class="stat-item__placeholder">{{ PLACEHOLDER_NUMBER }}</span>
      </div>
    </div>

    <!-- ④ 毕业生规模 -->
    <div class="stat-item">
      <span class="stat-item__icon" :style="{ backgroundColor: slate.bg, color: '#0f172a' }">
        <Users :size="20" :stroke-width="1.75" />
      </span>
      <div class="stat-item__text">
        <span class="stat-item__label">毕业生规模</span>
        <strong v-if="scale" class="stat-item__number stat-item__number--slate">
          {{ scale.text }}<small v-if="scale.unit" class="stat-item__unit">{{ scale.unit }}</small>
        </strong>
        <span v-else class="stat-item__placeholder">{{ PLACEHOLDER_NUMBER }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 提高特异性，确保 18px 圆角稳定覆盖页面级 .hf-card 的 16px */
.stat-bar.hf-card {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-radius: 18px;
  padding: 18px 8px;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 0 16px;
  border-left: 1px solid #f1f5f9;
}
.stat-item:first-child {
  border-left: 0;
}
.stat-item__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex: none;
  border-radius: 12px;
}
.stat-item__text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.stat-item__label {
  font-size: 12px;
  line-height: 1.4;
  color: #64748b;
}
.stat-item__number {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.stat-item__number--amber {
  color: #b45309;
}
.stat-item__number--blue {
  color: #2563eb;
}
.stat-item__number--slate {
  color: #0f172a;
}
.stat-item__unit {
  margin-left: 3px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}
.stat-item__placeholder {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: #64748b;
}
@media (max-width: 767px) {
  .stat-bar {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0;
    padding: 8px;
  }
  .stat-item {
    padding: 12px 10px;
    border-left: 0;
    border-top: 1px solid #f1f5f9;
  }
  .stat-item:nth-child(-n + 2) {
    border-top: 0;
  }
  .stat-item:nth-child(even) {
    border-left: 1px solid #f1f5f9;
  }
  .stat-item__number {
    font-size: 20px;
  }
}
</style>
