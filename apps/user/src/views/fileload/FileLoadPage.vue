<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Motion } from 'motion-v'
import {
  getFileLoadList,
  getFileLoadSubjects,
  getFileLoadTags,
} from '@/api/fileload'
import type { FileLoadListVO, FileLoadQueryDTO, FileLoadAudience } from '@/types/fileload'
import { useUserStore } from '@/store'

const props = defineProps<{
  /** 后端接口受众：middle=初中 / high=高中 / college=大学 / civil-service=考公 / postgrad-exam=考研 / graduate=研究生 */
  audience: FileLoadAudience
  /** 页面标题（路由 meta.title 亦可，此处用于 Banner 展示） */
  title?: string
  /**
   * 写死的面向人群（仅考公/考研/研究生三个单一人群的专栏由路由 props 传入，如 '考公人'）。
   * 初中/高中/大学专栏不传，由导航 query.stage 或页内行为决定。
   */
  stage?: string
}>()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const list = ref<FileLoadListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

/**
 * 教师专属模式：从路由 query.teacher 初始化（详情页返回时保持一致）；
 * 仅在高中专栏（audience=high）提供切换按钮，走 /high/teacher 端点（仅老师身份可访问）
 */
const teacherMode = ref(route.query.teacher === '1')
/** 非老师身份访问教师专属时的拦截态 */
const teacherForbidden = ref(false)

/* ---------------- 筛选状态（AND 关系） ---------------- */
const subjectFilter = ref('')
const tagFilter = ref('')

/**
 * 固定面向人群：优先取路由 props.stage（考公/考研/研究生单一人群专栏，路由层写死），
 * 其次 route.query.stage（初中/高中/大学专栏子项，如 /high?stage=高一）。
 * 接口的 applicableStage 直接写死该值（精准查询由导航入口决定，页内不提供筛选）。
 */
const fixedStage = computed(() => props.stage || (route.query.stage as string) || '')

const subjectOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])

const bannerTitleMap: Record<FileLoadAudience, string> = {
  middle: '初中专栏',
  high: '高中专栏',
  college: '大学专栏',
  'civil-service': '考公专栏',
  'postgrad-exam': '考研专栏',
  graduate: '研究生专栏',
}
const bannerTitle = computed(() => {
  if (teacherMode.value) return '教师专属资料'
  return props.title || bannerTitleMap[props.audience]
})
const bannerDesc = computed(() => {
  if (teacherMode.value) return '教师专属精选学习资料，仅老师身份可见，持续更新中。'
  return audienceDescMap[props.audience] || audienceDescMap.middle
})
const audienceDescMap: Record<FileLoadAudience, string> = {
  middle: '初中阶段精选学习资料、升学政策与备考指南，持续更新中。',
  high: '高中阶段精选学习资料、高考政策与备考指南，持续更新中。',
  college: '大学阶段精选学习资料、考研就业与学业规划指南，持续更新中。',
  'civil-service': '考公阶段精选备考资料、真题解析与政策解读，持续更新中。',
  'postgrad-exam': '考研阶段精选备考资料、真题解析与复习规划，持续更新中。',
  graduate: '研究生阶段精选学习资料、科研工具与学术发展指南，持续更新中。',
}

const hasActiveFilter = computed(() => !!(subjectFilter.value || tagFilter.value))

/** 拉取学科/标签的去重值（用于下拉），失败不阻塞列表 */
async function fetchOptions() {
  try {
    const [sub, t] = await Promise.all([
      getFileLoadSubjects(props.audience, teacherMode.value),
      getFileLoadTags(props.audience, teacherMode.value),
    ])
    subjectOptions.value = sub.data.data || []
    tagOptions.value = t.data.data || []
  } catch {
    /* 选项加载失败忽略，列表仍可展示 */
  }
}

async function fetchList() {
  loading.value = true
  teacherForbidden.value = false
  try {
    const params: FileLoadQueryDTO = {
      page: currentPage.value,
      size: pageSize.value,
      subject: subjectFilter.value || undefined,
      // 面向人群由导航入口写死（fixedStage）；教师专属为独立数据集，不按阶段过滤，展示全部老师文件
      applicableStage: teacherMode.value ? undefined : (fixedStage.value || undefined),
      tag: tagFilter.value || undefined,
    }
    const res = await getFileLoadList(props.audience, params, teacherMode.value)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    const msg = e?.message || ''
    // 教师专属端点要求老师身份，非老师访问返回教师权限不足 → 友好拦截
    if (teacherMode.value && (msg.includes('教师') || msg.includes('1008'))) {
      teacherForbidden.value = true
      list.value = []
      total.value = 0
      return
    }
    ElMessage.error(e?.message || '获取文件列表失败')
  } finally {
    loading.value = false
  }
}

