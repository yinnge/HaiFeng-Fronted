<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Motion, useReducedMotion } from 'motion-v'
import { getChannelList } from '@/api/special'
import { getGaokaoArticlePage, type GaokaoArticleListVO } from '@/api/article'
import type { GaokaoArchiveVO, GaokaoArchiveForm } from '@/api/gaokao'
import { loadArchiveSmart } from '@/utils/gaokaoArchive'
import { ProvinceOptions } from '@haifeng/shared'
import type { SpecialChannelListVO } from '@/types/special'
import { scrollToHash } from '@/utils/navAnchor'
import ArchiveDialog from '@/components/gaokao/ArchiveDialog.vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const channels = ref<SpecialChannelListVO[]>([])

// ===== 高考档案（统一存取源：登录=服务端，游客=localStorage，刷新不丢） =====
const displayForm = ref<GaokaoArchiveVO | null>(null)
const hasArchive = computed(() => !!displayForm.value?.gaokaoProvince)

// 档案弹窗
const archiveDialogVisible = ref(false)

function openArchiveDialog() {
  archiveDialogVisible.value = true
}

// 档案保存成功（模拟填报）：更新吸附条展示 + 按新省份刷新资讯 + 跳转专业组查询
function handleArchiveSaved(form: GaokaoArchiveForm) {
  displayForm.value = { ...(displayForm.value || ({} as GaokaoArchiveVO)), ...form }
  archiveDialogVisible.value = false
  void fetchNews()
  router.push('/gaokao/groups')
}

// ===== 档案吸附条：吸在导航栏下方，滚动页面时不随之滚动 =====
// 动态测量导航栏实际高度作为吸附偏移，避免写死（导航内容高度随断点变化）
const stickyTop = ref(64)

function measureHeader() {
  const h = document.querySelector('.app-header')?.getBoundingClientRect().height
  if (h && h > 0) stickyTop.value = Math.round(h)
}

// 三个选科（首选 / 再选1 / 再选2），老高考无再选科目时只展示首选
const archiveSubjects = computed(() => {
  if (!displayForm.value) return []
  return [
    displayForm.value.subjectType,
    displayForm.value.secondSubjectType,
    displayForm.value.thirdSubjectType,
  ].filter((s): s is string => !!s)
})

// 吸附条省份行内下拉：与档案弹窗双向联动（这里改了弹窗跟着改；弹窗保存后这里同步）
const archiveProvince = computed({
  get: () => displayForm.value?.gaokaoProvince || '',
  set: (val: string) => {
    if (!val) return
    if (displayForm.value) {
      displayForm.value.gaokaoProvince = val
    } else {
      // 尚无档案：先建一个最小展示对象（省份仅用于资讯查询，完整档案走弹窗）
      displayForm.value = { gaokaoProvince: val, gaokaoYear: new Date().getFullYear() } as GaokaoArchiveVO
    }
    void fetchNews()
  },
})

// ===== 热点资讯：按档案省份精准查询，首页仅展示 4 条 =====
const newsLoading = ref(false)
const newsList = ref<GaokaoArticleListVO[]>([])

async function fetchNews() {
  if (!displayForm.value?.gaokaoProvince) return
  newsLoading.value = true
  try {
    // 后端分页 size 下限为 10（BasePageQueryDTO 强约束），首页只展示 4 条，本地截断
    const res = await getGaokaoArticlePage({
      province: displayForm.value.gaokaoProvince,
      page: 1,
      size: 10,
    })
    newsList.value = res.data.data.records.slice(0, 4)
  } catch {
    // 资讯拉取失败不打断主流程
  } finally {
    newsLoading.value = false
  }
}

// 查看资讯详情
function goNewsDetail(id: string) {
  router.push(`/gaokao/article/${id}`)
}

// 查看更多资讯（跳转资讯列表页）
function goArticles() {
  router.push('/gaokao/articles')
}

