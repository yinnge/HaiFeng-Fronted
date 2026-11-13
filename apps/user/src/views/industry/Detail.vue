<script setup lang="ts">
/**
 * 行业详情页：本文件只负责取数与编排，展示拆到 detail/components/ 下（需求 Q12）。
 *
 * 接口：
 * - GET /api/v1/app/industry/{id}/detail    仅 @RequireLogin（路由守卫 requiresAuth）
 * - GET /api/v1/app/industry/list?ids=...   公开，补 category + description（需求 Q9）
 * - GET /api/v1/app/industry/enterprises    @RequireVip（需求 Q4）
 *
 * 数据要点（DB 实测 2026-11-13）：
 * - IndustryDetailVO 不含 id / category / description；category 与行业简介长文本只在列表 VO，
 *   故并发补一次 /industry/list?ids=，失败静默降级、不阻塞主详情。
 * - t_industry_detail 的 8 个 JSONB 90/90 全为 {}，两段描述全空，talentGap 全空；
 *   正文以主表 9 个概览指标为主体，JSONB 走「有值才渲染」的容错渲染器（需求 Q1 / Q11）。
 * - 关联表 t_enterprise_industry 当前 0 行，故 VIP 也大概率返回空，空态文案已明确。
 */
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from 'lucide-vue-next'
import { getIndustryDetail, getIndustryList } from '@/api/industry'
import { getIndustryEnterprises } from '@/api/enterprise'
import { addFavorite, removeFavorite, getFavoriteStatus } from '@/api/favorite'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'
import { useRechargeDialog } from '@/composables/useRechargeDialog'
import { useUserStore } from '@/store'
import { MemberType } from '@haifeng/shared'
import { confirmLogin } from '@/utils/loginGuide'
import type { IndustryDetailVO, IndustryListVO } from '@/types/industry'
import type { EnterpriseJumpVO } from '@/types/enterprise'

import IndustryDetailHero from './detail/components/IndustryDetailHero.vue'
import IndustryIntroCard from './detail/components/IndustryIntroCard.vue'
import IndustryMetricsCard from './detail/components/IndustryMetricsCard.vue'
import IndustryTrendCard from './detail/components/IndustryTrendCard.vue'
import IndustryDeepDataCard from './detail/components/IndustryDeepDataCard.vue'
import IndustrySameCategoryLink from './detail/components/IndustrySameCategoryLink.vue'
import IndustryTrendAsideCard from './detail/components/IndustryTrendAsideCard.vue'
import IndustryEnterpriseCard from './detail/components/IndustryEnterpriseCard.vue'
import IndustryDetailToolsCard from './detail/components/IndustryDetailToolsCard.vue'

import './detail/detail.css'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const recharge = useRechargeDialog()
const { hidden: headerHidden } = useAutoHideHeader()

/** 与列表页一致，导航抽屉收起时把 sticky 顶部空隙收掉 */
const asideTop = computed(() => (headerHidden.value ? 8 : 76))

const industryId = computed(() => String(route.params.id ?? ''))
const loading = ref(false)
const detail = ref<IndustryDetailVO | null>(null)
const error = ref('')

/** 列表 VO 补取：只用来拿 category 与 description（详情 VO 没有这两个字段） */
const brief = ref<IndustryListVO | null>(null)
const category = computed(() => brief.value?.category?.trim() || '')
const intro = computed(() => brief.value?.description?.trim() || '')

/* ---------- 收藏（需求 Q5；后端 INDUSTRY 枚举与 Validator 已就绪，零后端改动） ---------- */
const FAV_TARGET_TYPE = 'industry' as const
const favorited = ref(false)
const favBusy = ref(false)

/* ---------- 关联企业（需求 Q4） ---------- */
const isVip = computed(() => userStore.userInfo?.memberType === MemberType.VIP)
const enterprises = ref<EnterpriseJumpVO[]>([])
const entLoading = ref(false)

/* ---------- 取数 ---------- */

async function fetchDetail() {
  if (!industryId.value) {
    error.value = '行业 ID 不存在'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await getIndustryDetail(industryId.value)
    detail.value = res.data.data
    void refreshFavStatus()
  } catch (e: any) {
    error.value = e?.message || '获取行业详情失败'
    detail.value = null
  } finally {
    loading.value = false
  }
}

/**
 * 补取列表 VO：后端 IndustryServiceImpl.page() 支持 ids 过滤（BasePageQueryDTO.ids）。
 * 公开接口，失败只影响简介与门类，不阻塞主详情 → 静默降级（需求 Q9）。
 */
async function fetchBrief() {
  if (!industryId.value) return
  try {
    const res = await getIndustryList({ page: 1, size: 10, ids: industryId.value })
    brief.value = res.data.data?.records?.[0] ?? null
  } catch {
    brief.value = null
  }
}

/**
 * 关联企业：@RequireVip 硬门槛，非 VIP 直接跳过请求避免 403 噪音，由卡片渲染引导。
 * ⚠️ shared request 抛的是 Error（无 .response 字段），不能用 e.response.status 判 403。
 */
