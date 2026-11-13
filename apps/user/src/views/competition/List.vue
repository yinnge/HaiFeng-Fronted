<script setup lang="ts">
/**
 * 竞赛列表页：本文件只负责取数与编排，展示拆到 components/ 下。
 * 接口沿用 /api/v1/app/competition/list（公开、免登录）；
 * 后端排序固定 sort_order DESC, created_at DESC，故列表头部即为「热门竞赛」。
 */
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCompetitionList } from '@/api/certificate'
import type { CompetitionListVO, CompetitionQueryDTO } from '@/types/certificate'
import { addFavorite, removeFavorite, getFavoriteList, getFavoriteStatus } from '@/api/favorite'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'
import { useUserStore } from '@/store'
import { confirmLogin } from '@/utils/loginGuide'

import CompetitionHero from './components/CompetitionHero.vue'
import CompetitionValueCards from './components/CompetitionValueCards.vue'
import CompetitionSearchCard from './components/CompetitionSearchCard.vue'
import CompetitionCard from './components/CompetitionCard.vue'
import CompetitionSkeleton from './components/CompetitionSkeleton.vue'
import CompetitionHotRank from './components/CompetitionHotRank.vue'
import CompetitionToolsCard from './components/CompetitionToolsCard.vue'
import {
  DEFAULT_LEVEL_OPTIONS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES,
  buildQuery,
  parseUrlState,
  stableQueryString,
  type UrlState,
} from './components/utils'

import './competition.css'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { hidden: headerHidden } = useAutoHideHeader()

/** 与列表页一致，导航抽屉收起时把 sticky 顶部空隙收掉 */
const asideTop = computed(() => (headerHidden.value ? 8 : 76))

const loading = ref(false)
const list = ref<CompetitionListVO[]>([])
const total = ref(0)
const error = ref('')
const currentPage = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const hotList = ref<CompetitionListVO[]>([])
const hotLoading = ref(false)
/** 竞赛级别下拉项：由接口数据动态聚合（后端 comp_level 无 CHECK 约束，取值不封闭） */
const levelOptions = ref<string[]>([...DEFAULT_LEVEL_OPTIONS])

/** 已提交的筛选（名称输入由回车/点搜索提交） */
const filters = reactive({
  compName: '',
  compLevel: '',
})
/** 名称输入态：回车或点搜索才查询 */
const nameInput = ref('')

let requestId = 0
let lastWrittenQuery = ''

function currentState(): UrlState {
  return {
    page: currentPage.value,
    size: pageSize.value,
    compName: filters.compName,
    compLevel: filters.compLevel,
  }
}

/**
 * URL 只写 4 个已知 key（page/size/compName/compLevel），天然不含收藏 ids（收藏态是会话态，不进 URL）。
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
  filters.compName = state.compName
  filters.compLevel = state.compLevel
  nameInput.value = state.compName
}

// ==================== 收藏（favorite，targetType=competition） ====================
const FAV_TARGET_TYPE = 'competition' as const
/** 后端 BasePageQueryDTO.ids 的 @Size(max=200) 上限 */
const FAV_IDS_LIMIT = 200
/** 仅看收藏开关（toggle）：开启后只查已收藏的竞赛，再点退出回全部 */
const favOnly = ref(false)
/** 当前页已收藏的竞赛 id 集合（json-bigint 保证雪花 ID 为字符串） */
const favIds = ref<Set<string>>(new Set())

/**
 * 拉取全部已收藏竞赛 id（收藏视图用）。
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
    ElMessage.info('收藏较多，仅展示最近收藏的前 200 个竞赛')
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

/** 「查看收藏」toggle：开启只查收藏竞赛，再点退出回全部列表 */
async function onToggleFavOnly() {
  if (!favOnly.value && !(await requireLogin())) return
  favOnly.value = !favOnly.value
  currentPage.value = 1
  writeUrl()
  void fetchList()
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

  const params: CompetitionQueryDTO = {
    page: currentPage.value,
    size: pageSize.value,
    compName: filters.compName || undefined,
    compLevel: filters.compLevel || undefined,
  }

  try {
    // 收藏视图：先取已收藏竞赛 id，再透传 ids 与其它筛选 AND 叠加（后端负责分页与 total）
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

    const res = await getCompetitionList(params)
    if (id !== requestId) return
    list.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
    // 回填当前页星标状态（不阻塞列表展示）
    void refreshFavStatus(list.value.map((i) => String(i.id)))
  } catch (e) {
    if (id !== requestId) return
    error.value = (e as Error)?.message || '获取竞赛列表失败'
    list.value = []
    total.value = 0
  } finally {
    if (id === requestId) loading.value = false
  }
}

