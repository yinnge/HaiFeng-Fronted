<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowUpRight, ChevronDown, LockKeyhole } from 'lucide-vue-next'
import type { PostgradMajorDirectionBriefVO } from '@/types/postgrad-major'
import { TONE_COLORS, buildDirectionGroups } from './utils'

const props = defineProps<{
  items: PostgradMajorDirectionBriefVO[]
  isPro: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'open-direction', id: string): void
  (e: 'open-recharge'): void
}>()

const expanded = ref(false)
/** 跨分组累计前 8 个；分组头 N 恒为该组真实总数 */
const groups = computed(() => buildDirectionGroups(props.items, 8, expanded.value))
const hasMore = computed(() => props.items.length > 8)
const blue = TONE_COLORS.blue
</script>

<template>
  <!-- 非 VIP：保留原有的升级引导；VIP 且数据为空：整块隐藏，不留空白卡 -->
  <section v-if="!isPro" class="directions hf-card">
    <h2 class="hf-section-title">考研与深造方向</h2>
    <div class="hf-vip-guide">
      <LockKeyhole :size="22" :stroke-width="1.75" :style="{ color: blue.fg }" />
      <span class="hf-vip-guide__title">开通 VIP 会员，查看可报考的考研方向</span>
      <span class="hf-vip-guide__desc">了解该本科专业可以报考哪些研究生专业</span>
      <button type="button" class="hf-vip-guide__btn" @click="emit('open-recharge')">立即升级</button>
    </div>
  </section>

  <section v-else-if="loading" class="directions hf-card">
    <h2 class="hf-section-title">考研与深造方向</h2>
    <div class="directions__skeleton">
      <span v-for="n in 6" :key="n" class="hf-skeleton" />
    </div>
  </section>

  <section v-else-if="items.length" class="directions hf-card">
    <h2 class="hf-section-title">考研与深造方向</h2>

    <div class="directions__groups">
      <div v-for="group in groups" :key="group.category" class="directions__group">
        <div class="directions__group-head">
          <span
            class="hf-tag"
            :style="{ color: blue.fg, backgroundColor: blue.bg, '--tag-ring': blue.ring }"
          >{{ group.category }}</span>
          <span class="directions__count">{{ group.total }} 个</span>
        </div>
        <div class="directions__items">
          <!-- 无对应详情路由：沿用旧页行为，点击打开 PostgradMajorDialog 弹窗 -->
          <button
            v-for="item in group.visible"
            :key="item.id"
            type="button"
            class="direction-link"
            @click="emit('open-direction', item.id)"
          >
            <span class="direction-link__label">{{ item.postgradMajorName }}</span>
            <ArrowUpRight :size="14" :stroke-width="1.75" class="direction-link__arrow" />
          </button>
        </div>
      </div>
    </div>

    <button v-if="hasMore" type="button" class="hf-more" @click="expanded = !expanded">
      {{ expanded ? '收起' : `查看更多（共 ${items.length} 个）` }}
      <ChevronDown
        :size="14"
        :stroke-width="2"
        class="hf-chevron"
        :class="{ 'is-open': expanded }"
      />
    </button>
  </section>
</template>

<style scoped>
.directions {
  padding: 20px;
}
.directions__skeleton {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.directions__skeleton .hf-skeleton {
  height: 34px;
}
.directions__groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.directions__group-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.directions__count {
  font-size: 12px;
  line-height: 1.4;
  color: #64748b;
}
.directions__items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.direction-link {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  max-width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}
.direction-link:hover {
  border-color: rgba(37, 99, 235, 0.35);
  color: #2563eb;
}
.direction-link__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.direction-link__arrow {
  flex: none;
  color: #334155;
  transition: transform 0.2s ease, color 0.2s ease;
}
.direction-link:hover .direction-link__arrow {
  transform: translateX(2px);
  color: #2563eb;
}
</style>
