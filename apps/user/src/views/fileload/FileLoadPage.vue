<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Motion } from 'motion-v'
import {
  getFileLoadList,
  getFileLoadStages,
  getFileLoadSubjects,
  getFileLoadTags,
} from '@/api/fileload'
import type { FileLoadListVO, FileLoadQueryDTO, FileLoadAudience } from '@/types/fileload'
import { useUserStore } from '@/store'

const props = defineProps<{
  /** 后端接口受众：middle=初中 / high=高中 */
  audience: FileLoadAudience
  /** 页面标题（路由 meta.title 亦可，此处用于 Banner 展示） */
  title?: string
}>()

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const list = ref<FileLoadListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

/* ---------------- 筛选状态（AND 关系） ---------------- */
const stageFilter = ref('')
const subjectFilter = ref('')
const tagFilter = ref('')

const stageOptions = ref<string[]>([])
const subjectOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])

const bannerTitle = computed(() => props.title || (props.audience === 'middle' ? '初中专栏' : '高中专栏'))
const bannerDesc = computed(() =>
  props.audience === 'middle'
    ? '初中阶段精选学习资料、升学政策与备考指南，持续更新中。'
    : '高中阶段精选学习资料、高考政策与备考指南，持续更新中。',
)

const hasActiveFilter = computed(() => !!(stageFilter.value || subjectFilter.value || tagFilter.value))

/** 拉取三个字段的去重值（用于按钮/下拉），失败不阻塞列表 */
async function fetchOptions() {
  try {
    const [s, sub, t] = await Promise.all([
      getFileLoadStages(props.audience),
      getFileLoadSubjects(props.audience),
      getFileLoadTags(props.audience),
    ])
    stageOptions.value = s.data.data || []
    subjectOptions.value = sub.data.data || []
    tagOptions.value = t.data.data || []
  } catch {
    /* 选项加载失败忽略，列表仍可展示 */
  }
}

async function fetchList() {
  loading.value = true
  try {
    const params: FileLoadQueryDTO = {
      page: currentPage.value,
      size: pageSize.value,
      subject: subjectFilter.value || undefined,
      applicableStage: stageFilter.value || undefined,
      tag: tagFilter.value || undefined,
    }
    const res = await getFileLoadList(props.audience, params)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '获取文件列表失败')
  } finally {
    loading.value = false
  }
}

/** 筛选变化 → 回到第一页并重新查询 */
function onFilterChange() {
  currentPage.value = 1
  fetchList()
}

/** 点击适用阶段按钮（再次点击取消选中） */
function toggleStage(s: string) {
  stageFilter.value = stageFilter.value === s ? '' : s
  onFilterChange()
}

function resetFilters() {
  stageFilter.value = ''
  subjectFilter.value = ''
  tagFilter.value = ''
  onFilterChange()
}

/** 点击卡片（无单独详情按钮）→ 列表免登录，但详情需 VIP：
 *  未登录先引导登录；已登录直接跳详情页，VIP 校验由详情页 onMounted 按 1005 业务码引导开通 */
async function openDetail(item: FileLoadListVO) {
  if (!userStore.isLoggedIn()) {
    userStore.setRedirectPath(router.currentRoute.value.fullPath)
    try {
      await ElMessageBox.confirm('您还没有登录，请先登录', '提示', {
        confirmButtonText: '前往登录',
        cancelButtonText: '取消',
        type: 'warning',
      })
      router.push('/login')
    } catch { /* 用户取消 */ }
    return
  }
  router.push(`/${props.audience}/${item.id}`)
}

