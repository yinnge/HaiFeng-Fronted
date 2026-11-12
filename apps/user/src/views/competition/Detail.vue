<script setup lang="ts">
/**
 * 竞赛详情页：本文件只负责取数与编排，展示拆到 detail/components/ 下。
 * 接口沿用：
 * - GET /api/v1/app/competition/{id}/detail  需登录（路由守卫 requiresAuth）
 * - GET /api/v1/app/competition/{id}/majors  需 VIP（仅 vip，游客/普通会员/Pro 均无数据）
 * 数据要点（DB 实测）：
 * - basicInfo 的 title 只有 5 个固定值：竞赛简介/参赛对象/竞赛时间/官方网站/主办单位；
 *   「官方网站」content 为报名跳转 URL（100 条中 98 条是 https:// URL）。
 * - processGuide / awardsDisplay 后端结构均为 {title, content}（非 {step,desc} / {level,count}）。
 */
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink, type LocationQueryRaw } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCompetitionDetail, getCompetitionMajors } from '@/api/certificate'
import type { CompetitionDetailVO, CompetitionMajorBriefVO } from '@/types/certificate'
import { addFavorite, removeFavorite, getFavoriteStatus } from '@/api/favorite'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'
import { useRechargeDialog } from '@/composables/useRechargeDialog'
import { useUserStore } from '@/store'
import { MemberType } from '@haifeng/shared'

import CompetitionDetailHero from './detail/components/CompetitionDetailHero.vue'
import CompetitionDetailTabs from './detail/components/CompetitionDetailTabs.vue'
import CompetitionDetailPanels from './detail/components/CompetitionDetailPanels.vue'
import CompetitionSignupCard from './detail/components/CompetitionSignupCard.vue'
import CompetitionProcessCard from './detail/components/CompetitionProcessCard.vue'
import CompetitionAwardsCard from './detail/components/CompetitionAwardsCard.vue'
import CompetitionMajorsCard from './detail/components/CompetitionMajorsCard.vue'
import CompetitionToolsCard from './detail/components/CompetitionToolsCard.vue'
import {
  ASIDE_MAX_ITEMS,
  DEFAULT_TAB,
  buildTabQuery,
  extractOfficialSite,
  extractSummary,
  parseTab,
  toAwardItems,
  toBasicInfoItems,
  toProcessSteps,
  toPurposes,
  type CompetitionTabKey,
} from './detail/utils'

import './detail/detail.css'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const recharge = useRechargeDialog()
const { hidden: headerHidden } = useAutoHideHeader()

/** 与列表页一致，导航抽屉收起时把 sticky 顶部空隙收掉 */
const asideTop = computed(() => (headerHidden.value ? 8 : 76))

const loading = ref(false)
const detail = ref<CompetitionDetailVO | null>(null)
const error = ref('')
const activeTab = ref<CompetitionTabKey>(DEFAULT_TAB)

const majors = ref<CompetitionMajorBriefVO[]>([])
const majorsLoading = ref(false)

/** 收藏状态 */
const FAV_TARGET_TYPE = 'competition' as const
const favorited = ref(false)

/** 是否为 VIP（关联专业接口为 @RequireVip，只认 vip） */
const isVip = computed(() => userStore.userInfo?.memberType === MemberType.VIP)

const compId = computed(() => String(route.params.id ?? ''))

/* ---------- 派生数据 ---------- */

/** 官方网址（报名按钮跳转目标）；非 URL 时为 null */
const officialUrl = computed(() => extractOfficialSite(detail.value?.basicInfo ?? null))
/** 基本信息展示项（已剔除「官方网站」） */
const basicItems = computed(() => toBasicInfoItems(detail.value?.basicInfo ?? null))
/** 竞赛简介 → Hero 描述 */
const summary = computed(() => extractSummary(detail.value?.basicInfo ?? null))
/** 参赛对象 → Hero 元信息 */
const audience = computed(
  () => basicItems.value.find((i) => i.title === '参赛对象')?.content ?? '',
)
/** 竞赛时间 → Hero 元信息 */
const schedule = computed(
  () => basicItems.value.find((i) => i.title === '竞赛时间')?.content ?? '',
)
/** 赛事流程（右栏时间轴） */
const processSteps = computed(() => toProcessSteps(detail.value?.processGuide ?? null).slice(0, ASIDE_MAX_ITEMS))
/** 获奖信息（右栏） */
const awardItems = computed(() => toAwardItems(detail.value?.awardsDisplay ?? null).slice(0, ASIDE_MAX_ITEMS))
/** 赛事目的 */
const purposes = computed(() => toPurposes(detail.value?.purposes ?? null))

/* ---------- 取数 ---------- */

async function fetchDetail() {
  if (!compId.value) {
    error.value = '竞赛 ID 不存在'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await getCompetitionDetail(compId.value)
    detail.value = res.data.data
    // 回填收藏状态（失败静默，星标保持默认灰色）
    void refreshFavStatus()
  } catch (e: any) {
    error.value = e?.message || '获取竞赛详情失败'
    detail.value = null
  } finally {
    loading.value = false
  }
}

