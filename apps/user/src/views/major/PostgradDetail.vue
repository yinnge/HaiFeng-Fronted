<script setup lang="ts">
/**
 * 考研专业详情页：由原 PostgradMajorDialog 弹窗改成独立页面（Q1/Q2）。
 * 本文件只负责取数与编排；展示拆到 postgrad-detail/components/ 下的子组件。
 *
 * 数据契约沿用弹窗：详情 + 关联本科专业 + 开设院校（后两块 VIP 门禁）。
 * Q10：根节点并列挂 .page-postgrad-detail / .page-postgrad-list，
 *      零改动复用列表页 postgrad.css 的通用类与 PostgradHotRank / PostgradToolsCard。
 */
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import {
  getPostgradMajorDetail,
  getPostgradMajorList,
  getPostgradMajorUndergraduateMajors,
  getUniversitiesByPostgradMajor,
} from '@/api/postgrad-major'
import type {
  PostgradMajorDetailVO,
  PostgradMajorListVO,
  UniversityBriefForPostgradVO,
} from '@/types/postgrad-major'
import type { UndergraduateMajorDirectionBriefVO } from '@/types/major'
import { useUserStore } from '@/store'
import { MemberType } from '@haifeng/shared'
import { useRechargeDialog } from '@/composables/useRechargeDialog'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'

import PostgradDetailHero from './postgrad-detail/components/PostgradDetailHero.vue'
import PostgradDetailSkeleton from './postgrad-detail/components/PostgradDetailSkeleton.vue'
import PostgradIntroCard from './postgrad-detail/components/PostgradIntroCard.vue'
import PostgradExamSubjects from './postgrad-detail/components/PostgradExamSubjects.vue'
import PostgradRequirements from './postgrad-detail/components/PostgradRequirements.vue'
import PostgradCrossExam from './postgrad-detail/components/PostgradCrossExam.vue'
import PostgradRelatedMajors from './postgrad-detail/components/PostgradRelatedMajors.vue'
import PostgradUniversities from './postgrad-detail/components/PostgradUniversities.vue'
import PostgradHotRank from './postgrad/components/PostgradHotRank.vue'
import PostgradToolsCard from './postgrad/components/PostgradToolsCard.vue'

import './postgrad/postgrad.css'
import './postgrad-detail/postgrad-detail.css'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const recharge = useRechargeDialog()
const { hidden: headerHidden } = useAutoHideHeader()

/** Q8：与列表页 / 本科专业详情页一致，导航抽屉收起时收掉 sticky 顶部空隙 */
const asideTop = computed(() => (headerHidden.value ? 8 : 76))
const isPro = computed(() => userStore.userInfo?.memberType === MemberType.VIP)

const loading = ref(false)
const detail = ref<PostgradMajorDetailVO | null>(null)
const error = ref('')

const undergraduateMajors = ref<UndergraduateMajorDirectionBriefVO[]>([])
const undergradLoading = ref(false)
const undergradTotal = ref(0)
const undergradPage = ref(1)
const undergradPageSize = ref(10)

const universities = ref<UniversityBriefForPostgradVO[]>([])
const universityLoading = ref(false)
const universityTotal = ref(0)
const universityPage = ref(1)
const universityPageSize = ref(10)
const universityCategory = ref('')

const hotList = ref<PostgradMajorListVO[]>([])
const hotLoading = ref(false)

/** 每次 loadAll 自增，所有请求只采纳最新一次响应（Q15 竞态） */
let requestId = 0
let hotRequested = false

function currentId(): string {
  return String(route.params.id ?? '')
}

function resetState() {
  detail.value = null
  error.value = ''
  undergraduateMajors.value = []
  undergradTotal.value = 0
  undergradPage.value = 1
  universities.value = []
  universityTotal.value = 0
  universityPage.value = 1
  universityCategory.value = ''
}

/** Q11 防御性空值处理：类型定义为必填，运行时仍可能被后端返回空值 */
async function fetchUndergraduateMajors(rid: number, id: string) {
  if (!isPro.value) return
  undergradLoading.value = true
  try {
    const res = await getPostgradMajorUndergraduateMajors(id, {
      page: undergradPage.value,
      size: undergradPageSize.value,
    })
    if (rid !== requestId) return
    undergraduateMajors.value = res.data.data.records ?? []
    undergradTotal.value = res.data.data.total ?? 0
  } catch {
    if (rid !== requestId) return
    undergraduateMajors.value = []
    undergradTotal.value = 0
  } finally {
    if (rid === requestId) undergradLoading.value = false
  }
}

async function fetchUniversities(rid: number, id: string) {
  if (!isPro.value) return
  universityLoading.value = true
  try {
    const res = await getUniversitiesByPostgradMajor(id, {
      page: universityPage.value,
      size: universityPageSize.value,
      category: universityCategory.value || undefined,
    })
    if (rid !== requestId) return
    universities.value = res.data.data.records ?? []
    universityTotal.value = res.data.data.total ?? 0
  } catch {
    if (rid !== requestId) return
    universities.value = []
    universityTotal.value = 0
  } finally {
    if (rid === requestId) universityLoading.value = false
  }
}

