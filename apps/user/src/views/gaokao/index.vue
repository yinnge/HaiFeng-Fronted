<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getChannelList } from '@/api/special'
import { getArchive } from '@/api/gaokao'
import type { SpecialChannelListVO } from '@/types/special'
import { scrollToHash } from '@/utils/navAnchor'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const channels = ref<SpecialChannelListVO[]>([])

// 是否已建立高考档案（决定统招卡片展示「填写档案」还是「进入报志愿」）
const hasArchive = ref(false)

// 其余通道代码（按展示顺序）
// 注意：统招不在此列表内——它是产品固定入口，直接硬编码展示，
// 不依赖后台是否在 t_special_channel 录入 NORMAL 记录，否则运营没录数据时入口会整个消失
const channelCodes = ['COMPREHENSIVE', 'STRONG_BASE', 'SPECIAL_PROGRAM', 'ETHNIC_MINORITY', 'JOINT_NATIONAL']

const channelIcon: Record<string, string> = {
  COMPREHENSIVE: '📊',
  STRONG_BASE: '🏛️',
  SPECIAL_PROGRAM: '📋',
  ETHNIC_MINORITY: '🌟',
  JOINT_NATIONAL: '🌏',
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
    ElMessage.error(e?.response?.data?.msg || '获取通道信息失败')
  } finally {
    loading.value = false
  }
}

// 查询用户是否已填写高考档案
async function fetchArchive() {
  try {
    const res = await getArchive()
    hasArchive.value = !!res.data.data
  } catch {
    // 未建档或查询失败，统一按「未填写档案」处理
    hasArchive.value = false
  }
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
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <main class="flex-1">
      <div class="container mx-auto px-6 py-12 text-center">
        <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
          <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
          选择报考类型
        </div>
        <h2 class="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
          高考志愿填报
        </h2>
        <p class="mx-auto max-w-2xl text-gray-500">
          选择您的报考类型，查看该通道关联的招生院校，为志愿填报做好准备
        </p>
      </div>

      <div class="container mx-auto px-6 pb-16">
        <div v-loading="loading" class="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto min-h-[200px]">
          <!-- 统招：产品固定入口，始终展示，不依赖后端通道数据 -->
          <div
            class="group rounded-2xl bg-white p-8 shadow-lg border-2 border-orange-200 hover:shadow-xl transition-all cursor-pointer"
            @click="goNormal"
          >
            <div class="mb-5 flex items-start justify-between">
              <div class="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-3xl group-hover:from-orange-200 group-hover:to-amber-200 transition-colors">
                🎓
              </div>
              <span
                v-if="hasArchive"
                class="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600"
              >
                已建档
              </span>
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-800">统招</h3>
            <p class="text-gray-500 leading-relaxed">普通高考统招志愿填报，填写高考档案后开始规划</p>

            <div v-if="hasArchive" class="mt-6 flex gap-2">
              <button
                class="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
                @click.stop="goWishPlan"
              >
                进入报志愿 →
              </button>
              <button
                class="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600 font-medium hover:border-orange-300 hover:text-orange-600 transition-all"
                @click.stop="goArchive"
              >
                修改档案
              </button>
            </div>
            <button
              v-else
              class="mt-6 w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
              @click.stop="goArchive"
            >
              填写高考档案 →
            </button>
          </div>

          <!-- 其余通道：进入通道大学列表 -->
          <div
            v-for="item in displayChannels"
            :key="item.channelCode"
            class="group rounded-2xl bg-white p-8 shadow-lg border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all cursor-pointer"
            @click="goChannel(item)"
          >
            <div class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-3xl group-hover:from-orange-200 group-hover:to-amber-200 transition-colors">
              {{ channelIcon[item.channelCode] || '📌' }}
            </div>
            <h3 class="mb-3 text-xl font-bold text-gray-800">{{ item.channelName }}</h3>
            <p class="text-gray-500 leading-relaxed">{{ channelDesc[item.channelCode] || item.subtitle }}</p>
            <button
              class="mt-6 w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
            >
              进入通道 →
            </button>
          </div>
        </div>
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