// 尊重系统「减弱动态效果」设置：开启时区块直接静态呈现，不做浮现动画
const reduceMotion = useReducedMotion()
const revealInitial = computed(() =>
  reduceMotion.value ? undefined : { opacity: 0, y: 24 },
)
const revealIn = computed(() =>
  reduceMotion.value ? undefined : { opacity: 1, y: 0 },
)

// 其余通道代码（按展示顺序）
// 注意：统招不在此列表内——它是产品固定入口，直接硬编码展示，
// 不依赖后台是否在 t_special_channel 录入 NORMAL 记录，否则运营没录数据时入口会整个消失
const channelCodes = ['COMPREHENSIVE', 'STRONG_BASE', 'SPECIAL_PROGRAM', 'ETHNIC_MINORITY', 'JOINT_NATIONAL']

// 内联手绘线稿图标（stroke-width 2，延续全站 SVG 线稿风格）
interface ChannelGlyph {
  paths: string[]
}

const normalGlyph: ChannelGlyph = {
  paths: [
    'M12 4 3.5 8.5 12 13l8.5-4.5L12 4Z',
    'M6 11.5v4.2c0 1.7 2.7 3.3 6 3.3s6-1.6 6-3.3v-4.2',
    'M21 8.8V14',
  ],
}

const channelIcon: Record<string, ChannelGlyph> = {
  COMPREHENSIVE: {
    paths: ['M12 3.6 14.5 8.6l5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8L12 3.6Z'],
  },
  STRONG_BASE: {
    paths: [
      'M4 21h16',
      'M6.5 21V9.5m3.5 11.5V9.5m4 11.5V9.5m3.5 11.5V9.5',
      'M3.5 9.5 12 4.5l8.5 5',
    ],
  },
  SPECIAL_PROGRAM: {
    paths: [
      'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
      'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z',
      'M12 11.6h.01',
    ],
  },
  ETHNIC_MINORITY: {
    paths: [
      'M12 4.5l1.8 3.9 3.9 1.8-3.9 1.8-1.8 3.9-1.8-3.9-3.9-1.8 3.9-1.8 1.8-3.9Z',
      'M18.7 15l.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9.9-2Z',
    ],
  },
  JOINT_NATIONAL: {
    paths: [
      'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
      'M3.6 9.5h16.8M3.6 14.5h16.8',
      'M12 3a14.5 14.5 0 0 1 0 18M12 3a14.5 14.5 0 0 0 0 18',
    ],
  },
  FALLBACK: {
    paths: [
      'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
      'M16 8l-2.3 5.7L8 16l2.3-5.7L16 8Z',
    ],
  },
}

const channelDesc: Record<string, string> = {
  COMPREHENSIVE: '高考成绩+综合素质评价，多元录取',
  STRONG_BASE: '聚焦基础学科，培养拔尖创新人才',
  SPECIAL_PROGRAM: '面向农村和贫困地区考生的专项招生',
  ETHNIC_MINORITY: '面向少数民族考生的特殊招生',
  JOINT_NATIONAL: '面向华侨、港澳台学生的联合招生',
}

// 直通考院：各省市教育考试院官网（写死动态数据，模板 v-for 渲染）
interface ExamSite {
  name: string
  url: string
}

