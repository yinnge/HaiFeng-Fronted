<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getUniversityDetail } from '@/api/university'
import type { UniversityDetailVO } from '@/types/university'
import { ElMessage } from 'element-plus'
import LaboratoryTab from '@/components/university/LaboratoryTab.vue'
import DepartmentTab from '@/components/university/DepartmentTab.vue'
import SubjectEvaluationTab from '@/components/university/SubjectEvaluationTab.vue'
import PostgradMajorForUniversityTab from '@/components/major/PostgradMajorForUniversityTab.vue'
import ChannelTab from '@/components/university/ChannelTab.vue'
import AdmissionGroupTab from '@/components/university/AdmissionGroupTab.vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<UniversityDetailVO | null>(null)
const activeTab = ref('laboratory')

const tabs = [
  { key: 'laboratory', label: '重点实验室', iconClass: 'laboratory' },
  { key: 'postgrad', label: '考研专业', iconClass: 'postgrad' },
  { key: 'department', label: '院系', iconClass: 'department' },
  { key: 'evaluation', label: '学科评估', iconClass: 'evaluation' },
  { key: 'channel', label: '特殊通道', iconClass: 'channel' },
  { key: 'admission', label: '录取数据', iconClass: 'admission' },
]

async function fetchDetail() {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('院校ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getUniversityDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取院校详情失败')
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/university')
}

function goGuide() {
  router.push(`/university/${route.params.id}/guide`)
}

onMounted(fetchDetail)

// ===== 亮点数字滚动计数（纯展示动效，不触碰业务逻辑）=====
const scoreAnim = reactive({
  history: 0,
  science: 0,
  recommend: 0,
  majors: 0,
})

