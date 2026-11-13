<script setup lang="ts">
/**
 * 城市详情页：本文件只负责取数与编排，展示拆到 detail/components/ 下的 9 个子组件。
 *
 * 沿用前三轮重构范式（Q4/Q13）：删除 motion-v 入场动画、橙渐变 / 紫色 / 实线橙框，
 * 改白卡 + 发丝边 + 3×14px 橙竖条；补面包屑、骨架、错误态、params 监听与请求竞态。
 * Q1 选 ①：快捷工具在详情页自建组件（复制 List.vue 的 4 项配置 + TODO），List.vue 零改动。
 * Q14：页面级 CSS 由 .page-city-detail 自建通用类，不跨模块借用其它页面前缀。
 */
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { getCityDetail } from '@/api/city'
import type { CityDetailVO } from '@/types/city'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'

import CityDetailHero from './detail/components/CityDetailHero.vue'
import CityStatBar from './detail/components/CityStatBar.vue'
import CityMetricCard from './detail/components/CityMetricCard.vue'
import CityIndustryCard from './detail/components/CityIndustryCard.vue'
import CityFuturePlanCard from './detail/components/CityFuturePlanCard.vue'
import CityQuickLookCard from './detail/components/CityQuickLookCard.vue'
import CityIndustryStructureCard from './detail/components/CityIndustryStructureCard.vue'
import CityQuickToolsCard from './detail/components/CityQuickToolsCard.vue'
import CityDetailSkeleton from './detail/components/CityDetailSkeleton.vue'
import { buildMetricSections } from './detail/utils'

import './detail/city-detail.css'

const route = useRoute()
const router = useRouter()
const { hidden: headerHidden } = useAutoHideHeader()

/** Q9：与前三轮详情页一致，导航抽屉收起时收掉 sticky 顶部空隙 */
const asideTop = computed(() => (headerHidden.value ? 8 : 76))

const loading = ref(false)
const detail = ref<CityDetailVO | null>(null)
const error = ref('')

/** 每次 loadAll 自增，只采纳最新一次响应（Q13 竞态） */
let requestId = 0

/** Q6：左栏 5 块结构相同的指标卡由配置驱动，另 2 块走专用组件 */
const sections = computed(() => (detail.value ? buildMetricSections(detail.value) : []))

async function loadAll() {
  const id = String(route.params.id ?? '')
  if (!id) {
    error.value = '城市ID不存在'
    detail.value = null
    return
  }

  const rid = ++requestId
  loading.value = true
  error.value = ''
  detail.value = null
  try {
    const res = await getCityDetail(id)
    if (rid !== requestId) return
    detail.value = res.data.data
  } catch (e) {
    if (rid !== requestId) return
    detail.value = null
    error.value = (e as Error)?.message || '获取城市详情失败'
  } finally {
    if (rid === requestId) loading.value = false
  }
}

/** Q13：7 处入口来源不同，有历史时返回上一页，无历史兜底城市列表 */
function goBack() {
  if (window.history.state?.back) {
    router.back()
  } else {
    void router.push('/city')
  }
}

/** Q13：从榜单 / 搜索跳到另一个城市时重取数并回到顶部 */
watch(
  () => route.params.id,
  () => {
    window.scrollTo(0, 0)
    void loadAll()
  },
)

onMounted(loadAll)
</script>

<template>
  <div class="page-city-detail">
    <div class="ct-container">
      <nav class="ct-breadcrumb" aria-label="面包屑">
        <button type="button" class="ct-back" @click="goBack">
          <ArrowLeft :size="15" :stroke-width="1.75" />
          返回上一级
        </button>
        <span class="ct-crumb-aux">城市库 / 城市详情</span>
      </nav>

      <template v-if="loading">
        <CityDetailSkeleton />
      </template>

      <template v-else-if="detail">
        <div class="ct-hero-wrap">
          <CityDetailHero :detail="detail" />
        </div>

        <div class="ct-stat-wrap">
          <CityStatBar :detail="detail" />
        </div>

        <div class="ct-grid">
          <!-- Q6：左栏 7 块全部保留、顺序不变、不去重、不新增模块 -->
          <div class="ct-left">
            <CityMetricCard :section="sections[0]" />
            <CityMetricCard :section="sections[1]" />
            <CityIndustryCard :detail="detail" />
            <CityMetricCard :section="sections[2]" />
            <CityMetricCard :section="sections[3]" />
            <CityMetricCard :section="sections[4]" />
            <CityFuturePlanCard :detail="detail" />
          </div>

          <!-- Q7：右栏 3 张卡，快捷工具放最下面 -->
          <aside class="ct-right" :style="{ top: `${asideTop}px` }">
            <CityQuickLookCard :detail="detail" />
            <CityIndustryStructureCard :detail="detail" />
            <CityQuickToolsCard />
          </aside>
        </div>
      </template>

      <div v-else class="ct-empty">
        <el-empty :description="error || '城市不存在或暂时无法加载'" />
        <RouterLink to="/city" class="ct-empty__btn">返回城市列表</RouterLink>
      </div>
    </div>
  </div>
</template>
