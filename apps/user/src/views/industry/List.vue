<script setup lang="ts">
/**
 * 行业列表页：本文件只负责取数与编排，展示拆到 components/ 下。
 * 接口沿用 /api/v1/app/industry/list（公开、免登录）+ /industry/categories。
 * 数据要点（DB 实测）：
 * - 行业共 90 条，category 为「字母 + 中文名」格式（如「C 制造业」），共 17 个门类。
 * - 后端 t_industry.icon_class 存 FontAwesome 类名但 C 端 VO 不返回，且 63/90 为 fa-industry，
 *   无区分度 → 图标改由前端按行业名关键词 + 类别两级映射（见 components/utils.ts）。
 * - 收藏：后端 FavoriteTargetType.INDUSTRY + IndustryFavoriteValidator 已就绪，零后端改动。
 */
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getIndustryList, getIndustryCategories } from '@/api/industry'
import type { IndustryListVO, IndustryQueryDTO } from '@/types/industry'
import { addFavorite, removeFavorite, getFavoriteList, getFavoriteStatus } from '@/api/favorite'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'
import { useUserStore } from '@/store'
import { confirmLogin } from '@/utils/loginGuide'

import IndustryHero from './components/IndustryHero.vue'
import IndustryCategoryBar from './components/IndustryCategoryBar.vue'
import IndustrySearchCard from './components/IndustrySearchCard.vue'
import IndustryCard from './components/IndustryCard.vue'
import IndustrySkeleton from './components/IndustrySkeleton.vue'
import IndustryHotRank from './components/IndustryHotRank.vue'
import IndustryToolsCard from './components/IndustryToolsCard.vue'
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES,
  buildQuery,
  parseUrlState,
  stableQueryString,
  type UrlState,
} from './components/utils'

import './industry.css'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { hidden: headerHidden } = useAutoHideHeader()

/** 与列表页一致，导航抽屉收起时把 sticky 顶部空隙收掉 */
const asideTop = computed(() => (headerHidden.value ? 8 : 76))

const loading = ref(false)
const list = ref<IndustryListVO[]>([])
const total = ref(0)
const error = ref('')
const currentPage = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
const categories = ref<string[]>([])
const hotList = ref<IndustryListVO[]>([])
const hotLoading = ref(false)

/** 已提交的筛选 */
const filters = reactive({
  category: '',
})
/** 名称输入态：回车或点搜索才查询 */
const nameInput = ref('')

let requestId = 0
let lastWrittenQuery = ''

function currentState(): UrlState {
  return {
    page: currentPage.value,
    size: pageSize.value,
    category: filters.category,
  }
}

/**
 * URL 只写 3 个已知 key（page/size/category），天然不含收藏 ids（收藏态是会话态，不进 URL）。
 * ⚠️ 后端 category 是精准匹配（eq），必须原样写回，不能只传首字母。
 */
function writeUrl() {
  const query = buildQuery(currentState())
  lastWrittenQuery = stableQueryString(query)
  void router.replace({ path: route.path, query })
}

function restore(state: UrlState) {
  currentPage.value = state.page
  pageSize.value = state.size
  filters.category = state.category
}

// ==================== 收藏（favorite，targetType=industry） ====================
const FAV_TARGET_TYPE = 'industry' as const
/** 后端 BasePageQueryDTO.ids 的 @Size(max=200) 上限 */
const FAV_IDS_LIMIT = 200
/** 仅看收藏开关（toggle）：开启后只查已收藏的行业，再点退出回全部 */
const favOnly = ref(false)
/** 当前页已收藏的行业 id 集合（json-bigint 保证雪花 ID 为字符串） */
const favIds = ref<Set<string>>(new Set())

/**
 * 拉取全部已收藏行业 id（收藏视图用）。
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
    ElMessage.info('收藏较多，仅展示最近收藏的前 200 个行业')
  }
  return ids.slice(0, FAV_IDS_LIMIT)
}

/** 回填当前页星标状态（每页最多 12 条，/favorite/status 单次上限 100 → 一次即可；失败静默） */
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

