<script setup lang="ts">
/**
 * 专业详情页：本文件只负责取数与编排，展示拆到 detail/components/ 下的 12 个子组件。
 * 数据契约、路由、VIP 门禁沿用旧页（详见 DESIGN.md §0 与 Q1/Q2 裁决）。
 */
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import {
  getMajorCompetitions,
  getMajorDetail,
  getMajorList,
  getMajorPostgradDirections,
} from '@/api/major'
import type { MajorDetailVO, MajorListVO } from '@/types/major'
import type { CompetitionBriefVO } from '@/types/certificate'
import type { PostgradMajorDirectionBriefVO } from '@/types/postgrad-major'
import { ElMessage } from 'element-plus'
import { addFavorite, removeFavorite, getFavoriteStatus } from '@/api/favorite'
import { useUserStore } from '@/store'
import { confirmLogin } from '@/utils/loginGuide'
import { useRechargeDialog } from '@/composables/useRechargeDialog'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'

import MajorHero from './detail/components/MajorHero.vue'
import MajorStatBar from './detail/components/MajorStatBar.vue'
import MajorOverview from './detail/components/MajorOverview.vue'
import MajorCoursesSkills from './detail/components/MajorCoursesSkills.vue'
import MajorCareer from './detail/components/MajorCareer.vue'
import MajorAiBanner from './detail/components/MajorAiBanner.vue'
import MajorDirections from './detail/components/MajorDirections.vue'
import MajorRelated from './detail/components/MajorRelated.vue'
import MajorCompetitions from './detail/components/MajorCompetitions.vue'
import MajorBasicInfo from './detail/components/MajorBasicInfo.vue'
import MajorGenderRatio from './detail/components/MajorGenderRatio.vue'
import MajorToolsCard from './detail/components/MajorToolsCard.vue'

import './detail/detail.css'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const recharge = useRechargeDialog()
const { hidden: headerHidden } = useAutoHideHeader()

const loading = ref(false)
const detail = ref<MajorDetailVO | null>(null)
const error = ref('')

const competitions = ref<CompetitionBriefVO[]>([])
const directions = ref<PostgradMajorDirectionBriefVO[]>([])
const related = ref<MajorListVO[]>([])
const compLoading = ref(false)
const directionLoading = ref(false)
const relatedLoading = ref(false)

const isPro = computed(() => userStore.userInfo?.memberType === 'vip')

// ==================== 收藏（favorite，targetType=major） ====================
const FAV_TARGET_TYPE = 'major' as const
/** 当前专业是否已收藏 */
const favOn = ref(false)
const favSubmitting = ref(false)

/** 已登录时回填当前专业的收藏状态（失败按未收藏处理） */
async function loadFavStatus() {
  if (!userStore.isLoggedIn() || !detail.value) return
  try {
    const id = route.params.id as string
    const res = await getFavoriteStatus(FAV_TARGET_TYPE, [id])
    favOn.value = (res.data.data || []).map(String).includes(String(id))
  } catch {
    /* 状态回填失败忽略 */
  }
}

/** 星标切换：收藏 / 取消收藏（未登录走全站统一登录引导） */
async function toggleFavorite() {
  if (!userStore.isLoggedIn()) {
    userStore.setRedirectPath(route.fullPath)
    if (await confirmLogin('收藏功能需登录后使用，请先登录')) {
      router.push('/login')
    }
    return
  }
  if (favSubmitting.value || !detail.value) return
  favSubmitting.value = true
  try {
    const id = route.params.id as string
    if (favOn.value) {
      await removeFavorite(FAV_TARGET_TYPE, id)
      favOn.value = false
      ElMessage.success('已取消收藏')
    } else {
      await addFavorite(FAV_TARGET_TYPE, id)
      favOn.value = true
      ElMessage.success('收藏成功')
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '收藏操作失败')
  } finally {
    favSubmitting.value = false
  }
}

/** Q12：与 FileLoadDetail.vue:69 一致，导航抽屉收起时把 sticky 顶部空隙收掉 */
const asideTop = computed(() => (headerHidden.value ? 8 : 76))

/** 竞赛与考研方向沿用旧页 VIP 门禁；size=100 满足后端 [10,100] 约束并一次取全 */
async function fetchCompetitions(id: string) {
  if (!isPro.value) return
  compLoading.value = true
  try {
    const res = await getMajorCompetitions(id, { page: 1, size: 100 })
    competitions.value = res.data.data.records ?? []
  } catch {
    competitions.value = []
  } finally {
    compLoading.value = false
  }
}

async function fetchDirections(id: string) {
  if (!isPro.value) return
  directionLoading.value = true
  try {
    const res = await getMajorPostgradDirections(id, { page: 1, size: 100 })
    directions.value = res.data.data.records ?? []
  } catch {
    directions.value = []
  } finally {
    directionLoading.value = false
  }
}