/** Q8：热门榜与当前专业无关，只请求一次；size=10 满足后端 @Min(10)，再 slice(0,5) */
async function fetchHotRank() {
  if (hotRequested) return
  hotRequested = true
  hotLoading.value = true
  try {
    const res = await getPostgradMajorList({ page: 1, size: 10, popularity: '热门' })
    hotList.value = (res.data.data.records ?? []).slice(0, 5)
  } catch {
    hotList.value = []
  } finally {
    hotLoading.value = false
  }
}

async function loadAll() {
  const id = currentId()
  if (!id) {
    error.value = '考研专业ID不存在'
    detail.value = null
    return
  }

  const rid = ++requestId
  resetState()
  loading.value = true
  try {
    const res = await getPostgradMajorDetail(id)
    if (rid !== requestId) return
    detail.value = res.data.data
    // 附属数据失败不阻塞主详情展示，各自降级为空数组
    await Promise.all([
      fetchUndergraduateMajors(rid, id),
      fetchUniversities(rid, id),
    ])
  } catch (e) {
    if (rid !== requestId) return
    detail.value = null
    error.value = (e as Error)?.message || '获取考研专业详情失败'
  } finally {
    if (rid === requestId) loading.value = false
  }
  if (!hotRequested) void fetchHotRank()
}

function onUndergradPageChange(page: number) {
  undergradPage.value = page
  void fetchUndergraduateMajors(requestId, currentId())
}
function onUndergradSizeChange(size: number) {
  undergradPageSize.value = size
  undergradPage.value = 1
  void fetchUndergraduateMajors(requestId, currentId())
}
function onUniversityPageChange(page: number) {
  universityPage.value = page
  void fetchUniversities(requestId, currentId())
}
function onUniversitySizeChange(size: number) {
  universityPageSize.value = size
  universityPage.value = 1
  void fetchUniversities(requestId, currentId())
}
function onCategoryChange(value: string) {
  universityCategory.value = value
  universityPage.value = 1
  void fetchUniversities(requestId, currentId())
}

/** Q8：右栏热门榜点击跳到另一个考研专业详情 */
function openHotMajor(id: string) {
  if (id === currentId()) return
  void router.push(`/postgrad-major/${id}`)
}

/** Q4：有历史时返回（可恢复列表筛选与滚动位置），无历史时兜底回列表 */
function goBack() {
  if (window.history.state?.back) {
    router.back()
  } else {
    void router.push('/postgrad-major')
  }
}

/** 开通 VIP 后无需刷新页面即可解锁两个关联列表 */
watch(isPro, (value) => {
  if (value && detail.value) {
    const id = currentId()
    void fetchUndergraduateMajors(requestId, id)
    void fetchUniversities(requestId, id)
  }
})

/** Q15：从热榜跳到另一个专业时重新取数并回到顶部 */
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
  <!-- Q10：并列挂列表页根类，零改动复用其通用样式与两个右栏组件 -->
  <div class="page-postgrad-detail page-postgrad-list">
    <div class="pg-container">
      <nav class="pgd-breadcrumb" aria-label="面包屑">
        <button type="button" class="pgd-back" @click="goBack">
          <ArrowLeft :size="15" :stroke-width="1.75" />
          返回上一级
        </button>
        <span class="pgd-crumb-aux">考研专业 / 专业详情</span>
      </nav>

      <template v-if="loading">
        <PostgradDetailSkeleton />
      </template>

      <template v-else-if="detail">
        <div class="pgd-hero-wrap">
          <PostgradDetailHero :detail="detail" />
        </div>

        <div class="pg-grid">
          <!-- Q5：不做 Tab，按弹窗区块结构全平铺 -->
          <div class="pg-left">
            <PostgradIntroCard :text="detail.introduction" />
            <PostgradExamSubjects :items="detail.examSubjects" />
            <PostgradRequirements :items="detail.admissionRequirements" />
            <PostgradCrossExam :detail="detail" />
            <PostgradRelatedMajors
              :items="undergraduateMajors"
              :is-pro="isPro"
              :loading="undergradLoading"
              :total="undergradTotal"
              :page="undergradPage"
              :page-size="undergradPageSize"
              @page-change="onUndergradPageChange"
              @size-change="onUndergradSizeChange"
              @open-recharge="recharge.open"
            />
            <PostgradUniversities
              :items="universities"
              :is-pro="isPro"
              :loading="universityLoading"
              :total="universityTotal"
              :page="universityPage"
              :page-size="universityPageSize"
              :category="universityCategory"
              @page-change="onUniversityPageChange"
              @size-change="onUniversitySizeChange"
              @category-change="onCategoryChange"
              @open-recharge="recharge.open"
            />
          </div>

          <aside class="pg-right" :style="{ top: `${asideTop}px` }">
            <PostgradHotRank :items="hotList" :loading="hotLoading" @open="openHotMajor" />
            <PostgradToolsCard />
          </aside>
        </div>
      </template>

      <div v-else class="pgd-empty">
        <el-empty :description="error || '考研专业不存在或暂时无法加载'" />
        <RouterLink to="/postgrad-major" class="pg-state__btn">返回考研专业列表</RouterLink>
      </div>
    </div>
  </div>
</template>
