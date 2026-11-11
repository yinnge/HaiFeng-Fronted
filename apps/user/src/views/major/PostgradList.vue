<script setup lang="ts">
/**
 * 考研专业列表页：本文件只负责取数与编排，展示拆到 postgrad/components/ 下。
 * 接口、字段名、排序行为（不传排序参数）沿用旧页；
 * 本轮 Q2：考研专业详情改为独立页面，点击卡片 / 榜单行推 /postgrad-major/:id，弹窗已删除。
 */
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPostgradMajorList, getPostgradMajorDisciplineCategories } from '@/api/postgrad-major'
import type { PostgradMajorListVO, PostgradMajorQueryDTO } from '@/types/postgrad-major'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'

import PostgradHero from './postgrad/components/PostgradHero.vue'
import PostgradDegreeTabs from './postgrad/components/PostgradDegreeTabs.vue'
import PostgradSearchCard from './postgrad/components/PostgradSearchCard.vue'
import PostgradMajorCard from './postgrad/components/PostgradMajorCard.vue'
import PostgradMajorSkeleton from './postgrad/components/PostgradMajorSkeleton.vue'
import PostgradHotRank from './postgrad/components/PostgradHotRank.vue'
import PostgradToolsCard from './postgrad/components/PostgradToolsCard.vue'
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES,
  buildQuery,
  parseUrlState,
  stableQueryString,
  type UrlState,
} from './postgrad/components/utils'

import './postgrad/postgrad.css'

const route = useRoute()
const router = useRouter()
const { hidden: headerHidden } = useAutoHideHeader()

/** Q8：与专业详情页一致，导航抽屉收起时把 sticky 顶部空隙收掉 */
const asideTop = computed(() => (headerHidden.value ? 8 : 76))

const loading = ref(false)
const list = ref<PostgradMajorListVO[]>([])
const total = ref(0)
const error = ref('')
const currentPage = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const activeDegree = ref('')
const disciplineOptions = ref<string[]>([])
const hotList = ref<PostgradMajorListVO[]>([])
const hotLoading = ref(false)
const tabsAnchor = ref<HTMLElement | null>(null)

/** 已提交的筛选（下拉直接绑定，名称/代码由 handleSearch 提交） */
const filters = reactive({
  name: '',
  code: '',
  disciplineCategory: '',
  popularity: '',
  difficulty: '',
})
/** 名称 / 代码输入态：回车或点搜索才查询 */
const nameInput = ref('')
const codeInput = ref('')

let requestId = 0
let lastWrittenQuery = ''
let hotRequested = false

function currentState(): UrlState {
  return {
    page: currentPage.value,
    size: pageSize.value,
    name: filters.name,
    code: filters.code,
    degreeType: activeDegree.value,
    disciplineCategory: filters.disciplineCategory,
    popularity: filters.popularity,
    difficulty: filters.difficulty,
  }
}

/**
 * URL 只写 8 个已知 key，天然不含 majorId（历史深链已在 onMounted 改道详情页），
 * 不必再单独 router.replace({query:{}}) 全量清空，筛选状态完整保留。
 * lastWrittenQuery 用于 watch 防循环（router.replace 会再次触发 route.query 变化）。
 */
function writeUrl() {
  const query = buildQuery(currentState())
  lastWrittenQuery = stableQueryString(query)
  void router.replace({ path: route.path, query })
}

function restore(state: UrlState) {
  currentPage.value = state.page
  pageSize.value = state.size
  activeDegree.value = state.degreeType
  filters.name = state.name
  filters.code = state.code
  filters.disciplineCategory = state.disciplineCategory
  filters.popularity = state.popularity
  filters.difficulty = state.difficulty
  nameInput.value = state.name
  codeInput.value = state.code
}

/** 竞态：每次请求带自增 id，只采纳最新一次响应 */
async function fetchList() {
  const id = ++requestId
  loading.value = true
  error.value = ''

  const params: PostgradMajorQueryDTO = {
    page: currentPage.value,
    size: pageSize.value,
    name: filters.name || undefined,
    code: filters.code || undefined,
    degreeType: activeDegree.value || undefined,
    disciplineCategory: filters.disciplineCategory || undefined,
    popularity: filters.popularity || undefined,
    difficulty: filters.difficulty || undefined,
  }

  try {
    const res = await getPostgradMajorList(params)
    if (id !== requestId) return
    list.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } catch (e) {
    if (id !== requestId) return
    error.value = (e as Error)?.message || '获取考研专业列表失败'
    list.value = []
    total.value = 0
  } finally {
    if (id === requestId) loading.value = false
  }
}

/** 学科门类枚举沿用现有接口，不改 */
async function fetchDisciplineCategories() {
  try {
    const res = await getPostgradMajorDisciplineCategories()
    disciplineOptions.value = res.data.data ?? []
  } catch {
    disciplineOptions.value = []
  }
}