function animateNumber(key: keyof typeof scoreAnim, target: number) {
  const from = scoreAnim[key]
  if (from === target) return
  const duration = 700
  const start = performance.now()
  const step = (now: number) => {
    const p = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    scoreAnim[key] = Math.round(from + (target - from) * eased)
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

watch(detail, (d) => {
  if (!d) return
  animateNumber('history', d.historyGroupScore ?? 0)
  animateNumber('science', d.scienceGroupScore ?? 0)
  animateNumber('majors', d.majorCount ?? 0)
  animateNumber('recommend', d.recommendationRate ?? 0)
})

// ===== 排行榜 key → 中文名 + 缩写 + 简称（纯展示映射，未知 key 兜底）=====
const rankingMeta: Record<string, { name: string; abbr: string; short: string }> = {
  qs: { name: 'QS 世界大学排名', abbr: 'QS', short: 'QS 世界大学' },
  ruanke: { name: '软科中国大学排名', abbr: '软', short: '软科中国大学' },
  usnews: { name: 'US News 世界大学排名', abbr: 'US', short: 'US News 世界' },
  wushulian: { name: '武书连中国大学排名', abbr: '武', short: '武书连中国大学' },
  xiaoyouhui: { name: '校友会中国大学排名', abbr: '校', short: '校友会中国大学' },
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-brand-gray-50 via-orange-50/20 to-white">
    <main class="flex-1 container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
      <!-- 骨架屏 -->
      <template v-if="loading && !detail">
        <div class="rounded-2xl overflow-hidden mb-6">
          <div class="skeleton w-full h-[320px] rounded-2xl" />
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div v-for="i in 4" :key="i" class="skeleton h-20 rounded-xl" />
        </div>
        <div class="space-y-6">
          <div class="detail-card rounded-2xl p-6 shadow-card border border-gray-100/60 bg-gradient-to-r from-gray-100/40 via-gray-50/20 to-white space-y-4">
            <div class="h-5 skeleton w-28 rounded" />
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div v-for="i in 9" :key="i" class="space-y-1.5">
                <div class="h-3 skeleton w-14 rounded" />
                <div class="h-4 skeleton w-20 rounded" />
              </div>
            </div>
          </div>
          <div class="detail-card rounded-2xl p-6 shadow-card border border-gray-100/60 bg-gradient-to-r from-gray-100/40 via-gray-50/20 to-white space-y-3">
            <div class="h-5 skeleton w-20 rounded" />
            <div v-for="i in 3" :key="i" class="h-3 skeleton rounded" :style="{ width: `${100 - i * 15}%` }" />
          </div>
        </div>
      </template>

      <template v-else-if="detail">
        <!-- 沉浸式 Hero：校名/标签/档案/按钮叠加在大图横幅上 -->
        <section class="hero relative rounded-2xl overflow-hidden shadow-card mb-6">
          <template v-if="detail.carouselImages?.length">
            <el-carousel height="360px" indicator-position="none" arrow="always" class="hero-carousel">
              <el-carousel-item v-for="(img, idx) in detail.carouselImages" :key="idx">
                <img :src="img" :alt="`${detail.name} ${idx + 1}`" class="h-full w-full object-cover" />
              </el-carousel-item>
            </el-carousel>
          </template>
          <div v-else class="hero-fallback" />

          <!-- 渐隐遮罩，保证文字可读 -->
          <div class="hero-mask" />

          <!-- 叠加信息层 -->
          <div class="hero-info">
            <h1 class="hero-name">{{ detail.name }}</h1>
            <p v-if="detail.nameEn" class="hero-name-en">{{ detail.nameEn }}</p>

            <div v-if="detail.tags?.length" class="hero-tags">
              <span v-for="tag in detail.tags" :key="tag" class="hero-tag">{{ tag }}</span>
            </div>

            <p
              v-if="[detail.region, detail.provinceName, detail.category, detail.nature].filter(Boolean).length"
              class="hero-meta"
            >
              {{ [detail.region, detail.provinceName, detail.category, detail.nature].filter(Boolean).join(' · ') }}
            </p>

            <div class="hero-actions">
              <button class="hero-btn-ghost" @click="goBack">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                返回列表
              </button>
              <button class="hero-btn-solid" @click="goGuide">
                查看适应指南
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        <!-- 亮点统计卡 -->
        <section class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="stat-card">
            <p class="stat-label">历史组分数线</p>
            <p class="stat-value">{{ detail.historyGroupScore ? scoreAnim.history : '-' }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">物理组分数线</p>
            <p class="stat-value">{{ detail.scienceGroupScore ? scoreAnim.science : '-' }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">推荐率</p>
            <p class="stat-value">{{ detail.recommendationRate ? `${scoreAnim.recommend}%` : '-' }}</p>
          </div>
          <div class="stat-card">
            <p class="stat-label">专业数</p>
            <p class="stat-value">{{ detail.majorCount ? scoreAnim.majors : '-' }}</p>
          </div>
        </section>

        <!-- 单栏内容流 -->
        <div class="space-y-6">
          <!-- 详细信息 -->
          <section class="detail-card rounded-2xl p-6 shadow-card border border-gray-100/60 bg-gradient-to-r from-gray-100/40 via-gray-50/20 to-white">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
              <h3 class="text-xl font-bold text-gray-800">详细信息</h3>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3.5 text-sm">
              <div class="flex items-center gap-2">
                <span class="dot-gray shrink-0" />
                <span class="text-gray-400 w-20 shrink-0">所属联盟</span>
                <span class="text-gray-700 font-medium">{{ detail.famousUnion || '-' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="dot-brand shrink-0" />
                <span class="text-gray-400 w-20 shrink-0">博士点</span>
                <span class="text-gray-700 font-medium">{{ detail.hasDoctorate ? '有' : '无' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="dot-brand shrink-0" />
                <span class="text-gray-400 w-20 shrink-0">硕士点</span>
                <span class="text-gray-700 font-medium">{{ detail.hasMaster ? '有' : '无' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="dot-brand shrink-0" />
                <span class="text-gray-400 w-20 shrink-0">学历层次</span>
                <span class="text-gray-700 font-medium">{{ detail.educationLevel || '-' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="dot-gray shrink-0" />
                <span class="text-gray-400 w-20 shrink-0">主管部门</span>
                <span class="text-gray-700 font-medium">{{ detail.department || '-' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="dot-gray shrink-0" />
                <span class="text-gray-400 w-20 shrink-0">地址</span>
                <span class="text-gray-700">{{ detail.address || '-' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="dot-gray shrink-0" />
                <span class="text-gray-400 w-20 shrink-0">招生电话</span>
                <span class="text-gray-700">{{ detail.admissionPhone || '-' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="dot-gray shrink-0" />
                <span class="text-gray-400 w-20 shrink-0">官网</span>
                <a v-if="detail.website" :href="detail.website" target="_blank" class="text-brand-orange hover:underline truncate">{{ detail.website }}</a>
                <span v-else class="text-gray-700">-</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="dot-gray shrink-0" />
                <span class="text-gray-400 w-20 shrink-0">推荐年份</span>
                <span class="text-gray-700 font-medium">{{ detail.recommendationYear ?? '-' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="dot-gray shrink-0" />
                <span class="text-gray-400 w-20 shrink-0">出国比例</span>
                <span class="text-gray-700">{{ detail.abroadRate || '-' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="dot-gray shrink-0" />
                <span class="text-gray-400 w-20 shrink-0">男女比例</span>
                <span class="text-gray-700 font-medium">{{ detail.genderRatio || '-' }}</span>
              </div>
            </div>

            <!-- 排行榜 -->
            <div v-if="detail.rankings && Object.keys(detail.rankings).length" class="mt-5 pt-4 border-t border-gray-100/80">
              <div class="flex items-center gap-2 mb-3">
                <div class="w-1 h-3.5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                <p class="text-sm font-semibold text-gray-700">排行榜</p>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                <div v-for="(val, key) in detail.rankings" :key="key" class="rounded-lg bg-white border border-gray-200 px-2 py-3 text-center">
                  <el-tooltip :content="rankingMeta[key]?.name || key" placement="top">
                    <span class="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-brand-gold to-brand-gold-light text-white text-xs font-bold cursor-help shadow-md">{{ rankingMeta[key]?.abbr || key.slice(0, 1).toUpperCase() }}</span>
                  </el-tooltip>
                  <p class="mt-1.5 text-xs text-gray-700 leading-snug min-h-[28px] flex items-center justify-center">{{ rankingMeta[key]?.short || rankingMeta[key]?.name || key }}</p>
                  <div class="mt-1 flex items-baseline justify-center gap-0.5">
                    <span class="text-xl font-bold text-brand-orange tabular-nums">{{ val }}</span>
                    <span class="text-xs text-gray-400">名</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- 院校介绍 -->
          <section class="detail-card rounded-2xl p-6 shadow-card border border-gray-100/60 bg-gradient-to-r from-gray-100/40 via-gray-50/20 to-white">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
              <h3 class="text-xl font-bold text-gray-800">院校介绍</h3>
            </div>
            <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.introduction || '暂无详细介绍' }}</p>
          </section>

          <!-- Tab 导航 -->
          <section class="flex justify-center">
            <div class="tab-bar inline-flex items-center gap-1 rounded-2xl shadow-card border border-gray-100/60 p-1.5 bg-gradient-to-r from-gray-100/40 via-gray-50/20 to-white">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                class="tab-btn"
                :class="activeTab === tab.key ? 'tab-active' : 'tab-idle'"
                @click="activeTab = tab.key"
              >
                <svg v-if="tab.iconClass === 'laboratory'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <svg v-else-if="tab.iconClass === 'postgrad'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <svg v-else-if="tab.iconClass === 'department'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <svg v-else-if="tab.iconClass === 'evaluation'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <svg v-else-if="tab.iconClass === 'channel'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <svg v-else-if="tab.iconClass === 'admission'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {{ tab.label }}
              </button>
            </div>
          </section>

          <!-- Tab 内容区 -->
          <section class="detail-card rounded-2xl p-6 shadow-card border border-gray-100/60 bg-gradient-to-r from-gray-100/40 via-gray-50/20 to-white min-h-[200px]">
            <Transition name="fade" mode="out-in">
              <LaboratoryTab v-if="activeTab === 'laboratory'" :university-id="route.params.id as string" />
              <PostgradMajorForUniversityTab v-else-if="activeTab === 'postgrad'" :university-id="route.params.id as string" />
              <DepartmentTab v-else-if="activeTab === 'department'" :university-id="route.params.id as string" />
              <SubjectEvaluationTab v-else-if="activeTab === 'evaluation'" :university-id="route.params.id as string" />
              <ChannelTab v-else-if="activeTab === 'channel'" :university-id="route.params.id as string" />
              <AdmissionGroupTab v-else-if="activeTab === 'admission'" :university-id="route.params.id as string" />
            </Transition>
          </section>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
/* ===== 沉浸式 Hero ===== */
.hero {
  height: 360px;
  animation: fadeUp 0.55s ease both;
}
.hero-carousel {
  height: 100%;
}
.hero-fallback {
  height: 100%;
  background: linear-gradient(135deg, #e8722a 0%, #f5a54a 100%);
}
.hero-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(22, 14, 6, 0.72) 0%, rgba(22, 14, 6, 0.35) 40%, rgba(22, 14, 6, 0) 68%);
  pointer-events: none;
}
.hero-info {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1.5rem 2rem;
}
.hero-name {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.25);
}
.hero-name-en {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.72);
  margin-top: 2px;
}
.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
.hero-tag {
  padding: 2px 10px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(2px);
  color: #ffffff;
  font-size: 12px;
}
.hero-meta {
  margin-top: 0.5rem;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}
.hero-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}
.hero-btn-ghost,
.hero-btn-solid {
  padding: 0.55rem 1.1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
}
.hero-btn-ghost {
  border: 1px solid rgba(255, 255, 255, 0.85);
  color: #ffffff;
}
.hero-btn-ghost:hover {
  background: rgba(255, 255, 255, 0.15);
}
.hero-btn-solid {
  background: #ffffff;
  color: #e8722a;
  font-weight: 500;
}
.hero-btn-solid:hover {
  background: #fff4e6;
}

/* ===== 亮点统计卡 ===== */
.stat-card {
  background: #ffffff;
  border: 1px solid rgba(232, 114, 42, 0.08);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  animation: fadeUp 0.55s ease both;
}
.stat-card:nth-child(1) { animation-delay: 0.08s; }
.stat-card:nth-child(2) { animation-delay: 0.14s; }
.stat-card:nth-child(3) { animation-delay: 0.20s; }
.stat-card:nth-child(4) { animation-delay: 0.26s; }
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px -10px rgba(232, 114, 42, 0.18);
}
.stat-label {
  font-size: 13px;
  color: #9aa3ad;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #e8722a;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

/* ===== 字段前色点 ===== */
.dot-brand {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: #e8722a;
  flex-shrink: 0;
}
.dot-gray {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: #cbd5e1;
  flex-shrink: 0;
}

/* ===== 卡片：入场 stagger + hover 动效 ===== */
.detail-card {
  animation: fadeUp 0.55s ease both;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.space-y-6 > .detail-card:nth-child(1) { animation-delay: 0.30s; }
.space-y-6 > .detail-card:nth-child(2) { animation-delay: 0.36s; }
.space-y-6 > .detail-card:nth-child(4) { animation-delay: 0.42s; }
.detail-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 32px -10px rgba(232, 114, 42, 0.18);
}

/* ===== Tab 按钮 ===== */
.tab-btn {
  padding: 0.625rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.tab-active {
  background: linear-gradient(90deg, #e8722a, #f97316);
  color: #ffffff;
  box-shadow: 0 6px 14px -6px rgba(232, 114, 42, 0.6);
}
.tab-idle {
  color: #6b7280;
}
.tab-idle:hover {
  background: rgba(232, 114, 42, 0.1);
  color: #e8722a;
}

/* ===== 关键帧 ===== */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}

/* ===== Tab 内容切换过渡 ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ===== 响应式 ===== */
@media (max-width: 767px) {
  .hero {
    height: 280px;
  }
  .hero-info {
    padding: 1rem 1.25rem;
  }
  .hero-name {
    font-size: 1.5rem;
  }
  .stat-value {
    font-size: 22px;
  }
}
</style>
