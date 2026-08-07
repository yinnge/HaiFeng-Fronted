<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Motion } from 'motion-v'
import { getResourceList, getResourceCategories, getResourceUrl } from '@/api/resource'
import type { ResourceListVO, ResourceQueryDTO, ResourceUrlVO } from '@/types/resource'
import { useUserStore } from '@/store'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const list = ref<ResourceListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

const categories = ref<string[]>([])
const selectedCategory = ref('')
const searchName = ref('')

const downloadDialogVisible = ref(false)
const currentResourceUrl = ref<ResourceUrlVO | null>(null)
const downloadingId = ref<string | null>(null)

async function fetchCategories() {
  try {
    const res = await getResourceCategories()
    categories.value = res.data.data
  } catch { /* silent */ }
}

async function fetchList() {
  loading.value = true
  try {
    const params: ResourceQueryDTO = { page: currentPage.value, size: pageSize.value }
    if (searchName.value) params.resourceName = searchName.value
    if (selectedCategory.value) params.category = selectedCategory.value
    const res = await getResourceList(params)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '获取资源列表失败')
  } finally {
    loading.value = false
  }
}

function selectCategory(category: string) {
  selectedCategory.value = selectedCategory.value === category ? '' : category
  currentPage.value = 1
  fetchList()
}

function handleSearch() {
  currentPage.value = 1
  fetchList()
}

function handleReset() {
  searchName.value = ''
  selectedCategory.value = ''
  currentPage.value = 1
  fetchList()
}

async function handleDownload(id: string) {
  if (!userStore.isLoggedIn()) {
    userStore.setRedirectPath(router.currentRoute.value.fullPath)
    try {
      await ElMessageBox.confirm('您还没有登录，请先登录', '提示', {
        confirmButtonText: '前往登录',
        cancelButtonText: '取消',
        type: 'warning',
      })
      router.push('/login')
    } catch { /* cancelled */ }
    return
  }

  downloadingId.value = id
  try {
    const res = await getResourceUrl(id)
    currentResourceUrl.value = res.data.data
    downloadDialogVisible.value = true
  } catch (e: any) {
    const msg = e?.message || '获取下载链接失败'
    // VIP 会员权限不足（业务码 1005）：引导开通旗舰版
    if (msg.includes('旗舰版') || msg.includes('VIP')) {
      try {
        await ElMessageBox.confirm('查看资源下载链接需要旗舰版（VIP）会员，是否前往开通？', '提示', {
          confirmButtonText: '去开通',
          cancelButtonText: '取消',
          type: 'warning',
        })
        router.push('/profile')
      } catch { /* 用户取消 */ }
      return
    }
    ElMessage.error(msg)
  } finally {
    downloadingId.value = null
  }
}

