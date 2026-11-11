<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ChevronRight, LockKeyhole } from 'lucide-vue-next'
import type { UniversityBriefForPostgradVO } from '@/types/postgrad-major'
import { PAGE_SIZES, TONE_COLORS } from '../../postgrad/components/utils'

defineProps<{
  items: UniversityBriefForPostgradVO[]
  isPro: boolean
  loading: boolean
  total: number
  page: number
  pageSize: number
  category: string
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'category-change', value: string): void
  (e: 'open-recharge'): void
}>()

/** 沿用弹窗的 11 项院校类型常量，不改接口契约 */
const categoryOptions = ['综合', '理工', '师范', '农林', '医药', '政法', '财经', '民族', '语言', '艺术', '体育']
const blue = TONE_COLORS.blue
</script>

<template>
  <section class="hf-card pgd-card">
    <h2 class="hf-section-title">开设院校</h2>

    <template v-if="isPro">
      <div class="pgd-toolbar">
        <span class="pgd-toolbar__label">院校类型</span>
        <el-select
          :model-value="category"
          placeholder="全部类型"
          clearable
          filterable
          class="pg-select pgd-select"
          popper-class="postgrad-select-popper"
          @change="emit('category-change', String($event ?? ''))"
        >
          <el-option v-for="option in categoryOptions" :key="option" :label="option" :value="option" />
        </el-select>
      </div>

      <div v-if="loading" class="pgd-list pgd-card__body">
        <span v-for="n in 3" :key="n" class="hf-skeleton pgd-skeleton-row" />
      </div>

      <nav v-else-if="items.length" class="pgd-list pgd-card__body" aria-label="开设院校列表">
        <RouterLink
          v-for="item in items"
          :key="item.id"
          :to="`/university/${item.id}`"
          class="pgd-row"
          :aria-label="`查看 ${item.name} 详情`"
        >
          <span class="pgd-row__name">{{ item.name }}</span>
          <span v-if="item.category" class="pgd-row__meta">{{ item.category }}</span>
          <ChevronRight :size="16" :stroke-width="1.75" class="pgd-row__arrow" />
        </RouterLink>
      </nav>

      <p v-else class="pgd-placeholder pgd-card__body">暂无开设院校数据</p>

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
      <span class="hf-vip-guide__title">开通 VIP 会员，查看开设该考研专业的院校列表</span>
      <span class="hf-vip-guide__desc">按院校类型筛选，快速定位目标院校</span>
      <button type="button" class="hf-vip-guide__btn" @click="emit('open-recharge')">立即升级</button>
    </div>
  </section>
</template>

<style scoped>
.pgd-select {
  width: 160px;
}
</style>
