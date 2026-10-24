<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { GaokaoArchiveVO } from '@/api/gaokao'
import { scrollToHash } from '@/utils/navAnchor'
import ArchiveBar from '@/components/gaokao/ArchiveBar.vue'
import ArchiveQuickForm from '@/components/gaokao/ArchiveQuickForm.vue'
import FileLoadPage from '@/views/fileload/FileLoadPage.vue'
import { useGaokaoModuleNav } from '@/composables/useGaokaoModuleNav'

const router = useRouter()
const route = useRoute()

/**
 * 高考模块子视图切换（由 ArchiveBar 的目录项经路由 query 驱动）：
 * - 'highfile' → 内联渲染「高中资料」FileLoadPage（audience=high + applicableStage=当前身份；
 *                高考真题入口复用同一 tab 并携带 stage=高考资料 预选）；
 * - 其它/缺省 → 高考志愿 landing（Hero + 特殊通道 + 直通考院）。
 */
const activeTab = computed(() => (route.query.tab as string) || 'volunteer')

/** ===== 高中身份（高一/高二/高三，默认高三）：驱动内嵌「高中资料」的列表查询 =====
 *  由共享 composable 提供（模块级共享 ref，跨子页实时同步 + localStorage 持久化）。 */
const { HIGH_IDENTITIES, highIdentity, onHighIdentityChange, gaokaoExtraItems } = useGaokaoModuleNav()

// ===== 高考档案：展示/编辑统一由共享吸附条组件（ArchiveBar）负责，
// 本页只接收事件更新展示数据并联动资讯区 =====
const displayForm = ref<GaokaoArchiveVO | null>(null)

const archiveBarRef = ref<InstanceType<typeof ArchiveBar> | null>(null)

// 档案变化（初始加载 / 省份下拉切换 / 弹窗保存）：更新展示 + 按新省份刷新资讯
function onArchiveChange(archive: GaokaoArchiveVO | null) {
  displayForm.value = archive
}

// 档案保存成功（模拟填报）：跳转专业组查询
function onArchiveSaved() {
  router.push('/gaokao/groups')
}

// 右侧测算卡片保存后：同步导航栏右侧状态（省份/年份/分数/科目），两端保持一致
function onCardChange(archive: GaokaoArchiveVO | null) {
  displayForm.value = archive
  archiveBarRef.value?.applyArchive(archive)
}

// ===== 首页 Hero 轮播 =====
interface HeroSlide {
  img: string
  action: 'dialog' | 'link'
  title: string
  sub: string
}
const heroSlides: HeroSlide[] = [
  {
    img: `${import.meta.env.BASE_URL}img_1.png`,
    action: 'dialog',
    title: '完善高考档案',
    sub: '一步填写，智能推荐院校与专业',
  },
  {
    img: `${import.meta.env.BASE_URL}img_2.png`,
    action: 'link',
    title: '高考真题资料',
    sub: '历年真题与解析，备考更有底气',
  },
]
const activeSlide = ref(0)
let carouselTimer: ReturnType<typeof setInterval> | null = null

function startCarousel() {
  stopCarousel()
  carouselTimer = setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % heroSlides.length
  }, 4500)
}
function stopCarousel() {
  if (carouselTimer) {
    clearInterval(carouselTimer)
    carouselTimer = null
  }
}
function pauseCarousel() {
  stopCarousel()
}
function resumeCarousel() {
  startCarousel()
}
function goSlide(i: number) {
  activeSlide.value = i
  startCarousel()
}
// 轮播图点击：图1 弹出档案弹窗；图2 跳转高考真题资料（highfile + 预选高考资料）
function onSlideClick(i: number) {
  if (heroSlides[i].action === 'dialog') {
    archiveBarRef.value?.openDialog()
  } else {
    void router.push('/gaokao?tab=highfile&stage=高考资料')
  }
}

