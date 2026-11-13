<script setup lang="ts">
/**
 * 证书列表页：本文件只负责取数与编排，展示拆到 components/ 下。
 * 接口沿用 /api/v1/app/certificate/list（公开、免登录）+ /certificate/categories + /certificate/{id}/detail（需登录）。
 * 后端 C 端仅支持 category（精准）+ certName（模糊）两个筛选，无排序参数（固定 sort_order DESC, created_at DESC）。
 * 收藏（targetType=certificate）：后端枚举 / Validator / page ids 过滤均已就绪，前端零后端改动。
 */
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCertificateCategories, getCertificateList, getCertificateDetail } from '@/api/certificate'
import type { CertificateListVO, CertificateDetailVO, CertificateQueryDTO } from '@/types/certificate'
import { addFavorite, removeFavorite, getFavoriteList, getFavoriteStatus } from '@/api/favorite'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'
import { useUserStore } from '@/store'
import { confirmLogin } from '@/utils/loginGuide'

import CertificateHero from './components/CertificateHero.vue'
import CertificateSearchCard from './components/CertificateSearchCard.vue'
import CertificateCard from './components/CertificateCard.vue'
import CertificateSkeleton from './components/CertificateSkeleton.vue'
import CertificateToolsCard from './components/CertificateToolsCard.vue'
import CertificateDetailDialog from './components/CertificateDetailDialog.vue'
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZES,
  buildQuery,
  parseUrlState,
  stableQueryString,
  type UrlState,
} from './components/utils'

import './certificate.css'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { hidden: headerHidden } = useAutoHideHeader()

/** 与竞赛页一致，导航抽屉收起时把 sticky 顶部空隙收掉 */
const asideTop = computed(() => (headerHidden.value ? 8 : 76))

const loading = ref(false)
const list = ref<CertificateListVO[]>([])
const total = ref(0)
const error = ref('')
const currentPage = ref(1)
const pageSize = ref(DEFAULT_PAGE_SIZE)
/** 分类下拉项：来自后端 categories 接口（DB DISTINCT 去重，取值不封闭） */
const categoryOptions = ref<string[]>([])

/** 已提交的筛选（证书名称输入由回车/点搜索提交） */
const filters = reactive({
  certName: '',
  category: '',
})
/** 证书名称输入态：回车或点搜索才查询 */
const nameInput = ref('')

/** 详情弹窗 */
const detailLoading = ref(false)
const showDetail = ref(false)
const currentCert = ref<CertificateDetailVO | null>(null)

let requestId = 0
let lastWrittenQuery = ''

function currentState(): UrlState {
  return {
    page: currentPage.value,
    size: pageSize.value,
    certName: filters.certName,
    category: filters.category,
  }
}

/**
 * URL 只写 4 个已知 key（page/size/certName/category），天然不含收藏 ids（收藏态是会话态，不进 URL）。
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
  filters.certName = state.certName
  filters.category = state.category
  nameInput.value = state.certName
}

// ==================== 收藏（favorite，targetType=certificate） ====================
const FAV_TARGET_TYPE = 'certificate' as const
/** 后端 BasePageQueryDTO.ids 的 @Size(max=200) 上限 */
const FAV_IDS_LIMIT = 200
/** 仅看收藏开关（toggle）：开启后只查已收藏的证书，再点退出回全部 */
const favOnly = ref(false)
/** 当前页已收藏的证书 id 集合（json-bigint 保证雪花 ID 为字符串） */
const favIds = ref<Set<string>>(new Set())

/**
 * 拉取全部已收藏证书 id（收藏视图用）。
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
    ElMessage.info('收藏较多，仅展示最近收藏的前 200 个证书')
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

/** 「查看收藏」toggle：开启只查收藏证书，再点退出回全部列表 */
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

  const params: CertificateQueryDTO = {
    page: currentPage.value,
    size: pageSize.value,
    certName: filters.certName || undefined,
    category: filters.category || undefined,
  }

  try {
    // 收藏视图：先取已收藏证书 id，再透传 ids 与其它筛选 AND 叠加（后端负责分页与 total）
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

    const res = await getCertificateList(params)
    if (id !== requestId) return
    list.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
    // 回填当前页星标状态（不阻塞列表展示）
    void refreshFavStatus(list.value.map((i) => String(i.id)))
  } catch (e) {
    if (id !== requestId) return
    error.value = (e as Error)?.message || '获取证书列表失败'
    list.value = []
    total.value = 0
  } finally {
    if (id === requestId) loading.value = false
  }
}

