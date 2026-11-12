<script setup lang="ts">
/**
 * 考研专业列表页：本文件只负责取数与编排，展示拆到 postgrad/components/ 下。
 * 接口、字段名、排序行为（不传排序参数）沿用旧页；
 * 本轮 Q2：考研专业详情改为独立页面，点击卡片 / 榜单行推 /postgrad-major/:id，弹窗已删除。
 */
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getPostgradMajorList, getPostgradMajorDisciplineCategories } from '@/api/postgrad-major'
import { addFavorite, removeFavorite, getFavoriteList, getFavoriteStatus } from '@/api/favorite'
import type { PostgradMajorListVO, PostgradMajorQueryDTO } from '@/types/postgrad-major'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'
import { useUserStore } from '@/store'
import { confirmLogin } from '@/utils/loginGuide'

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
const userStore = useUserStore()
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

// ==================== 收藏（favorite，targetType=postgrad_major） ====================
const FAV_TARGET_TYPE = 'postgrad_major' as const
/** 后端 BasePageQueryDTO.ids 的 @Size(max=200) 上限 */
const FAV_IDS_LIMIT = 200
/** 仅看收藏开关（toggle）：开启后只查已收藏的考研专业，再点退出回全部 */
const favOnly = ref(false)
/** 当前页已收藏的考研专业 id 集合（json-bigint 保证雪花 ID 为字符串） */
const favIds = ref<Set<string>>(new Set())

/**
 * 拉取全部已收藏考研专业 id（收藏视图用）。
 * /favorite/list 单次 size ≤100，后端 ids 上限 200 → 最多两页；取满即停并截断，避免 400。
 */
async function fetchAllFavIds(): Promise<string[]> {
  const ids: string[] = []
  const size = 100
  for (let page = 1; page <= 2; page++) {
    const res = await getFavoriteList({ page, size, targetType: FAV_TARGET_TYPE })
    const records = res.data.data?.records || []
    for (const r of records) ids.push(String(r.targetId))
    if (records.length < size) break
  }
  if (ids.length > FAV_IDS_LIMIT) {
    ElMessage.info('收藏较多，仅展示最近收藏的前 200 个考研专业')
  }
  return ids.slice(0, FAV_IDS_LIMIT)
}

/** 回填当前页星标状态（每页最多 10 条，/favorite/status 单次上限 100 → 一次即可；失败静默） */
async function refreshFavStatus(ids: string[]) {
  if (!userStore.isLoggedIn() || !ids.length) return
  try {
    const res = await getFavoriteStatus(FAV_TARGET_TYPE, ids.slice(0, 100))
    const next = new Set(favIds.value)
    for (const id of res.data.data || []) next.add(String(id))
    favIds.value = next
  } catch {
    /* 收藏状态回填失败忽略，星标保持默认灰色 */
  }
}

/** 未登录统一引导（复用全站 confirmLogin）；返回 true 表示已登录可继续 */
async function requireLogin(): Promise<boolean> {
  if (userStore.isLoggedIn()) return true
  userStore.setRedirectPath(router.currentRoute.value.fullPath)
  if (await confirmLogin('收藏功能需登录后使用，请先登录')) {
    router.push('/login')
  }
  return false
}

/** 「查看收藏」toggle：开启只查收藏专业，再点退出回全部列表 */
async function onToggleFavOnly() {
  if (!favOnly.value && !(await requireLogin())) return
  favOnly.value = !favOnly.value
  currentPage.value = 1
  fetchList()
}

/** 星标点击：收藏 / 取消收藏 */
async function onToggleFav(id: string) {
  if (!(await requireLogin())) return
  const idStr = String(id)
  const isFav = favIds.value.has(idStr)
  try {
    if (isFav) {
      await removeFavorite(FAV_TARGET_TYPE, idStr)
      const next = new Set(favIds.value)
      next.delete(idStr)
      favIds.value = next
      ElMessage.success('已取消收藏')
      // 收藏视图内取消：立即从列表移除并刷新当前页（当前页只剩此条时回退一页）
      if (favOnly.value) {
        if (list.value.length <= 1 && currentPage.value > 1) currentPage.value -= 1
        fetchList()
      }
    } else {
      await addFavorite(FAV_TARGET_TYPE, idStr)
      const next = new Set(favIds.value)
      next.add(idStr)
      favIds.value = next
      ElMessage.success('收藏成功')
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '收藏操作失败')
  }
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
    // 收藏视图：先取已收藏专业 id，再透传 ids 与其它筛选 AND 叠加（后端负责分页与 total）
    if (favOnly.value) {
      const ids = await fetchAllFavIds()
      if (id !== requestId) return
      // 无收藏 → 直接空页（后端空集合语义一致，省一次列表请求）
      if (!ids.length) {
        list.value = []
        total.value = 0
        return
      }
      params.ids = ids.join(',')
    }

    const res = await getPostgradMajorList(params)
    if (id !== requestId) return
    list.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
    // 回填当前页星标状态（不阻塞列表展示）
    void refreshFavStatus(list.value.map((i) => String(i.id)))
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
            :fav-only="favOnly"
            @search="handleSearch"
            @reset="handleReset"
            @filter-change="onFilterChange"
            @toggle-fav="onToggleFavOnly"
          />

          <PostgradMajorSkeleton v-if="loading" :count="pageSize" />

          <div v-else-if="error" class="pg-state">
            <p class="pg-state__text">{{ error }}</p>
            <button type="button" class="pg-state__btn" @click="fetchList">重试</button>
          </div>

          <div v-else-if="!list.length" class="pg-state">
            <el-empty :description="favOnly ? '暂无收藏的考研专业，在卡片右上角点亮星标即可收藏' : '暂无符合条件的考研专业'" />
            <button v-if="!favOnly" type="button" class="pg-state__btn" @click="handleReset">清除筛选</button>
          </div>

          <div v-else class="pg-card-grid">
            <PostgradMajorCard
              v-for="item in list"
              :key="item.id"
              :item="item"
              :favorited="favIds.has(String(item.id))"
              @open="showDetail"
              @toggle-fav="onToggleFav"
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
