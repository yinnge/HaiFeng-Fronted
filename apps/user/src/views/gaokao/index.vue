<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Motion, useReducedMotion } from 'motion-v'
import { getChannelList } from '@/api/special'
import { getArchive, type GaokaoArchiveVO } from '@/api/gaokao'
import type { SpecialChannelListVO } from '@/types/special'
import { scrollToHash } from '@/utils/navAnchor'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const channels = ref<SpecialChannelListVO[]>([])

// 是否已建立高考档案（决定统招卡片展示「填写档案」还是「进入报志愿」）
const hasArchive = ref(false)

// 高考档案摘要（纯展示用，不改动任何业务流程/接口）
const archive = ref<GaokaoArchiveVO | null>(null)

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

// 查询用户是否已填写高考档案
async function fetchArchive() {
  try {
    const res = await getArchive()
    archive.value = res.data.data
    hasArchive.value = !!res.data.data
  } catch {
    // 未建档或查询失败，统一按「未填写档案」处理
    archive.value = null
    hasArchive.value = false
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

// 统招入口：未建档先填档案，已建档直接进入报志愿
function goNormal() {
  if (hasArchive.value) {
    goWishPlan()
  } else {
    goArchive()
  }
}

// 填写 / 修改高考档案
function goArchive() {
  router.push('/gaokao/archive')
}

// 进入报志愿（专业组选择）
function goWishPlan() {
  router.push('/gaokao/groups')
}

onMounted(() => {
  void initPage()
})

// 初始化：拉数据 → 等 Vue 把展开的卡片刷进 DOM → 再处理锚点滚动。
// 关键：fetchChannels 把 loading 置 false 后，DOM 不会立刻更新（异步刷新）。
// 若不等 nextTick 就去量 #exams 的位置，此时卡片区还是 200px loading 占位，
// 滚动目标算得太靠上，等卡片撑开后 #exams 被推到页底，滚动就到不了底部。
async function initPage() {
  await Promise.allSettled([fetchChannels(), fetchArchive()])
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

          <!-- 统招主通道大卡：核心位置，橙渐变主视觉 + 档案状态 + 双按钮 -->
          <Motion
            :initial="revealInitial"
            :while-in-view="revealIn"
            :transition="{ duration: 0.5, delay: 0.1 }"
            :in-view-options="{ once: true }"
            class="mt-7"
          >
            <section
              class="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-brand-orange-dark via-brand-orange to-brand-orange-light p-7 shadow-card-active transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-6px_rgba(232,114,42,0.4)] md:p-9"
              @click="goNormal"
            >
              <div class="flex flex-col gap-6 md:flex-row md:items-center">
                <!-- 左：图标 + 标题 + 描述 -->
                <div class="flex-1">
                  <div class="flex flex-wrap items-center gap-4">
                    <div class="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white transition-transform duration-300 group-hover:scale-105">
                      <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path v-for="d in normalGlyph.paths" :key="d" :d="d" />
                      </svg>
                    </div>
                    <div>
                      <div class="flex flex-wrap items-center gap-2.5">
                        <h3 class="text-xl font-bold text-white md:text-2xl">统招 · 主通道</h3>
                        <span class="inline-flex items-center rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-semibold text-white border border-white/30">
                          志愿填报首选
                        </span>
                      </div>
                      <p class="mt-1 text-[15px] font-medium text-white/90">全体考生适用，从这里开始</p>
                    </div>
                  </div>
                </div>

                <!-- 右：档案状态 + 操作按钮 -->
                <div class="shrink-0 space-y-3 md:w-[360px]">
                  <div class="rounded-xl bg-white/10 px-4 py-3 text-sm">
                    <template v-if="hasArchive && archive">
                      <div class="flex items-center gap-2 font-medium text-white">
                        <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-300" />
                        已建档
                      </div>
                      <div class="mt-1.5 leading-relaxed text-white/85">
                        {{ archive.gaokaoYear ?? '-' }} · {{ archive.gaokaoProvince || '-' }} · {{ archive.subjectType || '-' }} · {{ archive.score ?? '-' }} 分 · 位次 {{ archive.rank ?? '-' }}
                      </div>
                    </template>
                    <template v-else>
                      <div class="flex items-center gap-2 font-medium text-white">
                        <span class="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-300" />
                        尚未填写高考档案
                      </div>
                      <div class="mt-1.5 leading-relaxed text-white/85">填写档案后开启志愿规划 · 约 30 秒即可完成</div>
                    </template>
                  </div>
                  <div class="flex flex-wrap gap-2.5">
                    <button
                      class="rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-orange-dark shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
                    >
                      {{ hasArchive ? '进入报志愿 →' : '填写高考档案 →' }}
                    </button>
                    <button
                      v-if="hasArchive"
                      class="rounded-full border border-white/50 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/15"
                      @click.stop="goArchive"
                    >
                      修改档案
                    </button>
                  </div>
                </div>
              </div>
            </section>
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
  </div>
</template>

<style scoped>
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
