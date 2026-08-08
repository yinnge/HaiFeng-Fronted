<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUniversityList } from '@/api/university'
import type { UniversityListVO, UniversityQueryDTO } from '@/types/university'
import { ProvinceOptions } from '@haifeng/shared'
import { ElMessage } from 'element-plus'

const router = useRouter()

const loading = ref(false)
const list = ref<UniversityListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

const query = reactive<UniversityQueryDTO>({
  page: 1,
  size: 12,
  name: '',
  provinceName: '',
  nature: '',
  category: '',
  department: '',
  educationLevel: '',
})

const hasDoctorate = ref<string>('')
const hasMaster = ref<string>('')

const natureOptions = ['公办', '民办', '中外合作']
const categoryOptions = ['综合', '理工', '师范', '农林', '医药', '政法', '财经', '民族', '语言', '艺术', '体育']
const educationLevelOptions = ['本科', '专科', '本专兼招']

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const paginationPages = computed(() => {
  const t = totalPages.value
  const c = currentPage.value
  const pages: (number | string)[] = []
  if (t <= 7) {
    for (let i = 1; i <= t; i++) pages.push(i)
  } else {
    pages.push(1)
    if (c > 3) pages.push('...')
    const start = Math.max(2, c - 1)
    const end = Math.min(t - 1, c + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (c < t - 2) pages.push('...')
    pages.push(t)
  }
  return pages
})

async function fetchList() {
  loading.value = true
  try {
    const params: UniversityQueryDTO = {
      page: currentPage.value,
      size: pageSize.value,
    }
    if (query.name) params.name = query.name
    if (query.provinceName) params.provinceName = query.provinceName
    if (query.nature) params.nature = query.nature
    if (query.category) params.category = query.category
    if (query.department) params.department = query.department
    if (query.educationLevel) params.educationLevel = query.educationLevel
    if (hasDoctorate.value) params.hasDoctorate = hasDoctorate.value === 'true'
    if (hasMaster.value) params.hasMaster = hasMaster.value === 'true'

    const res = await getUniversityList(params)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '获取院校列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchList()
}

function handleReset() {
  query.name = ''
  query.provinceName = ''
  query.nature = ''
  query.category = ''
  query.department = ''
  query.educationLevel = ''
  hasDoctorate.value = ''
  hasMaster.value = ''
  currentPage.value = 1
  fetchList()
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchList()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  fetchList()
}

function goDetail(id: string) {
  router.push(`/university/${id}`)
}

function goGuide(id: string) {
  router.push(`/university/${id}/guide`)
}

onMounted(fetchList)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <main class="flex-1 container mx-auto px-6 py-8 max-w-7xl">
      <!-- 顶部操作栏 -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">院校库</h1>
          <p class="text-sm text-gray-500 mt-1">共 <span class="font-semibold text-brand-orange">{{ total }}</span> 所院校，助力升学规划</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="btn-secondary px-4 py-2 text-sm flex items-center gap-1.5"
            @click="router.push('/favorites')"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            我的收藏
          </button>
        </div>
      </div>

      <!-- 搜索栏 -->
      <div class="univ-card mb-6 p-6">
        <div class="flex items-end gap-4 flex-wrap">
          <div class="flex-1 min-w-[200px]">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">院校名称</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="query.name"
                type="text"
                placeholder="搜索院校名称"
                class="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
                @keyup.enter="handleSearch"
              />
            </div>
          </div>
          <div class="flex-1 min-w-[200px]">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">省份</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <el-select v-model="query.provinceName" placeholder="选择省份" clearable filterable class="w-full">
                <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <button
              class="btn-brand px-6 py-2.5 text-sm"
              @click="handleSearch"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              查询
            </button>
            <button
              class="btn-secondary px-6 py-2.5 text-sm"
              @click="handleReset"
            >
              重置
            </button>
          </div>
        </div>
        <!-- 精准筛选 -->
        <div class="mt-4 pt-4 border-t border-gray-100/60 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <el-select v-model="query.nature" placeholder="办学性质" clearable>
            <el-option v-for="opt in natureOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
          <el-select v-model="query.category" placeholder="院校类型" clearable filterable>
            <el-option v-for="opt in categoryOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <input
              v-model="query.department"
              type="text"
              placeholder="主管部门"
              class="w-full rounded-xl border border-gray-200 pl-10 pr-3 py-2 text-sm outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all"
            />
          </div>
          <el-select v-model="query.educationLevel" placeholder="学历层次" clearable>
            <el-option v-for="opt in educationLevelOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
          <el-select v-model="hasDoctorate" placeholder="博士点" clearable>
            <el-option label="全部" value="" />
            <el-option label="有" value="true" />
            <el-option label="无" value="false" />
          </el-select>
          <el-select v-model="hasMaster" placeholder="硕士点" clearable>
            <el-option label="全部" value="" />
            <el-option label="有" value="true" />
            <el-option label="无" value="false" />
          </el-select>
        </div>
      </div>

      <!-- 骨架屏 -->
      <div v-if="loading && list.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="univ-card overflow-hidden">
          <div class="aspect-[16/9] skeleton" />
          <div class="p-5 space-y-3">
            <div class="flex items-center justify-between">
              <div class="h-5 skeleton w-32 rounded" />
              <div class="h-5 skeleton w-14 rounded-full" />
            </div>
            <div class="flex gap-1.5">
              <div class="h-4 skeleton w-12 rounded-full" />
              <div class="h-4 skeleton w-14 rounded-full" />
            </div>
            <div class="grid grid-cols-2 gap-y-2">
              <div class="h-4 skeleton w-24 rounded" />
              <div class="h-4 skeleton w-16 rounded" />
              <div class="h-4 skeleton w-20 rounded" />
              <div class="h-4 skeleton w-18 rounded" />
            </div>
            <div class="flex gap-3 pt-1">
              <div class="h-10 skeleton flex-1 rounded-full" />
              <div class="h-10 skeleton flex-1 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <!-- 列表 -->
      <div v-else>
        <div v-if="list.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TransitionGroup name="list">
            <div
              v-for="(item, index) in list"
              :key="item.id"
              class="group univ-card univ-card-hover overflow-hidden"
              :style="{ animationDelay: `${index * 80}ms` }"
            >
              <div class="aspect-[16/9] overflow-hidden bg-gray-50">
                <img
                  :src="item.imageUrl || ''"
                  :alt="item.name"
                  class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  @error="($event.target as HTMLImageElement).src = ''"
                />
              </div>
              <div class="p-5">
                <div class="flex items-start justify-between mb-2">
                  <h3 class="text-lg font-bold text-gray-800 truncate">{{ item.name }}</h3>
                  <span class="shrink-0 pill-new text-xs ml-2">{{ item.nature }}</span>
                </div>
                <div class="flex flex-wrap gap-1.5 mb-3">
                  <span v-for="tag in item.tags" :key="tag" class="pill-new text-xs">
                    {{ tag }}
                  </span>
                </div>
                <div class="grid grid-cols-2 gap-y-2 text-sm text-gray-500 mb-4">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-brand-orange shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ item.provinceName }} · {{ item.cityName }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-brand-blue shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {{ item.category }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-brand-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {{ item.educationLevel }}
                  </span>
                  <span class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {{ item.majorCount }} 个专业
                  </span>
                </div>
                <div class="flex gap-3">
                  <button
                    class="flex-1 btn-brand py-2 text-sm"
                    @click="goDetail(item.id)"
                  >
                    院校详情
                  </button>
                  <button
                    class="flex-1 btn-secondary py-2 text-sm"
                    @click="goGuide(item.id)"
                  >
                    适应指南
                  </button>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
        <div v-else class="text-center py-20">
          <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-brand-orange/10 flex items-center justify-center">
            <svg class="w-10 h-10 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">暂无院校数据</h3>
          <p class="text-sm text-gray-500">请调整筛选条件或检查搜索关键词</p>
        </div>
      </div>

      <!-- 自定义分页 -->
      <div v-if="total > pageSize" class="mt-8 flex justify-center">
        <div class="inline-flex items-center gap-1 univ-card p-1.5">
          <button
            class="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
            :class="currentPage <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-brand-orange/10 hover:text-brand-orange'"
            :disabled="currentPage <= 1"
            @click="handlePageChange(currentPage - 1)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <template v-for="p in paginationPages" :key="p">
            <span v-if="p === '...'" class="w-9 h-9 flex items-center justify-center text-gray-400">...</span>
            <button
              v-else
              class="w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200"
              :class="p === currentPage
                ? 'pager-active'
                : 'text-gray-600 hover:bg-brand-orange/10 hover:text-brand-orange'"
              @click="handlePageChange(p as number)"
            >
              {{ p }}
            </button>
          </template>

          <button
            class="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200"
            :class="currentPage >= totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-brand-orange/10 hover:text-brand-orange'"
            :disabled="currentPage >= totalPages"
            @click="handlePageChange(currentPage + 1)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div class="w-px h-6 bg-gray-200 mx-1" />

          <div class="flex items-center gap-2 px-3">
            <span class="text-sm text-gray-500">每页</span>
            <select
              v-model="pageSize"
              class="h-8 px-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition-all"
              @change="handleSizeChange(pageSize)"
            >
              <option :value="12">12</option>
              <option :value="24">24</option>
              <option :value="36">36</option>
            </select>
            <span class="text-sm text-gray-500">条</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* ===== 新规范卡片：纯白底 + 橙描边 + 渐变顶边 ===== */
.univ-card {
  /* !important 覆盖 .app-shell main > * 的透底规则（卡片是 main 直接子） */
  background: #ffffff !important;
  background-image: none !important;
  border-radius: 1rem;
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #f97316, #fb923c) 1;
  border-top-width: 3px;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.06);
  transition: all 0.25s ease;
}

/* 可点击卡片 hover：上浮 + 橙阴影增强（列表卡专用） */
.univ-card-hover:hover {
  transform: translateY(-6px);
  box-shadow: 0 14px 34px rgba(249, 115, 22, 0.14);
  border-color: rgba(249, 115, 22, 0.35);
}

/* ===== 橙系药丸标签：浅橙渐变底 + 深橙字 + 橙描边 ===== */
.pill-new {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.7rem;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  color: #e8722a;
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.25);
}

/* ===== 分页当前页：新 token 橙渐变 ===== */
.pager-active {
  background: linear-gradient(135deg, #f97316, #fb923c) !important;
  color: #fff !important;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.28);
}

/* ===== 按钮 token 覆盖（本页生效，不动全局） ===== */
.btn-brand {
  background: linear-gradient(90deg, #f97316, #fb923c) !important;
  border-color: transparent !important;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
.list-move {
  transition: transform 0.3s ease;
}
</style>