async function fetchEnterprises() {
  if (!industryId.value) return
  if (!isVip.value) {
    enterprises.value = []
    return
  }
  entLoading.value = true
  try {
    const res = await getIndustryEnterprises([industryId.value])
    enterprises.value = res.data.data?.[0]?.enterprises ?? []
  } catch {
    enterprises.value = []
  } finally {
    entLoading.value = false
  }
}

/** 回填收藏状态（失败静默，星标保持默认灰色） */
async function refreshFavStatus() {
  if (!userStore.isLoggedIn() || !industryId.value) return
  try {
    const res = await getFavoriteStatus(FAV_TARGET_TYPE, [industryId.value])
    favorited.value = (res.data.data || []).some((id) => String(id) === industryId.value)
  } catch {
    /* 忽略 */
  }
}

/** 收藏 / 取消收藏；未登录走全站 confirmLogin + 回跳 */
async function onToggleFav() {
  if (favBusy.value) return
  if (!userStore.isLoggedIn()) {
    userStore.setRedirectPath(router.currentRoute.value.fullPath)
    if (await confirmLogin('收藏功能需登录后使用，请先登录')) {
      router.push('/login')
    }
    return
  }
  favBusy.value = true
  try {
    if (favorited.value) {
      await removeFavorite(FAV_TARGET_TYPE, industryId.value)
      favorited.value = false
      ElMessage.success('已取消收藏')
    } else {
      await addFavorite(FAV_TARGET_TYPE, industryId.value)
      favorited.value = true
      ElMessage.success('收藏成功')
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '收藏操作失败')
  } finally {
    favBusy.value = false
  }
}

/** 三路并发：主详情 / 列表补取 / 关联企业，互不阻塞 */
function loadAll() {
  if (!industryId.value) {
    error.value = '行业 ID 不存在'
    return
  }
  brief.value = null
  enterprises.value = []
  favorited.value = false
  void fetchDetail()
  void fetchBrief()
  void fetchEnterprises()
}

onMounted(() => {
  loadAll()
})

/** 同路由换 id（如从热门榜连点不同行业）时重新取数 */
watch(industryId, (next, prev) => {
  if (next && next !== prev) loadAll()
})

/** 会员身份变化（登录后立即成为 VIP）时重新拉关联企业 */
watch(isVip, () => {
  void fetchEnterprises()
})
</script>

<template>
  <div class="page-industry-detail">
    <div class="idt-container">
      <nav class="idt-breadcrumb" aria-label="面包屑">
        <RouterLink to="/industry" class="idt-back">
          <ArrowLeft :size="15" :stroke-width="1.75" />
          返回行业列表
        </RouterLink>
        <span class="idt-crumb-aux">行业探索 / 行业详情</span>
      </nav>

      <!-- 加载骨架：与真实布局同构，避免出现孤立空阴影卡 -->
      <template v-if="loading && !detail">
        <div class="hf-skeleton idt-skeleton-hero" />
        <div class="idt-grid">
          <div class="idt-left">
            <div v-for="n in 3" :key="n" class="hf-skeleton idt-skeleton-block" />
          </div>
          <div class="idt-right">
            <div class="hf-skeleton idt-skeleton-block" />
            <div class="hf-skeleton idt-skeleton-block--short" />
          </div>
        </div>
      </template>

      <!-- 错误态：可重试 -->
      <div v-else-if="error && !detail" class="idt-state">
        <p class="idt-state__text">{{ error }}</p>
        <button type="button" class="idt-state__btn" @click="loadAll()">重新加载</button>
      </div>

      <template v-else-if="detail">
        <div class="idt-hero-wrap">
          <IndustryDetailHero
            :detail="detail"
            :category="category"
            :intro="intro"
            :favorited="favorited"
            @toggle-fav="onToggleFav"
          />
        </div>

        <div class="idt-grid">
          <div class="idt-left">
            <IndustryIntroCard
              :intro="intro"
              :detailed="detail.detailedDescription"
              :short="detail.shortDescription"
            />
            <IndustryMetricsCard :detail="detail" />
            <IndustryTrendCard :detail="detail" />
            <IndustryDeepDataCard :detail="detail" />
            <IndustrySameCategoryLink :category="category" />
          </div>

          <aside class="idt-right" :style="{ top: `${asideTop}px` }">
            <IndustryTrendAsideCard :detail="detail" />
            <IndustryEnterpriseCard
              :is-vip="isVip"
              :loading="entLoading"
              :items="enterprises"
              @upgrade="recharge.open()"
            />
            <IndustryDetailToolsCard />

            <div class="idt-aside-footer">
              <span class="idt-aside-footer__dot" />
              <span>数据仅供生涯规划参考</span>
              <RouterLink class="idt-aside-footer__link" to="/industry">返回行业列表</RouterLink>
            </div>
          </aside>
        </div>
      </template>
    </div>
  </div>
</template>