/**
 * Q3：无「相关专业」专用接口，复用 /list 的 majorCategory 筛选。
 * 后端不支持 parentCategory 入参，故在前端补过滤：同学科门类 + 排除自身 + 就业率降序取 6 个。
 */
async function fetchRelated(data: MajorDetailVO, id: string) {
  if (!data.majorCategory) {
    related.value = []
    return
  }
  relatedLoading.value = true
  try {
    const res = await getMajorList({
      page: 1,
      size: 10,
      majorType: '本科',
      majorCategory: data.majorCategory,
      sortBy: 'employmentRate',
      sortOrder: 'desc',
    })
    const records = res.data.data.records ?? []
    related.value = records
      .filter(
        (item) =>
          item.parentCategory === data.parentCategory &&
          item.majorName !== data.majorName &&
          item.majorCode !== data.majorCode &&
          item.id !== id,
      )
      .slice(0, 6)
  } catch {
    related.value = []
  } finally {
    relatedLoading.value = false
  }
}

async function loadAll() {
  const id = route.params.id as string
  if (!id) {
    error.value = '专业ID不存在'
    detail.value = null
    return
  }

  error.value = ''
  loading.value = true
  competitions.value = []
  directions.value = []
  related.value = []

  try {
    const res = await getMajorDetail(id)
    const data = res.data.data
    detail.value = data
    // 回填收藏状态（不阻塞详情展示）
    void loadFavStatus()
    // 附属数据失败不阻塞主详情展示，各自降级为空数组 → 对应模块整块隐藏
    await Promise.all([
      fetchCompetitions(id),
      fetchDirections(id),
      fetchRelated(data, id),
    ])
  } catch (e) {
    detail.value = null
    error.value = (e as Error)?.message || '获取专业详情失败'
  } finally {
    loading.value = false
  }
}

/** Q2：考研方向详情改为独立页面，点击推 /postgrad-major/:id（弹窗已删除） */
function showDirectionDetail(id: string) {
  void router.push(`/postgrad-major/${id}`)
}

onMounted(loadAll)

/** §7：从相关专业跳到另一个专业时重新取数并回到顶部 */
watch(
  () => route.params.id,
  () => {
    window.scrollTo(0, 0)
    // 切换专业时先清收藏态，loadAll 成功后会重新回填
    favOn.value = false
    void loadAll()
  },
)
</script>

<template>
  <div class="page-major-detail">
    <div class="detail-container">
      <nav class="detail-breadcrumb" aria-label="面包屑">
        <RouterLink to="/major" class="detail-back">
          <ArrowLeft :size="15" :stroke-width="1.75" />
          返回专业列表
        </RouterLink>
        <!-- Q6：辅助文字用 #64748B，不用 #94A3B8 -->
        <span class="detail-crumb-aux">专业库 / 专业详情</span>
      </nav>

      <!-- 加载中：与卡片布局一致的纯色骨架，避免出现孤立空阴影卡 -->
      <template v-if="loading">
        <div class="hf-skeleton detail-skeleton-hero" />
        <div class="hf-skeleton detail-skeleton-stat" />
        <div class="detail-grid">
          <div class="detail-left">
            <div v-for="n in 4" :key="n" class="hf-skeleton detail-skeleton-block" />
          </div>
          <div class="detail-right">
            <div class="hf-skeleton detail-skeleton-block" />
            <div class="hf-skeleton detail-skeleton-block--short" />
          </div>
        </div>
      </template>

      <template v-else-if="detail">
        <MajorHero
          :detail="detail"
          :favorited="favOn"
          :fav-busy="favSubmitting"
          @toggle-fav="toggleFavorite"
        />
        <MajorStatBar :detail="detail" />

        <div class="detail-grid">
          <div class="detail-left">
            <MajorOverview :detail="detail" />
            <MajorCoursesSkills
              :main-courses="detail.mainCourses"
              :knowledge-skills="detail.knowledgeSkills"
            />
            <MajorCareer :text="detail.careerProspect" />
            <MajorAiBanner />
            <MajorDirections
              :items="directions"
              :is-pro="isPro"
              :loading="directionLoading"
              @open-direction="showDirectionDetail"
              @open-recharge="recharge.open"
            />
            <MajorRelated :items="related" :loading="relatedLoading" />
            <MajorCompetitions
              :items="competitions"
              :is-pro="isPro"
              :loading="compLoading"
              @open-recharge="recharge.open"
            />
          </div>

          <aside class="detail-right" :style="{ top: `${asideTop}px` }">
            <MajorBasicInfo :detail="detail" />
            <MajorGenderRatio
              :male-ratio="detail.maleRatio"
              :female-ratio="detail.femaleRatio"
            />
            <MajorToolsCard />
          </aside>
        </div>
      </template>

      <div v-else class="detail-empty">
        <el-empty :description="error || '专业不存在或暂时无法加载'" />
        <RouterLink to="/major" class="detail-empty__btn">返回专业列表</RouterLink>
      </div>
    </div>
  </div>
</template>