/**
 * 关联专业：@RequireVip 硬门槛，仅 VIP 可取。
 * 非 VIP 直接跳过请求（避免 403 噪音），前端由 CompetitionMajorsCard 渲染引导卡。
 */
async function fetchMajors() {
  if (!compId.value || !isVip.value) {
    majors.value = []
    return
  }
  majorsLoading.value = true
  try {
    const res = await getCompetitionMajors(compId.value, { page: 1, size: 10 })
    majors.value = res.data.data?.records ?? []
  } catch {
    // VIP 校验可能失败（403），静默降级为引导卡
    majors.value = []
  } finally {
    majorsLoading.value = false
  }
}

/** 回填当前竞赛的收藏状态 */
async function refreshFavStatus() {
  if (!userStore.isLoggedIn() || !compId.value) return
  try {
    const res = await getFavoriteStatus(FAV_TARGET_TYPE, [compId.value])
    favorited.value = (res.data.data || []).some((id) => String(id) === compId.value)
  } catch {
    /* 失败忽略，星标保持默认灰色 */
  }
}

/** 收藏 / 取消收藏 */
async function onToggleFav() {
  if (!userStore.isLoggedIn()) {
    ElMessage.warning('收藏功能需登录后使用')
    return
  }
  try {
    if (favorited.value) {
      await removeFavorite(FAV_TARGET_TYPE, compId.value)
      favorited.value = false
      ElMessage.success('已取消收藏')
    } else {
      await addFavorite(FAV_TARGET_TYPE, compId.value)
      favorited.value = true
      ElMessage.success('收藏成功')
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '收藏操作失败')
  }
}

/* ---------- Tab 与 URL 同步 ---------- */

/**
 * 写入 Tab 到 URL。
 * 用 buildTabQuery 只产出 {tab} 键，但合并进 route.query 的其余键，
 * 避免误删外部带入的参数（如分享链接上的 utm）。
 */
function writeTab() {
  const query: LocationQueryRaw = { ...route.query }
  const tabQuery = buildTabQuery(activeTab.value)
  if (tabQuery.tab) {
    query.tab = tabQuery.tab
  } else {
    delete query.tab
  }
  void router.replace({ path: route.path, query })
}

function onTabChange(tab: CompetitionTabKey) {
  if (tab === activeTab.value) return
  activeTab.value = tab
  writeTab()
}

/**
 * 外部 query 变化（浏览器前进/后退、分享链接进入）反向恢复 Tab。
 * 自己写入的那次会走到同一分支，但 next === activeTab.value 时直接跳过，不会成环。
 */
watch(
  () => route.query.tab,
  (raw) => {
    const next = parseTab({ tab: raw })
    if (next === activeTab.value) return
    activeTab.value = next
  },
)

/** 会员身份变化时重新拉关联专业（登录后立即可用） */
watch(isVip, () => {
  void fetchMajors()
})

onMounted(() => {
  activeTab.value = parseTab(route.query)
  void fetchDetail()
  void fetchMajors()
})
</script>

<template>
  <div class="page-competition-detail">
    <div class="cd-container">
      <!-- 骨架屏 -->
      <template v-if="loading && !detail">
        <div class="hf-skeleton" style="height: 200px; margin-bottom: 20px" />
        <div class="hf-skeleton" style="height: 480px" />
      </template>

      <!-- 错误态 -->
      <div v-else-if="error && !detail" class="cd-state">
        <p class="cd-state__text">{{ error }}</p>
        <button type="button" class="cd-state__btn" @click="router.back()">返回</button>
      </div>

      <template v-else-if="detail">
        <div class="cd-hero-wrap">
          <CompetitionDetailHero
            :comp-name="detail.compName || '竞赛详情'"
            :comp-level="detail.compLevel"
            :summary="summary"
            :audience="audience"
            :schedule="schedule"
            :favorited="favorited"
            @toggle-fav="onToggleFav"
          />
        </div>

        <div class="cd-grid">
          <div class="cd-left">
            <CompetitionDetailTabs
              :model-value="activeTab"
              @update:model-value="onTabChange"
            />

            <CompetitionDetailPanels
              :tab="activeTab"
              :basic-items="basicItems"
              :background="detail.background || ''"
              :purposes="purposes"
              :rules="detail.competitionRules || []"
              :scoring="detail.scoringCriteria || []"
              :awards="detail.awards || []"
              :awards-display="detail.awardsDisplay || []"
              :notices="detail.notices || []"
            />
          </div>

          <aside class="cd-right" :style="{ top: `${asideTop}px` }">
            <CompetitionSignupCard :official-url="officialUrl" />

            <CompetitionProcessCard :steps="processSteps" />

            <CompetitionAwardsCard :awards="awardItems" />

            <CompetitionMajorsCard
              :items="majors"
              :is-vip="isVip"
              :loading="majorsLoading"
              @upgrade="recharge.open()"
            />

            <CompetitionToolsCard />

            <!-- 右栏底部收口条 -->
            <div class="cd-aside-footer">
              <span class="cd-aside-footer__dot" />
              <span>报名与参赛细节以竞赛官方公告为准</span>
              <RouterLink class="cd-aside-footer__link" to="/competition">返回竞赛列表</RouterLink>
            </div>
          </aside>
        </div>
      </template>
    </div>
  </div>
</template>
