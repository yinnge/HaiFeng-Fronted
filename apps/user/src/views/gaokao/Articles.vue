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

/** 档案弹窗保存成功（省份等可能已变）→ 重新加载档案并按新省份重查列表 */
async function onArchiveSaved() {
  page.value = 1
  await fetchArchive()
  await fetchList()
}

onMounted(async () => {
  await fetchArchive()
  await fetchList()
})
</script>

<template>
  <div class="min-h-screen bg-surface-bg">
    <!-- 档案吸附条：与 /gaokao 完全一致的模块导航（含「高中资料」+ 高中身份），保证各处小导航栏统一。
         province-dialog：资讯按档案省份过滤，省份按钮改为点击打开档案弹窗，保存后自动重查列表 -->
    <ArchiveBar
      :extra-items="gaokaoExtraItems"
      :identity-options="HIGH_IDENTITIES"
      :identity="highIdentity"
      province-dialog
      @identity-change="onHighIdentityChange"
      @saved="onArchiveSaved"
    />
    <main class="flex-1">
      <div class="mx-auto max-w-5xl px-6 py-8">
        <!-- 返回 + 页头 -->
        <div class="mb-6">
          <button
            class="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-sem-blue"
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
              class="inline-flex items-center rounded-md border border-sem-blue/15 bg-sem-blue-bg px-2.5 py-1 text-xs font-medium text-sem-blue"
            >
              {{ archive!.gaokaoProvince }}
            </span>
          </div>
          <p class="mt-2 text-sm text-gray-400">按你高考档案的省份精准推送 · 仅展示已发布资讯</p>
        </div>

        <!-- 标题关键字搜索：全国范围全局搜索，点击建议直达详情；与下方档案省份列表互不影响 -->
        <ArticleSearchBox class="mb-6" @select="goDetail" />

        <!-- 未建档：引导填写档案（列表接口按档案省份查询） -->
        <div v-if="!hasArchive" class="rounded-2xl border border-surface-border bg-white p-10 text-center shadow-hf">
          <div class="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sem-blue-bg text-sem-blue">
            <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <p class="mb-5 text-gray-500">尚未填写高考档案，资讯按档案省份推送，请先建档</p>
          <button
            class="rounded-xl bg-brand-orange px-8 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(249,115,22,0.22)] transition-all hover:-translate-y-0.5 hover:bg-brand-orange-dark hover:shadow-[0_8px_22px_rgba(249,115,22,0.28)] active:translate-y-0"
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
            class="group cursor-pointer rounded-2xl border border-surface-border bg-white p-5 shadow-hf transition-all duration-300 hover:-translate-y-0.5 hover:border-sem-blue/25 hover:shadow-hf-hover"
            @click="goDetail(item.id)"
          >
            <div class="flex flex-wrap items-center gap-2">
              <span
                v-if="item.columnName"
                class="inline-flex items-center gap-1.5 rounded-md bg-sem-blue-bg px-2.5 py-0.5 text-xs font-medium text-sem-blue"
              >
                {{ item.columnName }}
              </span>
            </div>
            <h3 class="mt-2 text-[17px] font-semibold text-gray-800 transition-colors group-hover:text-sem-blue">
              {{ item.title }}
            </h3>
            <p v-if="item.summary" class="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">
              {{ item.summary }}
            </p>
          </div>

          <div v-if="!loading && !list.length" class="rounded-2xl border border-surface-border bg-white py-16 text-center shadow-hf">
            <div class="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sem-blue-bg text-sem-blue">
              <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <p class="text-sm text-gray-500">暂无已发布的资讯</p>
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
