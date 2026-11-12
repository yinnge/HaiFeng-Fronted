<script setup lang="ts">
/**
 * 企业列表页：本文件只负责取数与编排，展示拆到 components/ 下。
 * 接口沿用 /api/v1/app/enterprise/list（公开、免登录）+ /enterprise/types（企业类型去重）。
 * 后端排序固定 sort_order DESC, created_at DESC（DTO 无排序参数）。
 * 收藏（targetType=enterprise）：后端枚举 / Validator / page ids 过滤均已就绪，前端零后端改动。
 */
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getEnterpriseList, getEnterpriseTypes } from '@/api/enterprise'
import type { EnterpriseListVO, EnterpriseQueryDTO } from '@/types/enterprise'
import { addFavorite, removeFavorite, getFavoriteList, getFavoriteStatus } from '@/api/favorite'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'
import { useUserStore } from '@/store'
import { confirmLogin } from '@/utils/loginGuide'

import EnterpriseHero from './components/EnterpriseHero.vue'
import EnterpriseSearchCard from './components/EnterpriseSearchCard.vue'
import EnterpriseCard from './components/EnterpriseCard.vue'
import EnterpriseSkeleton from './components/EnterpriseSkeleton.vue'
import EnterpriseToolsCard from './components/EnterpriseToolsCard.vue'
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES,
  buildQuery,
  parseUrlState,
  stableQueryString,
  type UrlState,
} from './components/utils'

import './enterprise.css'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { hidden: headerHidden } = useAutoHideHeader()

/** 与竞赛/证书页一致，导航抽屉收起时把 sticky 顶部空隙收掉 */
const asideTop = computed(() => (headerHidden.value ? 8 : 76))

const loading = ref(false)
const list = ref<EnterpriseListVO[]>([])
const total = ref(0)
const error = ref('')
const currentPage = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
/** 企业类型下拉项：来自后端 /enterprise/types 接口（DB DISTINCT 去重，取值不封闭） */
const typeOptions = ref<string[]>([])

/** 已提交的筛选（名称 / 城市输入由回车或点搜索提交） */
const filters = reactive({
  enterpriseName: '',
  enterpriseNature: '',
  enterpriseType: '',
  cityName: '',
})
/** 名称 / 城市输入态：回车或点搜索才查询 */
const nameInput = ref('')
const cityInput = ref('')

let requestId = 0
let lastWrittenQuery = ''

function currentState(): UrlState {
  return {
    page: currentPage.value,
    size: pageSize.value,
    enterpriseName: filters.enterpriseName,
    enterpriseNature: filters.enterpriseNature,
    enterpriseType: filters.enterpriseType,
    cityName: filters.cityName,
  }
}

/**
 * URL 只写 6 个已知 key（page/size/enterpriseName/enterpriseNature/enterpriseType/cityName），
 * 天然不含收藏 ids（收藏态是会话态，不进 URL）。
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
  filters.enterpriseName = state.enterpriseName
  filters.enterpriseNature = state.enterpriseNature
  filters.enterpriseType = state.enterpriseType
  filters.cityName = state.cityName
  nameInput.value = state.enterpriseName
  cityInput.value = state.cityName
}

// ==================== 收藏（favorite，targetType=enterprise） ====================
const FAV_TARGET_TYPE = 'enterprise' as const
/** 后端 BasePageQueryDTO.ids 的 @Size(max=200) 上限 */
const FAV_IDS_LIMIT = 200
/** 仅看收藏开关（toggle）：开启后只查已收藏的企业，再点退出回全部 */
const favOnly = ref(false)
/** 当前页已收藏的企业 id 集合（json-bigint 保证雪花 ID 为字符串） */
const favIds = ref<Set<string>>(new Set())

/**
 * 拉取全部已收藏企业 id（收藏视图用）。
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
    ElMessage.info('收藏较多，仅展示最近收藏的前 200 家企业')
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

/** 「查看收藏」toggle：开启只查收藏企业，再点退出回全部列表 */
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
        void fetchList()
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

  const params: EnterpriseQueryDTO = {
    page: currentPage.value,
    size: pageSize.value,
    enterpriseName: filters.enterpriseName || undefined,
    enterpriseNature: filters.enterpriseNature || undefined,
    enterpriseType: filters.enterpriseType || undefined,
    cityName: filters.cityName || undefined,
  }

  try {
    // 收藏视图：先取已收藏企业 id，再透传 ids 与其它筛选 AND 叠加（后端负责分页与 total）
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

    const res = await getEnterpriseList(params)
    if (id !== requestId) return
    list.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
    // 回填当前页星标状态（不阻塞列表展示）
    void refreshFavStatus(list.value.map((i) => String(i.id)))
  } catch (e) {
    if (id !== requestId) return
    error.value = (e as Error)?.message || '获取企业列表失败'
    list.value = []
    total.value = 0
  } finally {
    if (id === requestId) loading.value = false
  }
}