const examSites: ExamSite[] = [
  { name: '北京教育考试院', url: 'http://www.bjeea.cn' },
  { name: '上海教育考试院', url: 'http://www.shmeea.edu.cn' },
  { name: '天津招考资讯网', url: 'http://www.zhaokao.net' },
  { name: '重庆教育考试院', url: 'http://www.cqksy.cn' },
  { name: '河北教育考试院', url: 'http://www.hebeea.edu.cn' },
  { name: '山西招生考试网', url: 'http://www.sxkszx.cn' },
  { name: '内蒙古教育招生考试中心', url: 'http://www.nm.zsks.cn' },
  { name: '辽宁招生考试之窗', url: 'http://www.lnzsks.com' },
  { name: '吉林省教育考试院', url: 'http://www.jleea.edu.cn' },
  { name: '黑龙江省招生考试信息港', url: 'http://www.lzk.hl.cn' },
  { name: '江苏省教育考试院', url: 'http://www.jseea.cn' },
  { name: '浙江省教育考试院', url: 'http://www.zjzs.net' },
  { name: '安徽教育招生考试院', url: 'http://www.ahzsks.cn' },
  { name: '福建省教育考试院', url: 'http://www.fjzs.com.cn' },
  { name: '江西省教育考试院', url: 'http://www.jxeea.cn' },
  { name: '山东省教育招生考试院', url: 'http://www.sdzk.cn' },
  { name: '河南省招生办公室', url: 'http://www.heao.gov.cn' },
  { name: '湖北省教育考试院', url: 'http://www.hbea.edu.cn' },
  { name: '湖南省教育考试院', url: 'http://www.hneeb.cn' },
  { name: '广东省教育考试院', url: 'http://www.eeagd.edu.cn' },
  { name: '广西招生考试院', url: 'http://www.gxeea.cn' },
  { name: '海南省考试局', url: 'http://ea.hainan.gov.cn' },
  { name: '四川省教育考试院', url: 'http://www.sceea.cn' },
  { name: '贵州省招生考试院', url: 'http://www.gzszk.com' },
  { name: '云南省招考频道', url: 'http://www.ynzs.cn' },
  { name: '新疆招生网', url: 'http://www.xjzk.gov.cn' },
  { name: '陕西省教育考试院', url: 'http://www.sneac.com' },
  { name: '甘肃省教育考试院', url: 'http://www.ganseea.cn' },
  { name: '宁夏教育考试院', url: 'http://www.nxjyks.cn' },
  { name: '青海省教育考试网', url: 'http://www.qhjyks.com' },
  { name: '西藏教育考试院', url: 'http://www.xzedu.gov.cn' },
  { name: '香港考试及评核局', url: 'https://www.hkeaa.edu.hk' },
  { name: '澳门教育及青年发展局', url: 'https://www.dsej.gov.mo' },
]

const displayChannels = computed(() =>
  channelCodes
    .map((code) => channels.value.find((c) => c.channelCode === code))
    .filter((c): c is SpecialChannelListVO => !!c)
)

async function fetchChannels() {
  loading.value = true
  try {
    const res = await getChannelList({ page: 1, size: 100 })
    channels.value = res.data.data.records
  } catch (e: any) {
    ElMessage.error(e?.message || '获取通道信息失败')
  } finally {
    loading.value = false
  }
}

// 查询档案：登录读服务端（无本地游客档案时自动迁移入库），游客读 localStorage
async function fetchArchive() {
  try {
    const { archive: a } = await loadArchiveSmart()
    displayForm.value = a
  } catch {
    displayForm.value = null
  }
}

// 通道卡「热门」标签（纯展示）
function isHot(code: string) {
  return code === 'COMPREHENSIVE' || code === 'STRONG_BASE'
}

// 通道卡「需资格」标签（纯展示）
function isQualified(code: string) {
  return code === 'SPECIAL_PROGRAM'
}

// 其余通道：进入通道大学列表
function goChannel(item: SpecialChannelListVO) {
  router.push(`/gaokao/channel/${item.id}`)
}

onMounted(() => {
  measureHeader()
  void initPage()
  // 从其它页跳转过来（/gaokao?editArchive=1）：自动打开档案填写弹窗
  if (route.query.editArchive) {
    openArchiveDialog()
  }
})