/** 切换「教师专属」模式：重置筛选与分页后重新拉取（进入前需登录，老师接口要求登录+老师身份） */
async function toggleTeacher() {
  // 仅「进入教师专属」时拦截未登录（退出无需登录）
  if (!teacherMode.value && !userStore.isLoggedIn()) {
    userStore.setRedirectPath(router.currentRoute.value.fullPath)
    try {
      await ElMessageBox.confirm('教师专属资料需登录后查看，请先登录', '提示', {
        confirmButtonText: '前往登录',
        cancelButtonText: '取消',
        type: 'warning',
      })
      router.push('/login')
    } catch { /* 用户取消 */ }
    return
  }
  teacherMode.value = !teacherMode.value
  subjectFilter.value = ''
  tagFilter.value = ''
  currentPage.value = 1
  teacherForbidden.value = false
  fetchOptions()
  fetchList()
}

/** 筛选变化 → 回到第一页并重新查询 */
function onFilterChange() {
  currentPage.value = 1
  fetchList()
}

function resetFilters() {
  subjectFilter.value = ''
  tagFilter.value = ''
  onFilterChange()
}

/** 点击卡片（无单独详情按钮）→ 详情需登录/VIP：
 *  middle/high 列表公开，未登录先引导登录；college 列表页整页 requiresAuth，进到此处必已登录。
 *  已登录直接跳详情页，VIP 校验由详情页 onMounted 按 1005 业务码引导开通 */
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
  router.push({ path: `/${props.audience}/${item.id}`, query: teacherMode.value ? { teacher: '1' } : {} })
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

// 路由复用同一组件时（middle ↔ high）切换受众需重新拉取；切走时关闭教师专属模式
watch(() => props.audience, () => {
  subjectFilter.value = ''
  tagFilter.value = ''
  currentPage.value = 1
  teacherMode.value = false
  fetchOptions()
  fetchList()
})

// 固定阶段变化（如 /high?stage=高一 → /high?stage=高二）需重新拉取
watch(fixedStage, () => {
  currentPage.value = 1
  fetchList()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
    <main class="container mx-auto px-6 py-8 flex-1">
      <!-- Intro Banner -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 border border-orange-100">
          <div class="flex items-center justify-between gap-3 mb-3">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800">{{ bannerTitle }} · 精选学习资料</h1>
          </div>
          <button
            v-if="props.audience === 'high'"
            type="button"
            class="shrink-0 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition-all"
            :class="teacherMode
              ? 'bg-white text-orange-600 border border-orange-300 hover:bg-orange-50'
              : 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-200 hover:from-sky-600 hover:to-cyan-600'"
            @click="toggleTeacher"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            {{ teacherMode ? '返回高中资料' : '教师专属' }}
          </button>
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

        <!-- 学科 / 标签：下拉框（面向人群已由导航入口写死，页内不再提供筛选） -->
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
                <img
                  v-if="item.storageType === 'BAIDU' && item.coverUrl"
                  :src="item.coverUrl"
                  alt=""
                  class="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-16 h-16 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                  :class="item.storageType === 'BAIDU' ? 'from-blue-500 to-sky-400 shadow-blue-100' : fileTypeMeta(item.fileType).iconBg"
                >
                  <svg v-if="item.storageType === 'BAIDU'" class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 18a4 4 0 0 1-.9-7.9 5.5 5.5 0 0 1 10.8-1.5A4.5 4.5 0 0 1 17.5 18H7z" />
                  </svg>
                  <svg v-else class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6zm7 1.5L18.5 9H13V3.5z" />
                  </svg>
                </div>
                <span
                  class="absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-bold"
                  :class="item.storageType === 'BAIDU'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : fileTypeMeta(item.fileType).badge"
                >
                  {{ item.storageType === 'BAIDU' ? '网盘' : fileTypeMeta(item.fileType).label }}
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
                  <span>{{ item.storageType === 'BAIDU' ? '百度网盘' : formatSize(item.fileSize) }}</span>
                  <span>{{ formatDate(item.createTime) }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="teacherForbidden && !loading" class="py-20 text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-200 mb-4">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <p class="text-base font-semibold text-gray-700">您还不是教师身份</p>
            <p class="text-sm text-gray-400 mt-1">教师专属资料仅对老师身份开放，请联系管理员开通</p>
            <button
              type="button"
              class="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-200 hover:from-orange-600 hover:to-amber-600 transition-all"
              @click="toggleTeacher"
            >
              返回高中资料
            </button>
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
