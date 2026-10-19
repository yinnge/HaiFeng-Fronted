<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { type GaokaoArchiveVO } from '@/api/gaokao'
import { loadArchiveSmart } from '@/utils/gaokaoArchive'
import { getGaokaoArticlePage, type GaokaoArticleListVO } from '@/api/article'
import ArticleSearchBox from '@/components/gaokao/ArticleSearchBox.vue'
import ArchiveBar from '@/components/gaokao/ArchiveBar.vue'
import { useGaokaoModuleNav } from '@/composables/useGaokaoModuleNav'

const router = useRouter()

/** 与 /gaokao 共享同一套模块导航（高中资料 + 高一/高二/高三身份），保证各处小导航栏一致 */
const { HIGH_IDENTITIES, highIdentity, onHighIdentityChange, gaokaoExtraItems } = useGaokaoModuleNav()

const loading = ref(false)
const archive = ref<GaokaoArchiveVO | null>(null)
const list = ref<GaokaoArticleListVO[]>([])
const total = ref(0)
const page = ref(1)
const size = 10

const hasArchive = computed(() => !!archive.value?.gaokaoProvince)

async function fetchArchive() {
  try {
    const { archive: a } = await loadArchiveSmart()
    archive.value = a
  } catch {
    archive.value = null
  }
}

async function fetchList() {
  if (!hasArchive.value) return
  loading.value = true
  try {
    const res = await getGaokaoArticlePage({
      province: archive.value!.gaokaoProvince,
      page: page.value,
      size,
    })
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '获取资讯列表失败')
  } finally {
    loading.value = false
  }
}

function goDetail(id: string) {
  router.push({ path: `/gaokao/article/${id}`, query: { from: 'articles' } })
}

function goArchive() {
  router.push({ path: '/gaokao', query: { editArchive: '1' } })
}

function goBack() {
  router.push('/gaokao')
}

function onPageChange(p: number) {
  page.value = p
  fetchList()
}

onMounted(async () => {
  await fetchArchive()
  await fetchList()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-brand-gray-50 via-orange-50/20 to-white">
    <!-- 档案吸附条：与 /gaokao 完全一致的模块导航（含「高中资料」+ 高中身份），保证各处小导航栏统一 -->
    <ArchiveBar
      :extra-items="gaokaoExtraItems"
      :identity-options="HIGH_IDENTITIES"
      :identity="highIdentity"
      @identity-change="onHighIdentityChange"
    />
    <main class="flex-1">
      <div class="mx-auto max-w-5xl px-6 py-8">
        <!-- 返回 + 页头 -->
        <div class="mb-6">
          <button
            class="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-brand-orange"
            @click="goBack"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            返回高考首页
          </button>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-800 md:text-3xl">热点资讯</h1>
            <span
              v-if="hasArchive"
              class="inline-flex items-center rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-medium text-brand-orange border border-brand-orange/20"
            >
              {{ archive!.gaokaoProvince }}
            </span>
          </div>
          <p class="mt-2 text-sm text-gray-400">按你高考档案的省份精准推送 · 仅展示已发布资讯</p>
        </div>

        <!-- 标题关键字搜索：全国范围（可选省份筛选），点击建议直达详情；与下方档案省份列表互不影响 -->
        <ArticleSearchBox class="mb-6" @select="goDetail" />

        <!-- 未建档：引导填写档案（列表接口按档案省份查询） -->
        <div v-if="!hasArchive" class="rounded-2xl bg-white p-10 text-center shadow-card border border-orange-100">
          <div class="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
            <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <p class="mb-5 text-gray-500">尚未填写高考档案，资讯按档案省份推送，请先建档</p>
          <button
            class="rounded-full bg-gradient-to-r from-brand-orange-dark to-brand-orange px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
            @click="goArchive"
          >
            去填写高考档案 →
          </button>
        </div>

        <!-- 列表 -->
        <div v-else v-loading="loading" class="min-h-[240px] space-y-3">
          <div
            v-for="item in list"
            :key="item.id"
            class="group cursor-pointer rounded-2xl bg-white p-5 shadow-card border border-orange-100/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-orange/40 hover:shadow-card-hover"
            @click="goDetail(item.id)"
          >
            <div class="flex flex-wrap items-center gap-2">
              <span
                v-if="item.columnName"
                class="inline-flex items-center rounded-full bg-brand-orange/10 px-2.5 py-0.5 text-xs font-medium text-brand-orange border border-brand-orange/20"
              >
                {{ item.columnName }}
              </span>
            </div>
            <h3 class="mt-2 text-[17px] font-semibold text-gray-800 transition-colors group-hover:text-brand-orange">
              {{ item.title }}
            </h3>
            <p v-if="item.summary" class="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">
              {{ item.summary }}
            </p>
          </div>

          <div v-if="!loading && !list.length" class="py-16 text-center text-sm text-gray-400">
            本省暂无已发布的资讯
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="hasArchive && total > size" class="mt-8 flex justify-center">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="size"
            :current-page="page"
            @current-change="onPageChange"
          />
        </div>
      </div>
    </main>
  </div>
</template>