// 初始化：拉数据 → 等 Vue 把展开的卡片刷进 DOM → 再处理锚点滚动。
// 关键：fetchChannels 把 loading 置 false 后，DOM 不会立刻更新（异步刷新）。
// 若不等 nextTick 就去量 #exams 的位置，此时卡片区还是 200px loading 占位，
// 滚动目标算得太靠上，等卡片撑开后 #exams 被推到页底，滚动就到不了底部。
async function initPage() {
  await Promise.allSettled([fetchChannels(), fetchArchive()])
  // 资讯依赖档案省份，档案就绪后再拉取
  void fetchNews()
  // 等 DOM 完成刷新（卡片展开、页面高度稳定）再滚动，避免位置偏移
  await nextTick()
  await nextTick()
  // 从导航「直通院校」跳转（/gaokao#exams）：跨页进入时确保滚动到考院区。
  // router scrollBehavior 固定 top:0 不处理 hash，故页面挂载 + 布局稳定后手动滚动兜底；
  // 同页点击已由 AppHeader/MobileNavDrawer 的 pushNavItem 直接滚动。
  if (route.hash && route.hash.includes('exams')) {
    scrollToHash('exams')
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-brand-gray-50 via-orange-50/20 to-white">
    <!-- 档案吸附条：常驻导航栏下方，往下滑动页面时固定不动 -->
    <div class="archive-bar" :style="{ top: `${stickyTop}px` }">
      <div class="archive-bar-inner">
        <span class="archive-bar-label">
          <svg class="h-3.5 w-3.5 shrink-0 text-brand-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          高考档案
        </span>
        <!-- 信息整体靠右：省份行内下拉在前，年份/分数/科目点击打开档案弹窗 -->
        <div class="archive-bar-info">
          <el-select
            v-model="archiveProvince"
            placeholder="选择省份"
            filterable
            size="small"
            class="archive-province-select"
          >
            <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
          <template v-if="displayForm && displayForm.score">
            <button class="archive-chip" title="点击修改档案" @click="openArchiveDialog">
              {{ displayForm.gaokaoYear }}年
            </button>
            <button class="archive-chip" title="点击修改档案" @click="openArchiveDialog">
              {{ displayForm.score }}分
            </button>
            <button v-if="archiveSubjects.length" class="archive-chip" title="点击修改档案" @click="openArchiveDialog">
              {{ archiveSubjects.join('/') }}
            </button>
          </template>
          <button v-else class="archive-chip archive-chip-empty" @click="openArchiveDialog">
            点击填写年份 / 分数 / 科目
          </button>
        </div>
      </div>
    </div>

    <main class="flex-1">
      <div class="container mx-auto px-6 pb-16 relative">
        <div class="max-w-5xl mx-auto min-h-[200px]">
          <!-- 纯白品牌 Hero：无装饰、无发光，突出文字层级 -->
          <Motion
            :initial="revealInitial"
            :while-in-view="revealIn"
            :transition="{ duration: 0.5 }"
            :in-view-options="{ once: true }"
            class="pt-10 md:pt-12"
          >
            <div class="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-4 py-1.5 text-sm font-medium text-brand-orange border border-brand-orange/20">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path v-for="d in normalGlyph.paths" :key="d" :d="d" />
              </svg>
              高考志愿填报
            </div>
            <h2 class="mt-5 text-3xl font-bold tracking-tight text-gray-800 md:text-4xl">选对赛道，让每一分都不浪费</h2>
            <p class="mt-3 text-base text-gray-500">统招是主渠道，特殊类型招生是更多可能</p>
          </Motion>

          <!-- 特殊通道分区：蓝字标题 + 5 卡网格（3+2） -->
          <div class="mt-12 mb-5 flex items-baseline justify-between gap-4">
            <h3 class="border-l-[4px] border-brand-blue pl-3 text-xl font-bold text-gray-800">特殊通道</h3>
            <span class="hidden md:block text-sm text-gray-400">综合评价 · 强基计划 · 专项计划 · 民族班 · 全国联招</span>
          </div>

          <div v-loading="loading" class="grid grid-cols-1 gap-4 min-h-[200px] sm:grid-cols-2 md:grid-cols-3">
            <Motion
              v-for="(item, i) in displayChannels"
              :key="item.channelCode"
              :initial="revealInitial"
              :while-in-view="revealIn"
              :in-view-options="{ once: true }"
              :transition="{ duration: 0.5, delay: 0.15 + i * 0.06 }"
              class="h-full"
            >
              <div
                class="group flex h-full flex-col rounded-2xl bg-gradient-to-r from-gray-100/40 via-gray-50/20 to-white p-6 shadow-card border border-gray-100/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-blue/40 hover:shadow-card-hover cursor-pointer"
                @click="goChannel(item)"
              >
                <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue transition-colors group-hover:bg-brand-blue/15">
                  <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path v-for="d in (channelIcon[item.channelCode] || channelIcon.FALLBACK).paths" :key="d" :d="d" />
                  </svg>
                </div>
                <h4 class="text-[17px] font-bold text-gray-800">{{ item.channelName }}</h4>
                <div class="mb-2 flex min-h-[24px] flex-wrap gap-1.5">
                  <span v-if="isHot(item.channelCode)" class="inline-flex items-center rounded-full bg-brand-orange/10 px-2.5 py-0.5 text-xs font-medium text-brand-orange border border-brand-orange/20">热门</span>
                  <span v-if="isQualified(item.channelCode)" class="inline-flex items-center rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-xs font-medium text-brand-blue border border-brand-blue/20">需资格</span>
                </div>
                <p class="flex-1 text-sm leading-relaxed text-gray-500">{{ channelDesc[item.channelCode] || item.subtitle }}</p>
                <span class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-blue">
                  进入通道
                  <svg class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M6.5 3.5 11 8l-4.5 4.5" />
                  </svg>
                </span>
              </div>
            </Motion>
          </div>

          <!-- 热点资讯：按档案省份推送，仅展示 4 条，查看更多跳资讯列表页 -->
          <div class="mt-12 mb-5 flex items-center justify-between gap-4">
            <h3 class="border-l-[4px] border-brand-orange pl-3 text-xl font-bold text-gray-800">热点资讯</h3>
            <button class="news-more-btn" @click="goArticles">
              查看更多
              <svg class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6.5 3.5 11 8l-4.5 4.5" />
              </svg>
            </button>
          </div>

          <div v-if="hasArchive" v-loading="newsLoading" class="min-h-[120px]">
            <div v-if="newsList.length" class="grid grid-cols-1 gap-x-10 gap-y-2.5 md:grid-cols-2">
              <button
                v-for="item in newsList"
                :key="item.id"
                class="news-item"
                :title="item.summary || item.title"
                @click="goNewsDetail(item.id)"
              >
                <span class="news-dot" aria-hidden="true"></span>
                <span class="news-title">{{ item.title }}</span>
              </button>
            </div>
            <p v-else-if="!newsLoading" class="py-8 text-center text-sm text-gray-400">本省暂无已发布的资讯</p>
          </div>
          <div v-else class="rounded-xl border border-orange-100 bg-white/70 px-5 py-4 text-sm text-gray-500">
            填写高考档案后，将按你的省份推送热点资讯 ·
            <button class="font-medium text-brand-orange hover:underline" @click="openArchiveDialog">去填写</button>
          </div>
        </div>

        <!-- 底部品牌橙渐变分隔条（衔接直通考院，消除硬断崖） -->
        <div class="mx-auto mt-12 h-[3px] max-w-5xl rounded-full bg-gradient-to-r from-transparent via-brand-orange/40 to-transparent" aria-hidden="true"></div>
        <div v-if="!loading && !displayChannels.length" class="mt-6 text-center text-sm text-gray-400">
          暂无其他报考通道数据
        </div>
      </div>

      <!-- 直通考院：各省市教育考试院官网 -->
      <section id="exams" class="exams-section">
        <div class="section-bg"></div>
        <div class="container fade-in-up">
          <div class="section-header">
            <h2 class="section-title">直通考院</h2>
            <p class="section-subtitle">快速访问各省市教育考试院官方网站，获取最新招考信息</p>
          </div>
          <div class="exams-container">
            <div class="exams-grid">
              <a
                v-for="site in examSites"
                :key="site.name"
                :href="site.url"
                target="_blank"
                rel="noopener noreferrer"
                class="exam-link"
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path d="M6.5 3.5h-3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3" stroke-linecap="round" />
                  <path d="M9.5 2.5h4v4M13.5 2.5 7 9" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span>{{ site.name }}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 高考档案填写弹窗（模拟填报 / 制定方案） -->
    <ArchiveDialog v-model:visible="archiveDialogVisible" :initial-form="displayForm" @saved="handleArchiveSaved" />
  </div>
</template>

<style scoped>
/* ===== 档案吸附条：sticky 吸在导航栏下方（top 由 JS 测量导航实际高度） ===== */
.archive-bar {
  position: sticky;
  z-index: 40;
  background: rgba(255, 251, 245, 0.92);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(249, 115, 22, 0.15);
  box-shadow: 0 1px 8px rgba(249, 115, 22, 0.06);
}

.archive-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 7px 24px;
}

.archive-bar-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

@media (max-width: 767px) {
  .archive-bar-label {
    display: none;
  }
}

.archive-bar-info {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
  margin-left: auto;
}

.archive-province-select {
  width: 118px;
}

.archive-province-select :deep(.el-select__wrapper) {
  border-radius: 16px;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
  background: #fff;
}

.archive-province-select :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #f97316 inset;
}

