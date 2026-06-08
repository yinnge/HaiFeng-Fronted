<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import SiteFooter from '@/components/SiteFooter.vue'
import logoMain from '@/assets/images/logo-main.png'

interface StatConfig {
  label: string
  target: number
  display: (v: number) => string
  color: string
}

const stats: StatConfig[] = [
  { label: '服务学生', target: 10, display: v => `${v}W+`, color: '#e8722a' },
  { label: '院校库', target: 2800, display: v => `${v}+`, color: '#f5a54a' },
  { label: '满意度', target: 986, display: v => `${(v / 10).toFixed(1)}%`, color: '#fbbf24' },
  { label: '专业顾问', target: 500, display: v => `${v}+`, color: '#e8722a' },
]

const currentValues = ref<number[]>(stats.map(() => 0))
const hasAnimated = ref(false)

let animationFrameId: number | null = null

const animateStats = () => {
  if (hasAnimated.value) return
  hasAnimated.value = true

  const startTime = performance.now()
  const duration = 1800

  const step = (timestamp: number) => {
    const elapsed = timestamp - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - (1 - progress) * (1 - progress)

    stats.forEach((stat, i) => {
      currentValues.value[i] = Math.round(eased * stat.target)
    })

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(step)
    } else {
      stats.forEach((stat, i) => {
        currentValues.value[i] = stat.target
      })
    }
  }

  animationFrameId = requestAnimationFrame(step)
}

let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStats()
      }
    })
  }, { threshold: 0.3 })

  const el = document.querySelector('.stats-section')
  if (el) observer.observe(el)
})

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  if (observer) observer.disconnect()
})

const router = useRouter()

function goLogin() {
  router.push('/login')
}

function goProfile() {
  router.push('/profile')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center justify-between px-6 py-4">
        <div class="flex items-center gap-3">
          <img
            :src="logoMain"
            alt="海枫未来规划院"
            class="h-10 w-10 object-contain"
          />
          <h1 class="text-xl font-bold text-gray-800">海枫未来规划院</h1>
        </div>
        <div class="flex items-center gap-4">
          <button
            class="text-gray-600 hover:text-orange-500 transition-colors font-medium"
            @click="goProfile"
          >
            个人中心
          </button>
          <button
            class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300"
            @click="goLogin"
          >
            登录
          </button>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <main class="flex-1">
      <div class="container mx-auto px-6 py-20 text-center">
        <div class="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm text-orange-600">
          <span class="inline-block h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
          专业 · 科学 · 个性化
        </div>
        <h2 class="mb-6 text-4xl font-bold text-gray-800 md:text-5xl lg:text-6xl leading-tight">
          高考志愿填报<br class="md:hidden" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">智能规划平台</span>
        </h2>
        <p class="mx-auto mb-10 max-w-2xl text-lg text-gray-500 leading-relaxed">
          基于大数据分析和AI算法，为您提供科学、精准的高考志愿填报方案，助您圆梦理想大学。从高考志愿到职场上岸，我们全程陪伴。
        </p>
        <div class="flex flex-col items-center justify-center gap-4 md:flex-row">
          <button class="group w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-4 text-lg font-semibold text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 md:w-auto flex items-center justify-center gap-2">
            开始规划
            <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <button class="w-full rounded-xl border-2 border-gray-200 px-8 py-4 text-lg font-semibold text-gray-700 hover:border-orange-300 hover:text-orange-500 transition-all md:w-auto">
            了解更多
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-section">
        <div class="stats-container">
          <div
            v-for="(stat, index) in stats"
            :key="stat.label"
            class="stat-item"
          >
            <div
              class="stat-value"
              :style="{ color: stat.color }"
            >
              {{ stat.display(currentValues[index]) }}
            </div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- Features -->
      <section class="container mx-auto grid gap-8 px-6 py-16 md:grid-cols-3">
        <div class="group rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-orange-200">
          <div class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-3xl group-hover:from-orange-200 group-hover:to-amber-200 transition-colors">
            🎯
          </div>
          <h3 class="mb-3 text-xl font-bold text-gray-800">智能推荐</h3>
          <p class="text-gray-500 leading-relaxed">根据分数、兴趣、职业规划，智能推荐最适合的院校和专业</p>
        </div>
        <div class="group rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-orange-200">
          <div class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-3xl group-hover:from-orange-200 group-hover:to-amber-200 transition-colors">
            📊
          </div>
          <h3 class="mb-3 text-xl font-bold text-gray-800">数据分析</h3>
          <p class="text-gray-500 leading-relaxed">整合历年录取数据，提供精准的录取概率分析</p>
        </div>
        <div class="group rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-orange-200">
          <div class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 text-3xl group-hover:from-orange-200 group-hover:to-amber-200 transition-colors">
            👨‍🎓
          </div>
          <h3 class="mb-3 text-xl font-bold text-gray-800">专家指导</h3>
          <p class="text-gray-500 leading-relaxed">资深规划师一对一咨询，助您做出最佳选择</p>
        </div>
      </section>

    </main>

    <!-- Footer -->
    <SiteFooter />
  </div>
</template>

<style scoped>
.stats-section {
  padding: 48px 24px 40px;
  position: relative;
  background: #ffffff;
}

.stats-section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 900px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(232, 114, 42, 0.2), rgba(251, 191, 36, 0.2), transparent);
}

.stats-container {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 42px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
  transition: color 0.3s;
}

.stat-label {
  font-size: 15px;
  color: #6b7280;
  font-weight: 500;
  letter-spacing: 0.5px;
}

@media (max-width: 1024px) {
  .stats-container {
    gap: 24px;
  }

  .stat-value {
    font-size: 36px;
  }
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 28px 20px;
  }

  .stat-value {
    font-size: 32px;
  }
}

@media (max-width: 640px) {
  .stats-section {
    padding: 36px 16px 32px;
  }

  .stats-container {
    gap: 24px 16px;
  }

  .stat-value {
    font-size: 28px;
  }

  .stat-label {
    font-size: 13px;
  }
}
</style>