/** 分类下拉项：后端 categories 接口（DB DISTINCT 去重）；失败静默为空 */
async function fetchCategories() {
  try {
    const res = await getCertificateCategories()
    categoryOptions.value = res.data.data ?? []
  } catch {
    categoryOptions.value = []
  }
}

function handleSearch() {
  filters.certName = nameInput.value.trim().slice(0, 100)
  currentPage.value = 1
  writeUrl()
  void fetchList()
}

function handleReset() {
  filters.certName = ''
  filters.category = ''
  nameInput.value = ''
  currentPage.value = 1
  writeUrl()
  void fetchList()
}

/** 分类下拉变更立即查询；等 defineModel 的 update 事件同步回 filters 后再读状态 */
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

/** 整卡点击 → 打开详情弹窗（详情接口需登录，未登录由 request 层拦截） */
async function openDetail(certId: string) {
  detailLoading.value = true
  showDetail.value = true
  try {
    const res = await getCertificateDetail(certId)
    currentCert.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取证书详情失败')
    showDetail.value = false
  } finally {
    detailLoading.value = false
  }
}

/**
 * 外部 query 变化（浏览器前进/后退、其它页面带参进入）反向恢复；自己写的那次跳过。
 * certId 是详情深链键，不属于筛选状态，restore 时忽略。
 */
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

  // 首页百宝箱深链 /certificate?certId=xxx：打开详情弹窗后只移除 certId 这一个键，
  // 保留用户已筛选的 page/size/certName/category（旧实现会清空全部 query，误伤筛选条件）。
  const deepLinkId = typeof route.query.certId === 'string' ? route.query.certId : ''
  if (deepLinkId) {
    void openDetail(deepLinkId)
    const { certId: _certId, ...rest } = route.query
    void router.replace({ path: route.path, query: rest })
  }
})
</script>

<template>
  <div class="page-certificate-list">
    <div class="cert-container">
      <div class="cert-hero-wrap">
        <CertificateHero />
      </div>

      <div class="cert-grid">
        <div class="cert-left">
          <CertificateSearchCard
            v-model:cert-name="nameInput"
            v-model:category="filters.category"
            :total="total"
            :category-options="categoryOptions"
            :fav-only="favOnly"
            @search="handleSearch"
            @reset="handleReset"
            @filter-change="onFilterChange"
            @toggle-fav="onToggleFavOnly"
          />

          <CertificateSkeleton v-if="loading" :count="pageSize" />

          <div v-else-if="error" class="cert-state">
            <p class="cert-state__text">{{ error }}</p>
            <button type="button" class="cert-state__btn" @click="fetchList">重试</button>
          </div>

          <div v-else-if="!list.length" class="cert-state">
            <el-empty :description="favOnly ? '暂无收藏的证书，在卡片右上角点亮星标即可收藏' : '暂无符合条件的证书'" />
            <button v-if="!favOnly" type="button" class="cert-state__btn" @click="handleReset">清除筛选</button>
          </div>

          <div v-else class="cert-card-grid">
            <CertificateCard
              v-for="item in list"
              :key="item.id"
              :item="item"
              :favorited="favIds.has(String(item.id))"
              @open="openDetail"
              @toggle-fav="onToggleFav"
            />
          </div>

          <div v-if="!loading && !error && list.length && total > pageSize" class="cert-pager">
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

        <aside class="cert-right" :style="{ top: `${asideTop}px` }">
          <CertificateToolsCard />
        </aside>
      </div>
    </div>

    <CertificateDetailDialog v-model="showDetail" :cert="currentCert" :loading="detailLoading" />
  </div>
</template>