// 特殊通道为低频路径，landing 仅保留单行入口，5 类通道卡片移至 /gaokao/special
function goSpecialChannels() {
  router.push('/gaokao/special')
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

onMounted(() => {
  void initPage()
  startCarousel()
  // 从其它页跳转过来（/gaokao?editArchive=1）：自动打开档案填写弹窗
  if (route.query.editArchive) {
    nextTick(() => archiveBarRef.value?.openDialog())
  }
})

onBeforeUnmount(() => {
  stopCarousel()
})

// 初始化：等 Vue 完成首屏渲染、页面高度稳定后再处理锚点滚动
async function initPage() {
  // 资讯由 ArchiveBar 的 archive-change 事件驱动（档案就绪后自动拉取）
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
  <div class="min-h-screen flex flex-col bg-surface-bg">
    <!-- 档案吸附条：常驻导航栏下方，往下滑动页面时固定不动（共享组件，Groups 页复用）
         高中模块：目录最左扩展「高中资料」，右侧省份后加身份下拉（高一/高二/高三） -->
    <ArchiveBar
      ref="archiveBarRef"
      :extra-items="gaokaoExtraItems"
      :identity-options="HIGH_IDENTITIES"
      :identity="highIdentity"
      @archive-change="onArchiveChange"
      @saved="onArchiveSaved"
      @identity-change="onHighIdentityChange"
    />

    <main class="flex-1">
      <!-- 高中资料：页内「当前身份」平铺按钮独立驱动查询（与右上角档案身份分离）；
            identityOptions 触发表单内身份筛选行，initialIdentity 取用户档案身份(默认高三) -->
      <FileLoadPage
        v-if="activeTab === 'highfile'"
        audience="high"
        :identity-options="HIGH_IDENTITIES"
        :initial-identity="highIdentity"
        title="高中资料"
      />
      <template v-else>
      <div class="container mx-auto px-6 pb-16 relative">
          <div class="max-w-5xl mx-auto min-h-[200px]">
          <!-- 首页 Hero：左轮播（约 65%）+ 右志愿测算卡片（约 35%），等高约 615px -->
          <div class="hero-new">
            <!-- 左：轮播区（圆角 16px + 微投影，点击切换/跳转） -->
            <div
              class="hero-carousel"
              @mouseenter="pauseCarousel"
              @mouseleave="resumeCarousel"
            >
              <div class="carousel-track" :style="{ transform: `translateX(-${activeSlide * 100}%)` }">
                <div
                  v-for="(slide, i) in heroSlides"
                  :key="i"
                  class="carousel-slide"
                  @click="onSlideClick(i)"
                >
                  <!-- 双层图：底层同图放大模糊填满容器（吃掉裁剪空白），上层完整显示不裁剪 -->
                  <img class="carousel-slide-bg" :src="slide.img" alt="" aria-hidden="true" />
                  <img :src="slide.img" :alt="slide.title" />
                  <div class="carousel-mask"></div>
                  <div class="carousel-caption">
                    <p class="carousel-caption-title">{{ slide.title }}</p>
                    <p class="carousel-caption-sub">{{ slide.sub }}</p>
                  </div>
                </div>
              </div>
              <!-- 胶囊型指示器：激活态品牌橙，非激活态半透明白色 -->
              <div class="carousel-indicators">
                <button
                  v-for="(slide, i) in heroSlides"
                  :key="i"
                  type="button"
                  class="carousel-dot"
                  :class="{ 'is-active': i === activeSlide }"
                  :aria-label="`切换到第 ${i + 1} 张`"
                  @click.stop="goSlide(i)"
                ></button>
              </div>
            </div>

            <!-- 右：志愿测算卡片（与导航栏右侧状态联动，数据经档案源双向同步） -->
            <ArchiveQuickForm :archive="displayForm" @saved="onArchiveSaved" @change="onCardChange" />
          </div>

          <!-- 特殊通道：低频路径，仅保留单行入口，5 类通道卡片移至 /gaokao/special -->
          <div class="mt-12 mb-5 flex items-baseline justify-between gap-4">
            <h3 class="border-l-[4px] border-sem-yellow pl-3 text-xl font-bold text-gray-800">特殊通道</h3>
            <span class="hidden md:block text-sm text-gray-400">非统招路径 · 仅符合相应资格的考生可报考</span>
          </div>

          <button
            type="button"
            class="group flex w-full items-center gap-4 rounded-2xl border border-surface-border bg-white px-5 py-4 text-left shadow-hf transition-all duration-300 hover:-translate-y-0.5 hover:border-sem-yellow/40 hover:shadow-hf-hover active:scale-[0.995]"
            @click="goSpecialChannels"
          >
            <span class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sem-yellow-bg text-[#D97706]">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M16 8l-2.3 5.7L8 16l2.3-5.7L16 8Z" />
              </svg>
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-[15px] font-bold text-gray-800">特殊招生通道</span>
              <span class="mt-1.5 flex flex-wrap gap-1.5">
                <span class="rounded-md bg-sem-blue-bg px-1.5 py-0.5 text-[11px] font-semibold text-sem-blue">综合评价</span>
                <span class="rounded-md bg-sem-yellow-bg px-1.5 py-0.5 text-[11px] font-semibold text-[#D97706]">强基计划</span>
                <span class="rounded-md bg-sem-green-bg px-1.5 py-0.5 text-[11px] font-semibold text-sem-green">专项计划</span>
                <span class="rounded-md bg-sem-red-bg px-1.5 py-0.5 text-[11px] font-semibold text-sem-red">民族班</span>
                <span class="rounded-md bg-[#F1F5F9] px-1.5 py-0.5 text-[11px] font-semibold text-[#475569]">全国联招</span>
              </span>
            </span>
            <span class="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-gray-500 transition-colors group-hover:text-brand-orange">
              <span class="hidden sm:inline">查看全部</span>
              <svg class="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M6.5 3.5 11 8l-4.5 4.5" />
              </svg>
            </span>
          </button>

          <!-- 热点资讯区块已移除：gaokao 资讯系统整页删除，home 资讯由首页 ArticleListDialog 承担 -->
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
      </template>
    </main>
  </div>
</template>

<style scoped>
/* ===== 档案吸附条样式已抽取至共享组件 components/gaokao/ArchiveBar.vue ===== */

/* ===== 直通考院 ===== */
.exams-section {
  position: relative;
  padding: 64px 24px 72px;
  background: var(--neutral-bg);
  border-top: 1px solid var(--neutral-border);
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
  background: radial-gradient(circle, rgba(5, 150, 105, 0.08) 0%, transparent 70%);
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
  background: radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%);
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
  background: var(--sem-green);
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
  border: 1px solid var(--neutral-border);
  border-radius: 12px;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.25s ease;
}

.exam-link svg {
  width: 14px;
  height: 14px;
  color: var(--sem-green);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.exam-link:hover {
  border-color: var(--sem-green-soft);
  color: var(--sem-green);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
  transform: translateY(-2px);
}

.exam-link:hover svg {
  transform: translate(1px, -1px);
}

.exam-link:active {
  transform: translateY(0) scale(0.98);
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

/* ===== 首页 Hero：左轮播 + 右测算卡片（等高约 615px） ===== */
.hero-new {
  display: grid;
  grid-template-columns: 1fr;
  /* 列间距 0：轮播与测算卡贴紧（用户要求去掉中间间隔）；移动端堆叠保留 20px 行距 */
  gap: 20px 0;
  padding-top: 24px;
}

@media (min-width: 1024px) {
  .hero-new {
    /* 轮播:表单 = 13:7（1024 内容区 ≈ 665px + 358px，用户定稿；勿回退 4:1/58:42） */
    grid-template-columns: 13fr 7fr;
    height: 615px;
  }
}

/* 左侧轮播：圆角 16px + 微投影，悬停轻微缩放 */
.hero-carousel {
  position: relative;
  overflow: hidden;
  height: 475px;
  border-radius: 16px;
  box-shadow: 0 12px 32px -12px rgba(15, 23, 42, 0.18);
  background: #fff;
}

@media (min-width: 1024px) {
  .hero-carousel {
    height: 100%;
  }
}

.carousel-track {
  display: flex;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.carousel-slide {
  position: relative;
  flex: 0 0 100%;
  height: 100%;
  cursor: pointer;
  overflow: hidden;
}

/* 底层垫图：同图 cover + 放大 + 高斯模糊，填满容器作背景，消除 contain 留白 */
/* 双类选择器压过下方 .carousel-slide img（其 position:relative 会顶掉 absolute） */
.carousel-slide .carousel-slide-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.15);
  filter: blur(18px) saturate(1.1);
  display: block;
}

/* 上层主图：contain 完整显示海报，不裁剪 */
.carousel-slide img {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  transition: transform 0.6s ease;
}

.carousel-slide:hover > img:not(.carousel-slide-bg) {
  transform: scale(1.04);
}

/* 底部暗化遮罩，保证文案可读 */
.carousel-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 42%, rgba(0, 0, 0, 0.38) 100%);
  pointer-events: none;
}

.carousel-caption {
  position: absolute;
  left: 24px;
  bottom: 26px;
  color: #fff;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

.carousel-caption-title {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.carousel-caption-sub {
  margin: 4px 0 0;
  font-size: 13px;
  opacity: 0.92;
}

/* 胶囊型指示器：激活态蓝色，非激活态半透明白色 */
.carousel-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2;
}

.carousel-dot {
  width: 22px;
  height: 8px;
  border: none;
  padding: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.carousel-dot:hover {
  background: rgba(255, 255, 255, 0.8);
}

.carousel-dot.is-active {
  width: 30px;
  background: var(--sem-blue);
}
</style>
