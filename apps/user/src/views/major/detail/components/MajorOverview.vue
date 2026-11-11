<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type Component } from 'vue'
import { ChevronDown, ClipboardCheck, FileText, ListChecks, Target } from 'lucide-vue-next'
import type { MajorDetailVO } from '@/types/major'
import {
  PLACEHOLDER_TEXT,
  TONE_COLORS,
  isBlankText,
  type IconTone,
} from './utils'

const props = defineProps<{ detail: MajorDetailVO }>()

interface OverviewCard {
  key: string
  title: string
  icon: Component
  tone: IconTone
  text?: string
}

/** 第 4 项文案按 §5 固定为「学科要求」，不叫「选科要求」 */
const cards = computed<OverviewCard[]>(() => [
  { key: 'description', title: '专业描述', icon: FileText, tone: 'blue', text: props.detail.majorDescription },
  { key: 'objective', title: '培养目标', icon: Target, tone: 'green', text: props.detail.trainingObjective },
  { key: 'requirement', title: '培养要求', icon: ClipboardCheck, tone: 'amber', text: props.detail.trainingRequirement },
  { key: 'subject', title: '学科要求', icon: ListChecks, tone: 'blue', text: props.detail.subjectRequirement },
])

/**
 * 4 张子卡各自独立折叠：只有真实溢出才出现「查看更多」。
 * 与 useClampExpand 同思路，但这里一次测量多个节点；ResizeObserver 覆盖窗口 resize，
 * 数据变化（路由参数切换）后清空状态并重新测量。
 */
const bodyEls = ref<(HTMLElement | null)[]>([])
const expanded = ref<Record<string, boolean>>({})
const overflowing = ref<Record<string, boolean>>({})
let observer: ResizeObserver | null = null

function setBodyEl(el: unknown, index: number) {
  bodyEls.value[index] = (el as HTMLElement | null) ?? null
}

function measureAll() {
  cards.value.forEach((card, index) => {
    const el = bodyEls.value[index]
    if (!el || expanded.value[card.key]) return
    overflowing.value[card.key] = el.scrollHeight > el.clientHeight + 1
  })
}

function toggle(key: string) {
  expanded.value[key] = !expanded.value[key]
  if (!expanded.value[key]) void nextTick(measureAll)
}

onMounted(() => {
  void nextTick(() => {
    measureAll()
    if (typeof ResizeObserver === 'undefined') return
    observer = new ResizeObserver(() => measureAll())
    bodyEls.value.forEach((el) => el && observer!.observe(el))
  })
})

watch(
  () => cards.value.map((card) => card.text),
  () => {
    expanded.value = {}
    overflowing.value = {}
    void nextTick(measureAll)
  },
)

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <section class="overview hf-card">
    <h2 class="hf-section-title">专业概览</h2>
    <div class="overview__grid">
      <article v-for="(card, index) in cards" :key="card.key" class="overview__card">
        <div class="overview__head">
          <span
            class="overview__icon"
            :style="{ backgroundColor: TONE_COLORS[card.tone].bg, color: TONE_COLORS[card.tone].fg }"
          >
            <component :is="card.icon" :size="18" :stroke-width="1.75" />
          </span>
          <h3 class="overview__title">{{ card.title }}</h3>
        </div>

        <p v-if="isBlankText(card.text)" class="hf-placeholder">{{ PLACEHOLDER_TEXT }}</p>
        <template v-else>
          <!-- 沿用旧页纯文本 + pre-line 渲染方式，不改成 Markdown / v-html -->
          <p
            :ref="(el) => setBodyEl(el, index)"
            class="overview__body"
            :class="{ 'is-expanded': expanded[card.key] }"
          >{{ card.text }}</p>
          <button
            v-if="overflowing[card.key]"
            type="button"
            class="hf-more"
            @click="toggle(card.key)"
          >
            {{ expanded[card.key] ? '收起' : '查看更多' }}
            <ChevronDown
              :size="14"
              :stroke-width="2"
              class="hf-chevron"
              :class="{ 'is-open': expanded[card.key] }"
            />
          </button>
        </template>
      </article>
    </div>
  </section>
</template>

<style scoped>
.overview {
  padding: 20px;
}
.overview__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  align-items: start;
}
@media (min-width: 1600px) {
  .overview__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (max-width: 767px) {
  .overview__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
.overview__card {
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
  min-width: 0;
}
.overview__head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.overview__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex: none;
  border-radius: 12px;
}
.overview__title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
  color: #1e293b;
}
.overview__body {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: #475569;
  white-space: pre-line;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  overflow: hidden;
}
.overview__body.is-expanded {
  display: block;
  overflow: visible;
  -webkit-line-clamp: unset;
}
</style>