function copyText(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success(`${label}已复制`)
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

function onPageChange(page: number) { currentPage.value = page; fetchList() }
function onSizeChange(size: number) { pageSize.value = size; currentPage.value = 1; fetchList() }

onMounted(() => { fetchCategories(); fetchList() })
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
    <main class="container mx-auto px-6 py-8 flex-1">
      <!-- Intro Banner -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 border border-orange-100">
          <div class="flex items-center gap-3 mb-3">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </span>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800">资料档案 · 海量学习资源免费下载</h1>
          </div>
          <p class="text-gray-600 leading-relaxed mb-4">
            提供高考真题、考研资料、公务员考试等各类学习资源，覆盖升学与备考全场景，免费下载使用。
          </p>
          <div class="flex flex-wrap gap-2">
            <span v-for="kw in ['高考真题', '考研资料', '公务员考试', '免费下载']" :key="kw" class="rounded-full bg-white px-4 py-1.5 text-sm text-orange-600 border border-orange-200">
              {{ kw }}
            </span>
          </div>
        </div>
      </Motion>

      <!-- Search + Category -->
      <div class="mb-8 rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] shadow-lg p-6">
        <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          资源检索
        </div>
        <div class="mb-5 flex flex-wrap items-center gap-3">
          <input
            v-model="searchName"
            type="text"
            placeholder="输入资源名称搜索"
            class="flex-1 min-w-[200px] rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
            @keyup.enter="handleSearch"
          />
          <button
            class="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
            @click="handleSearch"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            搜索
          </button>
          <button
            class="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm text-gray-600 font-medium hover:border-orange-300 hover:text-orange-500 transition-all"
            @click="handleReset"
          >
            重置
          </button>
        </div>
        <div class="flex flex-wrap gap-3">
          <button
            class="rounded-full px-4 py-2 text-sm font-medium transition-all"
            :class="!selectedCategory ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'"
            @click="selectCategory('')"
          >全部</button>
          <button
            v-for="cat in categories" :key="cat"
            class="rounded-full px-4 py-2 text-sm font-medium transition-all"
            :class="selectedCategory === cat ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'"
            @click="selectCategory(cat)"
          >{{ cat }}</button>
        </div>
      </div>

      <!-- List -->
      <section class="mb-8 rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
        <div class="mb-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 19h16M5 5h14v14H5zM9 9h6M9 13h6"/></svg>
          资源列表
        </div>
        <div v-loading="loading" class="min-h-[400px]">
          <div v-if="list.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="item in list" :key="item.id"
              class="group rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl hover:border-orange-200 transition-all overflow-hidden"
            >
              <div class="aspect-[16/9] overflow-hidden bg-gray-50">
                <img
                  :src="item.coverUrl || ''"
                  :alt="item.resourceName"
                  class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  @error="($event.target as HTMLImageElement).src = ''"
                />
              </div>
              <div class="p-5">
                <h3 class="text-lg font-bold text-gray-800 truncate">{{ item.resourceName }}</h3>
                <div class="flex gap-2 mt-2">
                  <span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">{{ item.fileType }}</span>
                  <span class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{{ item.category }}</span>
                </div>
                <p class="mt-2 text-sm text-gray-500 line-clamp-2">{{ item.description }}</p>
                <div class="mt-3 flex items-center gap-1 text-sm text-gray-400">
                  <span>👁️</span>
                  <span>{{ item.viewCount }} 次浏览</span>
                </div>
                <el-button
                  class="mt-4 w-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all border-0"
                  :loading="downloadingId === item.id"
                  @click="handleDownload(item.id)"
                >立即下载</el-button>
              </div>
            </div>
          </div>
          <div v-else-if="!loading" class="py-20 text-center text-gray-400">暂无资源数据</div>
        </div>

        <div v-if="total > pageSize" class="mt-8 flex justify-center">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next"
            :total="total"
            :page-sizes="[10, 20, 30, 50, 100]"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="onPageChange"
            @size-change="onSizeChange"
          />
        </div>
      </section>
    </main>

    <ElDialog
      v-model="downloadDialogVisible"
      title="资源下载"
      width="480px"
      :close-on-click-modal="false"
    >
      <div v-if="currentResourceUrl" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">网盘链接</label>
          <div class="flex gap-2">
            <input
              :value="currentResourceUrl.resourceUrl"
              readonly
              class="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 outline-none"
            />
            <button
              class="shrink-0 rounded-lg bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600 transition-colors"
              @click="copyText(currentResourceUrl.resourceUrl, '链接')"
            >复制链接</button>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">提取码</label>
          <div class="flex gap-2">
            <input
              :value="currentResourceUrl.accessCode"
              readonly
              class="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 outline-none"
            />
            <button
              class="shrink-0 rounded-lg bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600 transition-colors"
              @click="copyText(currentResourceUrl.accessCode, '提取码')"
            >复制提取码</button>
          </div>
        </div>
        <p class="text-sm text-gray-400">提示：复制链接和提取码到浏览器打开即可下载</p>
      </div>
    </ElDialog>
  </div>
</template>