/* ---------------- 工具函数 ---------------- */
function formatSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '-'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let v = bytes
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(v >= 100 ? 0 : 1)} ${units[i]}`
}

function formatDate(time?: string): string {
  if (!time) return '-'
  const d = new Date(time)
  if (Number.isNaN(d.getTime())) return time
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 按文件类型返回图标与配色 */
function fileTypeMeta(fileType?: string): { label: string; badge: string; iconBg: string } {
  const t = (fileType || '').toLowerCase()
  if (t === 'pdf') return { label: 'PDF', badge: 'bg-red-100 text-red-600', iconBg: 'from-red-500 to-rose-400' }
  if (t === 'doc' || t === 'docx') return { label: 'Word', badge: 'bg-blue-100 text-blue-600', iconBg: 'from-blue-500 to-sky-400' }
  if (t === 'xls' || t === 'xlsx') return { label: 'Excel', badge: 'bg-green-100 text-green-600', iconBg: 'from-green-500 to-emerald-400' }
  if (t === 'ppt' || t === 'pptx') return { label: 'PPT', badge: 'bg-orange-100 text-orange-600', iconBg: 'from-orange-500 to-amber-400' }
  if (t === 'jpg' || t === 'jpeg' || t === 'png' || t === 'gif' || t === 'bmp') return { label: '图片', badge: 'bg-purple-100 text-purple-600', iconBg: 'from-purple-500 to-violet-400' }
  if (t === 'txt') return { label: '文本', badge: 'bg-gray-100 text-gray-600', iconBg: 'from-gray-500 to-slate-400' }
  return { label: (fileType || '文件').toUpperCase(), badge: 'bg-gray-100 text-gray-600', iconBg: 'from-gray-500 to-slate-400' }
}

/* ---------------- 分页 ---------------- */
function onPageChange(page: number) {
  currentPage.value = page
  fetchList()
}
function onSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  fetchList()
}

onMounted(() => {
  fetchOptions()
  fetchList()
})

// 路由复用同一组件时（middle ↔ high）切换受众需重新拉取
watch(() => props.audience, () => {
  stageFilter.value = ''
  subjectFilter.value = ''
  tagFilter.value = ''
  currentPage.value = 1
  fetchOptions()
  fetchList()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
    <main class="container mx-auto px-6 py-8 flex-1">
      <!-- Intro Banner -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 border border-orange-100">
          <div class="flex items-center gap-3 mb-3">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800">{{ bannerTitle }} · 精选学习资料</h1>
          </div>
          <p class="text-gray-600 leading-relaxed mb-4">{{ bannerDesc }}</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="kw in ['学习资料', '政策解读', '备考指南', '持续更新']" :key="kw" class="rounded-full bg-white px-4 py-1.5 text-sm text-orange-600 border border-orange-200">
              {{ kw }}
            </span>
          </div>
        </div>
      </Motion>

      <!-- 筛选栏 -->
      <section class="mb-6 rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v6a1 1 0 01-.293.707L14 15.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 018 17v-1.586L3.293 10.707A1 1 0 013 10V4z" />
            </svg>
            筛选
          </div>
          <button v-if="hasActiveFilter" class="text-xs text-orange-500 hover:underline" @click="resetFilters">
            重置筛选
          </button>
        </div>

        <!-- 适用阶段：按钮（数据有几个就几个，点击切换） -->
        <div v-if="stageOptions.length" class="flex flex-wrap items-center gap-2">
          <span class="text-sm text-gray-400 mr-1 shrink-0">适用阶段</span>
          <button
            v-for="s in stageOptions"
            :key="s"
            class="rounded-full border px-4 py-1.5 text-sm transition-all"
            :class="stageFilter === s
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md shadow-orange-200'
              : 'bg-white text-orange-600 border-orange-200 hover:bg-orange-50'"
            @click="toggleStage(s)"
          >
            {{ s }}
          </button>
        </div>

        <!-- 学科 / 标签：下拉框 -->
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-400 shrink-0">学科</span>
            <el-select
              v-model="subjectFilter"
              placeholder="全部学科"
              clearable
              style="width: 160px"
              @change="onFilterChange"
            >
              <el-option v-for="o in subjectOptions" :key="o" :label="o" :value="o" />
            </el-select>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-400 shrink-0">标签</span>
            <el-select
              v-model="tagFilter"
              placeholder="全部标签"
              clearable
              style="width: 160px"
              @change="onFilterChange"
            >
              <el-option v-for="o in tagOptions" :key="o" :label="o" :value="o" />
            </el-select>
          </div>
        </div>
      </section>

      <!-- 文件列表 -->
      <section class="mb-8 rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
        <div class="mb-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 19h16M5 5h14v14H5zM9 9h6M9 13h6" />
          </svg>
          文件列表
        </div>
        <div v-loading="loading" class="min-h-[400px]">
          <div v-if="list.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div
              v-for="item in list"
              :key="item.id"
              class="group relative rounded-2xl bg-white border border-gray-100 shadow-lg hover:shadow-xl hover:border-orange-200 hover:-translate-y-0.5 transition-all overflow-hidden cursor-pointer"
              @click="openDetail(item)"
            >
              <!-- 文件图标区 -->
              <div class="relative h-32 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center overflow-hidden">
                <div
                  class="w-16 h-16 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-lg shadow-orange-100 transition-transform duration-300 group-hover:scale-110"
                  :class="fileTypeMeta(item.fileType).iconBg"
                >
                  <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5z" />
                  </svg>
                </div>
                <span
                  class="absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-bold"
                  :class="fileTypeMeta(item.fileType).badge"
                >
                  {{ fileTypeMeta(item.fileType).label }}
                </span>
              </div>

              <!-- 信息区 -->
              <div class="p-4">
                <h3 class="text-base font-bold text-gray-800 truncate" :title="item.fileName">{{ item.fileName }}</h3>
                <div class="mt-2 flex flex-wrap gap-1.5">
                  <span v-if="item.subject" class="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-600 border border-orange-100">
                    {{ item.subject }}
                  </span>
                  <span v-if="item.applicableStage" class="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-600 border border-amber-100">
                    {{ item.applicableStage }}
                  </span>
                  <span v-if="item.tag" class="rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-600 border border-rose-100">
                    {{ item.tag }}
                  </span>
                </div>
                <div class="mt-3 flex items-center justify-between text-xs text-gray-400">
                  <span>{{ formatSize(item.fileSize) }}</span>
                  <span>{{ formatDate(item.createTime) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="!loading" class="py-20 text-center text-gray-400">暂无文件数据</div>
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
  </div>
</template>
