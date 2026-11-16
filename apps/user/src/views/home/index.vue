<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import HomePathwaySection from './components/HomePathwaySection.vue'
import ToolboxSection from './components/toolbox/ToolboxSection.vue'
import HfHeroSection from '@/components/home/hero/HfHeroSection.vue'
import MentorSection from './planner/MentorSection.vue'

// ===== Scroll Reveal =====
let revealObserver: IntersectionObserver | null = null

// 入场动画收尾：动画跑完后补 is-settled，
// 让 .reveal 的 will-change 归还 auto —— 否则整段 section（首页矩阵 10 张卡）
// 会长期停留在合成层里，被位图化重采样后 1px 描边糊成 2px 灰雾、文字发虚。
// 详见 assets/styles/index.css 中 .reveal 段落的说明。
const settleReveal = (el: Element) => {
  el.classList.add('is-settled')
}

const revealElement = (el: Element) => {
  el.classList.add('revealed')
  const onEnd = (e: Event) => {
    const evt = e as TransitionEvent
    if (evt.target !== el || evt.propertyName !== 'filter') return
    el.removeEventListener('transitionend', onEnd)
    settleReveal(el)
  }
  el.addEventListener('transitionend', onEnd)
  // 兜底：减弱动效 / 元素被隐藏导致 transitionend 不触发时也能收尾
  window.setTimeout(() => {
    el.removeEventListener('transitionend', onEnd)
    settleReveal(el)
  }, 1200)
}

const initScrollReveal = () => {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealElement(entry.target)
      }
    })
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' })

  const elements = document.querySelectorAll('.reveal, .reveal-left')
  elements.forEach(el => {
    // 对已在视口内的元素立即 reveal，避免 observer 未触发导致永久模糊
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      revealElement(el)
    } else {
      revealObserver!.observe(el)
    }
  })
}

// ===== Lifecycle =====
onMounted(() => {
  initScrollReveal()
})

onUnmounted(() => {
  if (revealObserver) revealObserver.disconnect()
})
</script>

<template>
  <div class="home-page">
    <!-- ==================== 消隐微网格 + 顶部双色极光（DESIGN.md） ==================== -->
    <div class="bg-grid-aurora" aria-hidden="true"></div>

    <!-- ==================== Hero（双栏：价值主张 + 罗盘导航） ==================== -->
    <HfHeroSection />

    <!-- ==================== 全周期规划矩阵 / 生涯星图（可切换） ==================== -->
    <HomePathwaySection />

    <!-- ==================== 百宝箱 ==================== -->
    <section id="toolbox" class="section-wrapper section-toolbox">
      <div class="section-container reveal">
        <div class="section-head reveal-left">
          <h2 class="section-title">百宝箱</h2>
          <p class="section-sub">查询工具合集 · 院校、专业、城市、企业行业与竞赛证书一箱搞定</p>
        </div>

        <ToolboxSection />
      </div>
    </section>

    <!-- ==================== 名师指导（6 张入口卡片 + 名单/详情/预约弹窗） ==================== -->
    <MentorSection />

  </div>
</template>

<style scoped>
/* ============ Page ============ */
.home-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.25rem 4rem;
}

/* ============ 消隐微网格 + 顶部双色氛围极光（DESIGN.md） ============
   全屏固定层：以“未来规划”为中心点向外辐射，网格在屏幕中心显现、
   向四周羽化隐入纯净底色；顶部左微橙右微蓝两道柔光托住大标题。
   1) 作为 .home-page 的嵌套子元素（非 main 直接子节点），
      不受全局 `.app-shell main > * { background: transparent !important }` 影响。
   2) 祖先链（.app-shell / main）无 transform/filter，fixed 正确相对视口。
   3) 自身 mask 让网格+极光在边缘自然消隐，露出 html 同色底 #F8FAFC，无缝衔接。 */
.bg-grid-aurora {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-color: #f8fafc; /* 纯净极浅灰冷白底，与全局 html 画布同色 */
  background-image:
    /* 顶部极淡双色环境光晕：左微橙，右微蓝，烘托科技与青春 */
    radial-gradient(at 20% 0%, rgba(249, 115, 22, 0.08) 0px, transparent 50%),
    radial-gradient(at 80% 0%, rgba(59, 130, 246, 0.06) 0px, transparent 50%),
    /* 细微网格线 (32px * 32px 宫格) —— 深蓝灰极弱透明度，不发脏 */
    linear-gradient(to right, rgba(15, 23, 42, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 32px 32px, 32px 32px;

  /* 核心：径向遮罩，让网格在四周自然消隐（不生硬到底） */
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 60%, transparent 100%);
  mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 60%, transparent 100%);
}

/* ============ Sections ============ */
.section-wrapper {
  position: relative;
  padding: 3.5rem 0;
  scroll-margin-top: 8.75rem;
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
}

.section-head {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1f2937;
  position: relative;
  padding-left: 0.875rem;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 1.25rem;
  border-radius: 2px;
  background: var(--sem-blue);
}

.section-toolbox .section-title::before {
  background: var(--sem-yellow);
}

.section-sub {
  margin-top: 0.5rem;
  font-size: 0.95rem;
  color: #6b7280;
}

/* ============ Scroll Reveal（从左往右显现） ============ */
.reveal-left {
  opacity: 0;
  transform: translateX(-32px);
  transition:
    opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.reveal-left.revealed {
  opacity: 1;
  /* 用 none 而非 translateX(0)：平移归零后仍写成 transform 会让元素保留变换节点，
     叠加上层 .reveal 的合成层容易把子级描边/文字一起揉糊 */
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .reveal-left {
    transition: none;
    opacity: 1;
    transform: none;
  }
}

/* ============ Responsive ============ */
@media (max-width: 768px) {
  .home-page {
    padding: 0 0.875rem 3rem;
  }
}

@media (max-width: 640px) {
  .section-wrapper {
    padding: 2.5rem 0;
  }
}

</style>