.archive-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #fff;
  border: 1px solid rgba(249, 115, 22, 0.25);
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.archive-chip:hover {
  border-color: #f97316;
  color: #f97316;
  background: #fff7ed;
}

.archive-chip-empty {
  border-style: dashed;
  color: #9ca3af;
  font-weight: 400;
}

/* ===== 热点资讯 ===== */
.news-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 16px;
  background: #fff;
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.35);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.news-more-btn:hover {
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  transform: translateY(-1px);
}

.news-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 8px 6px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease;
}

.news-item:hover {
  background: rgba(249, 115, 22, 0.06);
}

.news-item:hover .news-title {
  color: #f97316;
}

.news-dot {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #fb923c);
}

.news-title {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  flex: 1;
  min-width: 0;
  color: #374151;
  font-size: 14px;
  line-height: 1.6;
  text-align: left;
  transition: color 0.2s ease;
}

/* ===== 直通考院 ===== */
.exams-section {
  position: relative;
  padding: 64px 24px 72px;
  background: linear-gradient(180deg, #fff 0%, #fff7ed 60%, #fff 100%);
  overflow: hidden;
  /* 锚点滚动时避免被 sticky header 遮挡 */
  scroll-margin-top: 88px;
}

.section-bg {
  position: absolute;
  top: -120px;
  right: -80px;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.section-bg::after {
  content: '';
  position: absolute;
  left: -240px;
  bottom: -160px;
  width: 360px;
  height: 360px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 146, 60, 0.1) 0%, transparent 70%);
}

.container {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 36px;
}

.section-title {
  display: inline-block;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 0.02em;
}

.section-title::after {
  content: '';
  display: block;
  width: 44px;
  height: 4px;
  margin: 10px auto 0;
  border-radius: 2px;
  background: linear-gradient(90deg, #f97316, #fb923c);
}

.section-subtitle {
  margin-top: 12px;
  font-size: 15px;
  color: #6b7280;
}

.exams-container {
  display: flex;
  justify-content: center;
}

.exams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  width: 100%;
}

.exam-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid rgba(249, 115, 22, 0.12);
  border-radius: 12px;
  color: #4b5563;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.25s ease;
}

.exam-link svg {
  width: 14px;
  height: 14px;
  color: #fb923c;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.exam-link:hover {
  border-color: #f97316;
  color: #f97316;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.12);
  transform: translateY(-2px);
}

.exam-link:hover svg {
  transform: translate(1px, -1px);
}

/* 进场动画（页面加载时播放一次） */
.fade-in-up {
  animation: fadeInUp 0.6s ease both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