/** 企业类型去重列表（后端 /enterprise/types，DB DISTINCT）；失败静默为空 */
async function fetchTypes() {
  try {
    const res = await getEnterpriseTypes()
    typeOptions.value = res.data.data ?? []
  } catch {
    typeOptions.value = []
  }
}

function handleSearch() {
  filters.enterpriseName = nameInput.value.trim().slice(0, 100)
  filters.cityName = cityInput.value.trim().slice(0, 20)
  currentPage.value = 1
  writeUrl()
  void fetchList()
}

function handleReset() {
  filters.enterpriseName = ''
  filters.enterpriseNature = ''
  filters.enterpriseType = ''
  filters.cityName = ''
  nameInput.value = ''
  cityInput.value = ''
  currentPage.value = 1
  writeUrl()
  void fetchList()
}

/** 性质 / 类型下拉变更立即查询；等 defineModel 的 update 事件同步回 filters 后再读状态 */
async function onFilterChange() {
  await nextTick()
  currentPage.value = 1
  writeUrl()
  void fetchList()
}

/** 热门城市药丸：填入城市并立即查询 */
function onPickCity(city: string) {
  filters.cityName = city
  cityInput.value = city
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

/**
 * 整卡点击 → 跳企业岗位列表。
 * 后端无 /enterprise/:id 路由，本轮不新增详情页；
 * query 参数带上卡片已知信息，岗位页可即时渲染，刷新/深链也能靠接口补齐。
 * 卡片统一 emit id（与竞赛/证书/考研三页一致），此处按 id 回查列表项。
 */
function openPositions(id: string) {
  const item = list.value.find((i) => String(i.id) === id)
  if (!item) return
  void router.push({
    path: `/enterprise/${item.id}/positions`,
    query: {
      name: item.enterpriseName,
      nature: item.enterpriseNature,
      city: item.cityName,
      logoUrl: item.logoUrl || '',
      region: item.region || '',
      scale: item.enterpriseScale || '',
      mainBusiness: item.mainBusiness || '',
    },
  })
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
  void fetchTypes()
})
</script>

<template>
  <div class="page-enterprise-list">
    <div class="ent-container">
      <div class="ent-hero-wrap">
        <EnterpriseHero />
      </div>

      <div class="ent-grid">
        <div class="ent-left">
          <EnterpriseSearchCard
            v-model:enterprise-name="nameInput"
            v-model:enterprise-nature="filters.enterpriseNature"
            v-model:enterprise-type="filters.enterpriseType"
            v-model:city-name="cityInput"
            :total="total"
            :type-options="typeOptions"
            :fav-only="favOnly"
            @search="handleSearch"
            @reset="handleReset"
            @filter-change="onFilterChange"
            @toggle-fav="onToggleFavOnly"
            @pick-city="onPickCity"
          />

          <EnterpriseSkeleton v-if="loading" :count="pageSize" />

          <div v-else-if="error" class="ent-state">
            <p class="ent-state__text">{{ error }}</p>
            <button type="button" class="ent-state__btn" @click="fetchList">重试</button>
          </div>

          <div v-else-if="!list.length" class="ent-state">
            <el-empty :description="favOnly ? '暂无收藏的企业，在卡片右上角点亮星标即可收藏' : '暂无符合条件的企业'" />
            <button v-if="!favOnly" type="button" class="ent-state__btn" @click="handleReset">清除筛选</button>
          </div>

          <div v-else class="ent-card-grid">
            <EnterpriseCard
              v-for="item in list"
              :key="item.id"
              :item="item"
              :favorited="favIds.has(String(item.id))"
              @open="openPositions"
              @toggle-fav="onToggleFav"
            />
          </div>

          <div v-if="!loading && !error && list.length && total > pageSize" class="ent-pager">
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

        <aside class="ent-right" :style="{ top: `${asideTop}px` }">
          <EnterpriseToolsCard />
        </aside>
      </div>
    </div>
  </div>
</template>
