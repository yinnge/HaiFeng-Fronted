<script setup lang="ts">
import { computed } from 'vue'
import { Banknote, MapPin } from 'lucide-vue-next'
import type { EnterprisePositionVO } from '@/types/enterprise'
import {
  PLACEHOLDER_REQUIREMENT,
  PLACEHOLDER_SALARY,
  educationTag,
  experienceTag,
  formatSalaryRange,
  normalizeTags,
  recruitmentTag,
  splitRequirements,
} from '../utils'

const props = defineProps<{
  position: EnterprisePositionVO
}>()

const recruitment = computed(() => recruitmentTag(props.position.recruitmentType))
const education = computed(() => educationTag(props.position.educationRequirement))
const experience = computed(() => experienceTag(props.position.workExperience))
const salary = computed(() => formatSalaryRange(props.position.salaryMin, props.position.salaryMax))
const tags = computed(() => normalizeTags(props.position.positionTags))
const requirements = computed(() => splitRequirements(props.position.positionRequirement))

/**
 * 地点：DB 里 province / city / work_location 三段都有值，且 work_location 通常是
 * 「省份 + 城市」的完整写法（如 山西 / 太原 / 山西省太原市），直接拼接会冗余。
 * 规则：优先用 work_location；它缺失时退回 province + city；两者都无则不显示。
 */
const location = computed(() => {
  const p = props.position
  const full = (p.workLocation ?? '').trim()
  if (full) return full
  const parts = [p.province, p.city]
    .map((v) => (v ?? '').trim())
    .filter(Boolean)
  return Array.from(new Set(parts)).join(' · ')
})
</script>

<template>
  <article class="hf-card pos-card">
    <header class="pos-card__head">
      <div class="pos-card__head-main">
        <h3 class="pos-card__name" :title="position.positionName">{{ position.positionName }}</h3>
        <div class="pos-card__tags">
          <span
            v-if="recruitment.text"
            class="hf-tag"
            :style="{ color: recruitment.fg, backgroundColor: recruitment.bg, '--tag-ring': recruitment.ring }"
          >{{ recruitment.text }}</span>
          <span
            v-if="education.text"
            class="hf-tag"
            :style="{ color: education.fg, backgroundColor: education.bg, '--tag-ring': education.ring }"
          >{{ education.text }}</span>
          <span
            v-if="experience.text"
            class="hf-tag"
            :style="{ color: experience.fg, backgroundColor: experience.bg, '--tag-ring': experience.ring }"
          >{{ experience.text }}</span>
        </div>
      </div>

      <div class="pos-card__head-side">
        <span v-if="salary" class="pos-card__salary">
          <Banknote :size="15" :stroke-width="1.75" class="pos-card__salary-icon" />
          {{ salary }}
        </span>
        <span v-else class="pos-card__salary pos-card__salary--empty">{{ PLACEHOLDER_SALARY }}</span>
        <span v-if="location" class="pos-card__location">
          <MapPin :size="13" :stroke-width="1.75" class="pos-card__location-icon" />
          {{ location }}
        </span>
      </div>
    </header>

    <div v-if="tags.length" class="pos-card__benefits">
      <span v-for="tag in tags" :key="tag" class="pos-card__benefit">{{ tag }}</span>
    </div>

    <div v-if="position.majorRequirement" class="pos-card__major">
      <span class="pos-card__major-label">专业要求</span>
      <span class="pos-card__major-text" :title="position.majorRequirement">
        {{ position.majorRequirement }}
      </span>
    </div>

    <div v-if="requirements.length" class="pos-card__require">
      <span class="pos-card__require-label">岗位要求</span>
      <ol class="pos-card__require-list">
        <li v-for="(item, index) in requirements" :key="index" class="pos-card__require-item">
          {{ item }}
        </li>
      </ol>
    </div>
    <p v-else class="pos-card__require-empty">{{ PLACEHOLDER_REQUIREMENT }}</p>
  </article>
</template>

<style scoped>
.pos-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.pos-card__head-main {
  min-width: 0;
  flex: 1;
}
.pos-card__name {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pos-card__tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.pos-card__head-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex: none;
  text-align: right;
}
/* 薪资：品牌橙 #C2410C（白底 5.18:1，达 AA），比品牌橙 #F97316 的 2.80:1 更清晰 */
.pos-card__salary {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  color: #c2410c;
  font-variant-numeric: tabular-nums;
}
.pos-card__salary--empty {
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
}
.pos-card__salary-icon {
  flex: none;
  color: #ea580c;
}
.pos-card__location {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  line-height: 1.5;
  color: #64748b;
}
.pos-card__location-icon {
  flex: none;
  color: #94a3b8;
}
.pos-card__benefits {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.pos-card__benefit {
  padding: 3px 9px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
}
.pos-card__major {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-top: 14px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f8fafc;
}
.pos-card__major-label {
  flex: none;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  color: #64748b;
}
.pos-card__major-text {
  min-width: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #334155;
  overflow-wrap: anywhere;
}
.pos-card__require {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
}
.pos-card__require-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  color: #64748b;
  margin-bottom: 8px;
}
.pos-card__require-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pos-card__require-item {
  font-size: 13px;
  line-height: 1.7;
  color: #475569;
  overflow-wrap: anywhere;
}
.pos-card__require-empty {
  margin: 14px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: #94a3b8;
}
@media (max-width: 767px) {
  .pos-card__head {
    flex-direction: column;
    gap: 10px;
  }
  .pos-card__head-side {
    align-items: flex-start;
    text-align: left;
  }
}
</style>
