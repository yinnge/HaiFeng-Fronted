<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronRight, LockKeyhole } from 'lucide-vue-next'
import type { UndergraduateMajorDirectionBriefVO } from '@/types/major'
import { PAGE_SIZES, TONE_COLORS } from '../../postgrad/components/utils'

const props = defineProps<{
  items: UndergraduateMajorDirectionBriefVO[]
  isPro: boolean
  loading: boolean
  total: number
  page: number
  pageSize: number
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'open-recharge'): void
}>()

/** 沿用弹窗分组逻辑：category 为空归「其他」，组内保持接口返回顺序 */
const groups = computed(() => {
  const map = new Map<string, UndergraduateMajorDirectionBriefVO[]>()
  for (const item of props.items) {
    const key = item.category?.trim() || '其他'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }))
})

const blue = TONE_COLORS.blue
</script>

<template>
  <section class="hf-card pgd-card">
    <h2 class="hf-section-title">关联本科专业</h2>

    <!-- VIP 门禁沿用弹窗：基础信息公开，本块仅 VIP 可见 -->
    <template v-if="isPro">
      <div v-if="loading" class="pgd-list pgd-card__body">
        <span v-for="n in 3" :key="n" class="hf-skeleton pgd-skeleton-row" />
      </div>

      <template v-else-if="groups.length">
        <div v-for="group in groups" :key="group.category" class="pgd-group">
          <div class="pgd-group__head">
            <span
              class="hf-tag"
              :style="{ color: blue.fg, backgroundColor: blue.bg, '--tag-ring': blue.ring }"
            >{{ group.category }}</span>
            <span class="pgd-group__count">{{ group.items.length }} 个</span>
          </div>
          <nav class="pgd-list" :aria-label="`${group.category}关联本科专业`">
            <RouterLink
              v-for="item in group.items"
              :key="item.id"
              :to="`/major/${item.id}`"
              class="pgd-row"
              :aria-label="`查看 ${item.majorName} 详情`"
            >
              <span class="pgd-row__name">{{ item.majorName }}</span>
              <ChevronRight :size="16" :stroke-width="1.75" class="pgd-row__arrow" />
            </RouterLink>
          </nav>
        </div>
      </template>

      <p v-else class="pgd-placeholder pgd-card__body">暂无关联本科专业数据</p>

      <!-- Q9：手写分页改为 el-pagination，复用列表页 .pg-pager 浅橙覆盖 -->
      <div v-if="total > pageSize" class="pg-pager">
        <el-pagination
          background
          layout="prev, pager, next, sizes"
          :total="total"
          :page-sizes="[...PAGE_SIZES]"
          :page-size="pageSize"
          :current-page="page"
          @current-change="emit('page-change', $event)"
          @size-change="emit('size-change', $event)"
        />
      </div>
    </template>

    <div v-else class="hf-vip-guide">
      <LockKeyhole :size="22" :stroke-width="1.75" :style="{ color: blue.fg }" />
      <span class="hf-vip-guide__title">开通 VIP 会员，查看可报考该考研方向的本科专业</span>
      <span class="hf-vip-guide__desc">了解该本科专业可以报考哪些研究生专业</span>
      <button type="button" class="hf-vip-guide__btn" @click="emit('open-recharge')">立即升级</button>
    </div>
  </section>
</template>