/**
 * Q2：后端 BasePageQueryDTO 有 @Min(10)，规格的 size=5 必报 400，
 * 故用 size=10 再 slice(0,5)。仅挂载时请求一次，不随筛选 / tab / 分页联动。
 */
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

function handleSearch() {
  filters.name = nameInput.value.trim().slice(0, 100)
  filters.code = codeInput.value.trim().slice(0, 20)
  currentPage.value = 1
  writeUrl()
  void fetchList()
}

function handleReset() {
  filters.name = ''
  filters.code = ''
  filters.disciplineCategory = ''
  filters.popularity = ''
  filters.difficulty = ''
  activeDegree.value = ''
  nameInput.value = ''
  codeInput.value = ''
  currentPage.value = 1
  writeUrl()
  void fetchList()
}

/**
 * 三个下拉变更立即查询；名称、代码不在此列。
 * 等 defineModel 的 update 事件同步回 filters 后再读状态，避免拿到旧筛选值。
 */
async function onFilterChange() {
  await nextTick()
  currentPage.value = 1
  writeUrl()
  void fetchList()
}

function onDegreeChange(value: string) {
  if (value === activeDegree.value) return
  activeDegree.value = value
  currentPage.value = 1
  writeUrl()
  void fetchList()
}

function scrollToTabs() {
  if (!tabsAnchor.value) return
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  tabsAnchor.value.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
}

function onPageChange(page: number) {
  currentPage.value = page
  writeUrl()
  void fetchList()
  scrollToTabs()
}

function onSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  writeUrl()
  void fetchList()
  scrollToTabs()
}

/** Q2：详情改为独立页面，卡片与榜单行统一 push 到 /postgrad-major/:id */
function showDetail(id: string) {
  void router.push(`/postgrad-major/${id}`)
}

/** 外部 query 变化（浏览器前进/后退、其它页面带参进入）反向恢复；自己写的那次跳过 */
watch(
  () => route.query,
  (query) => {
    const normalized = buildQuery(parseUrlState(query))
    if (stableQueryString(normalized) === lastWrittenQuery) return
    restore(parseUrlState(query))
    lastWrittenQuery = stableQueryString(normalized)
    void fetchList()
  },
)

onMounted(() => {
  // Q3：兼容历史 ?majorId= 深链（外部书签 / 旧链接），直接改道新详情页，不再开弹窗
  const deepLinkId = typeof route.query.majorId === 'string' ? route.query.majorId : ''
  if (deepLinkId) {
    void router.replace({ name: 'PostgradMajorDetail', params: { id: deepLinkId } })
    return
  }
  restore(parseUrlState(route.query))
  writeUrl()
  void fetchList()
  void fetchDisciplineCategories()
  void fetchHotRank()
})
</script>

<template>
  <div class="page-postgrad-list">
    <div class="pg-container">
      <div class="pg-hero-wrap">
        <PostgradHero />
      </div>

      <div class="pg-grid">
        <div class="pg-left">
          <div ref="tabsAnchor" class="pg-tabs-anchor">
            <PostgradDegreeTabs
              :model-value="activeDegree"
              @update:model-value="onDegreeChange"
            />
          </div>

          <PostgradSearchCard
            v-model:name="nameInput"
            v-model:code="codeInput"
            v-model:discipline-category="filters.disciplineCategory"
            v-model:popularity="filters.popularity"
            v-model:difficulty="filters.difficulty"
            :total="total"
            :discipline-options="disciplineOptions"
            @search="handleSearch"
            @reset="handleReset"
            @filter-change="onFilterChange"
          />

          <PostgradMajorSkeleton v-if="loading" :count="pageSize" />

          <div v-else-if="error" class="pg-state">
            <p class="pg-state__text">{{ error }}</p>
            <button type="button" class="pg-state__btn" @click="fetchList">重试</button>
          </div>

          <div v-else-if="!list.length" class="pg-state">
            <el-empty description="暂无符合条件的考研专业" />
            <button type="button" class="pg-state__btn" @click="handleReset">清除筛选</button>
          </div>

          <div v-else class="pg-card-grid">
            <PostgradMajorCard
              v-for="item in list"
              :key="item.id"
              :item="item"
              @open="showDetail"
            />
          </div>

          <div v-if="!loading && !error && list.length && total > pageSize" class="pg-pager">
            <el-pagination
              background
              layout="prev, pager, next, sizes"
              :total="total"
              :page-sizes="[...PAGE_SIZES]"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="onPageChange"
              @size-change="onSizeChange"
            />
          </div>
        </div>

        <aside class="pg-right" :style="{ top: `${asideTop}px` }">
          <PostgradHotRank :items="hotList" :loading="hotLoading" @open="showDetail" />
          <PostgradToolsCard />
        </aside>
      </div>
    </div>
  </div>
</template>