/**
 * 热门竞赛榜 + 竞赛级别下拉项：一次独立请求同时解决。
 *
 * 后端列表默认按 sort_order DESC 排序，故不带筛选的头部即为「热门」（sort_order 越大越靠前，
 * 即管理端配置的推荐权重）。独立请求，不随检索条件 / 分页联动 —— 热门是客观推荐位，
 * 不该被用户的临时筛选改写。
 *
 * size 有后端下限 @Min(10) / 上限 @Max(100)，故取 size=100：
 * - 前 5 条 → 热门竞赛榜
 * - 全部记录 → 聚合实际出现过的竞赛级别（后端 comp_level 是无 CHECK 的自由文本，取值不封闭）
 */
async function fetchHotAndLevels() {
  hotLoading.value = true
  try {
    const res = await getCompetitionList({ page: 1, size: 100 })
    const records = res.data.data.records ?? []
    hotList.value = records.slice(0, 5)
    collectLevelOptions(records)
  } catch {
    hotList.value = []
  } finally {
    hotLoading.value = false
  }
}

/**
 * 竞赛级别下拉项：从接口数据里动态聚合实际出现过的级别，
 * 与静态兜底（国家级/省级/校级）合并去重 —— 后端 comp_level 是无 CHECK 的自由文本，取值不封闭。
 */
function collectLevelOptions(records: CompetitionListVO[]) {
  const set = new Set<string>(DEFAULT_LEVEL_OPTIONS)
  for (const r of records) {
    const level = (r.compLevel ?? '').trim()
    if (level) set.add(level)
  }
  levelOptions.value = Array.from(set)
}

function handleSearch() {
  filters.compName = nameInput.value.trim().slice(0, 100)
  currentPage.value = 1
  writeUrl()
  void fetchList()
}

function handleReset() {
  filters.compName = ''
  filters.compLevel = ''
  nameInput.value = ''
  currentPage.value = 1
  writeUrl()
  void fetchList()
}

/** 级别下拉变更立即查询；等 defineModel 的 update 事件同步回 filters 后再读状态 */
async function onFilterChange() {
  await nextTick()
  currentPage.value = 1
  writeUrl()
  void fetchList()
}

function onPageChange(page: number) {
  currentPage.value = page
  writeUrl()
  void fetchList()
}

function onSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  writeUrl()
  void fetchList()
}

/** 推 /competition/:id（详情页带登录门禁，由路由守卫处理） */
function showDetail(id: string) {
  void router.push(`/competition/${id}`)
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
  restore(parseUrlState(route.query))
  writeUrl()
  void fetchList()
  void fetchHotAndLevels()
})
</script>

<template>
  <div class="page-competition-list">
    <div class="cp-container">
      <div class="cp-hero-wrap">
        <CompetitionHero />
      </div>

      <div class="cp-grid">
        <div class="cp-left">
          <CompetitionValueCards />

          <CompetitionSearchCard
            v-model:comp-name="nameInput"
            v-model:comp-level="filters.compLevel"
            :total="total"
            :level-options="levelOptions"
            :fav-only="favOnly"
            @search="handleSearch"
            @reset="handleReset"
            @filter-change="onFilterChange"
            @toggle-fav="onToggleFavOnly"
          />

          <CompetitionSkeleton v-if="loading" :count="pageSize" />

          <div v-else-if="error" class="cp-state">
            <p class="cp-state__text">{{ error }}</p>
            <button type="button" class="cp-state__btn" @click="fetchList">重试</button>
          </div>

          <div v-else-if="!list.length" class="cp-state">
            <el-empty :description="favOnly ? '暂无收藏的竞赛，在卡片右上角点亮星标即可收藏' : '暂无符合条件的竞赛'" />
            <button v-if="!favOnly" type="button" class="cp-state__btn" @click="handleReset">清除筛选</button>
          </div>

          <div v-else class="cp-card-grid">
            <CompetitionCard
              v-for="item in list"
              :key="item.id"
              :item="item"
              :favorited="favIds.has(String(item.id))"
              @open="showDetail"
              @toggle-fav="onToggleFav"
            />
          </div>

          <div v-if="!loading && !error && list.length && total > pageSize" class="cp-pager">
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

        <aside class="cp-right" :style="{ top: `${asideTop}px` }">
          <CompetitionHotRank :items="hotList" :loading="hotLoading" @open="showDetail" />
          <CompetitionToolsCard />
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 两列竞赛卡片网格 */
.cp-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: stretch;
}
@media (max-width: 767px) {
  .cp-card-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
