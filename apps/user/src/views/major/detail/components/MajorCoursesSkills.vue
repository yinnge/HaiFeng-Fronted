<script setup lang="ts">
import { computed, ref } from 'vue'
import { BookOpen, ChevronDown, Lightbulb } from 'lucide-vue-next'
import { PLACEHOLDER_TEXT, TONE_COLORS } from './utils'

const props = defineProps<{
  mainCourses?: string[] | null
  knowledgeSkills?: string[] | null
}>()

const showAll = ref(false)
const courses = computed(() => props.mainCourses ?? [])
const skills = computed(() => props.knowledgeSkills ?? [])
const visibleCourses = computed(() => (showAll.value ? courses.value : courses.value.slice(0, 8)))
const hasMore = computed(() => courses.value.length > 8)

const blue = TONE_COLORS.blue
const green = TONE_COLORS.green
</script>

<template>
  <section class="courses hf-card">
    <div class="courses__split">
      <!-- 左 3fr：核心课程 -->
      <div class="courses__pane courses__pane--left">
        <h2 class="courses__title">
          <span class="courses__title-icon" :style="{ backgroundColor: blue.bg, color: blue.fg }">
            <BookOpen :size="16" :stroke-width="1.75" />
          </span>
          核心课程
        </h2>

        <p v-if="!courses.length" class="hf-placeholder">{{ PLACEHOLDER_TEXT }}</p>
        <template v-else>
          <div class="courses__grid">
            <span
              v-for="(course, index) in visibleCourses"
              :key="`${course}-${index}`"
              class="courses__item"
              :title="course"
            >
              <BookOpen :size="14" :stroke-width="1.75" class="courses__item-icon" />
              <span class="courses__item-text">{{ course }}</span>
            </span>
          </div>
          <button v-if="hasMore" type="button" class="hf-more" @click="showAll = !showAll">
            {{ showAll ? '收起' : `查看全部课程（共 ${courses.length} 门）` }}
            <ChevronDown
              :size="14"
              :stroke-width="2"
              class="hf-chevron"
              :class="{ 'is-open': showAll }"
            />
          </button>
        </template>
      </div>

      <!-- 右 2fr：知识技能 -->
      <div class="courses__pane courses__pane--right">
        <h2 class="courses__title">
          <span class="courses__title-icon" :style="{ backgroundColor: green.bg, color: green.fg }">
            <Lightbulb :size="16" :stroke-width="1.75" />
          </span>
          知识技能
        </h2>

        <p v-if="!skills.length" class="hf-placeholder">{{ PLACEHOLDER_TEXT }}</p>
        <div v-else class="courses__skills">
          <span v-for="(skill, index) in skills" :key="`${skill}-${index}`" class="courses__skill">
            {{ skill }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.courses {
  padding: 20px;
}
.courses__split {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 0;
}
.courses__pane {
  min-width: 0;
}
.courses__pane--left {
  padding-right: 20px;
}
.courses__pane--right {
  padding-left: 20px;
  border-left: 1px solid #f1f5f9;
}
.courses__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  color: #1e293b;
}
.courses__title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: none;
  border-radius: 8px;
}
.courses__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}
.courses__item {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 8px 10px;
  border-radius: 6px;
  background: #f8fafc;
  font-size: 13px;
  line-height: 1.4;
  color: #334155;
}
.courses__item-icon {
  flex: none;
  color: #2563eb;
}
.courses__item-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.courses__skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.courses__skill {
  padding: 4px 9px;
  border-radius: 6px;
  background: #ecfdf5;
  box-shadow: 0 0 0 1px rgba(5, 150, 105, 0.18);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  color: #047857;
}
@media (max-width: 767px) {
  .courses__split {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }
  .courses__pane--left {
    padding-right: 0;
  }
  .courses__pane--right {
    padding-left: 0;
    padding-top: 20px;
    border-left: 0;
    border-top: 1px solid #f1f5f9;
  }
  .courses__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