/** 「查看收藏」toggle：开启只查收藏行业，再点退出回全部列表 */
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

  const params: IndustryQueryDTO = {
    page: currentPage.value,
    size: pageSize.value,
    category: filters.category || undefined,
  }

  try {
    // 收藏视图：先取已收藏行业 id，再透传 ids 与其它筛选 AND 叠加（后端负责分页与 total）
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

    const res = await getIndustryList(params)
    if (id !== requestId) return
    list.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
    // 回填当前页星标状态（不阻塞列表展示）
    void refreshFavStatus(list.value.map((i) => String(i.id)))
  } catch (e) {
    if (id !== requestId) return
    error.value = (e as Error)?.message || '获取行业列表失败'
    list.value = []
    total.value = 0
  } finally {
    if (id === requestId) loading.value = false
  }
}

async function fetchCategories() {
  try {
    const res = await getIndustryCategories()
    categories.value = res.data.data ?? []
  } catch {
    categories.value = []
  }
}

/**
 * 热门行业榜：独立请求，不带任何筛选。
 * 榜单条目与顺序由接口动态返回（后端默认排序）；只有「热度数值」是前端伪造的固定值
 * （HOT_INDEX_BY_RANK，按排名位置取值），与竞赛页同款做法。
 */
async function fetchHotRank() {
  hotLoading.value = true
  try {
    const res = await getIndustryList({ page: 1, size: 10 })
    hotList.value = (res.data.data.records ?? []).slice(0, 5)
  } catch {
    hotList.value = []
  } finally {
    hotLoading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  writeUrl()
  void fetchList()
}

function handleReset() {
  filters.category = ''
  nameInput.value = ''
  currentPage.value = 1
  writeUrl()
  void fetchList()
}

/** 分类切换立即查询 */
function onCategoryChange(value: string) {
  if (value === filters.category) return
  filters.category = value
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

/** 推 /industry/:id（详情页带登录门禁，由路由守卫处理） */
function showDetail(id: string) {
  void router.push(`/industry/${id}`)
}

/** 外部 query 变化（浏览器前进/后退、分享链接）反向恢复；自己写的那次跳过 */
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
  void fetchCategories()
  void fetchHotRank()
})
</script>

<template>
  <div class="page-industry-list">
    <div class="ind-container">
      <div class="ind-hero-wrap">
        <IndustryHero />
      </div>

      <div class="ind-grid">
        <div class="ind-left">
          <IndustryCategoryBar
            :categories="categories"
            :model-value="filters.category"
            @update:model-value="onCategoryChange"
          />

          <IndustrySearchCard
            v-model:name="nameInput"
            :total="total"
            :fav-only="favOnly"
            @search="handleSearch"
            @reset="handleReset"
            @toggle-fav="onToggleFavOnly"
          />

          <IndustrySkeleton v-if="loading" :count="pageSize" />

          <div v-else-if="error" class="ind-state">
            <p class="ind-state__text">{{ error }}</p>
            <button type="button" class="ind-state__btn" @click="fetchList">重试</button>
          </div>

          <div v-else-if="!list.length" class="ind-state">
            <el-empty :description="favOnly ? '暂无收藏的行业，在卡片右上角点亮星标即可收藏' : '暂无符合条件的行业'" />
            <button v-if="!favOnly" type="button" class="ind-state__btn" @click="handleReset">清除筛选</button>
          </div>

          <div v-else class="ind-card-grid">
            <IndustryCard
              v-for="item in list"
              :key="item.id"
              :item="item"
              :favorited="favIds.has(String(item.id))"
              @open="showDetail"
              @toggle-fav="onToggleFav"
            />
          </div>

          <div v-if="!loading && !error && list.length && total > pageSize" class="ind-pager">
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

        <aside class="ind-right" :style="{ top: `${asideTop}px` }">
          <IndustryHotRank :items="hotList" :loading="hotLoading" @open="showDetail" />

          <IndustryToolsCard />

          <!-- 右栏底部收口条 -->
          <div class="ind-aside-footer">
            <span class="ind-aside-footer__dot" />
            <span>行业数据随官方统计口径滚动更新</span>
            <RouterLink class="ind-aside-footer__link" to="/enterprise">查企业</RouterLink>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
