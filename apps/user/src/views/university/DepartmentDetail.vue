<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getDepartmentReport } from '@/api/university/department'
import type { DepartmentReportVO } from '@/types/university/department'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const report = ref<DepartmentReportVO | null>(null)
const deptName = ref((route.query.name as string) || '院系详情')
const deptType = ref((route.query.type as string) || '')

async function fetchReport() {
  const deptId = route.params.deptId as string
  if (!deptId) {
    ElMessage.error('院系ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getDepartmentReport(deptId)
    report.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取院系分析报告失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchReport)

function formatMoney(value: number) {
  return value.toFixed(1)
}

function goBack() {
  router.back()
}

// ===== 就业前景指标数字滚动（纯展示动效，值若为非数字格式则原样显示）=====
const prospectDisplay = ref<Record<string, string>>({})
const barsReady = ref(false)

const prospectKeys = ['employmentRate', 'masterSalary', 'furtherStudyRate', 'fortune500Rate', 'salaryGrowthRate', 'overseasRate'] as const

function parseNumeric(raw: string): { num: number; suffix: string; decimals: number } | null {
  const s = String(raw ?? '')
  const m = s.match(/^(\d+(?:\.\d+)?)(.*)$/)
  if (!m) return null
  const num = parseFloat(m[1])
  const decimals = m[1].includes('.') ? (m[1].split('.')[1]?.length || 1) : 0
  return { num, suffix: m[2], decimals }
}

function animateProspects(p: DepartmentReportVO['prospects']) {
  const parsed = prospectKeys.map((k) => ({ k, r: parseNumeric(p[k]) }))
  const duration = 700
  const start = performance.now()
  const step = (now: number) => {
    const t = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - t, 3)
    const obj: Record<string, string> = {}
    for (const { k, r } of parsed) {
      obj[k] = r ? (r.num * eased).toFixed(r.decimals) + r.suffix : (p[k] || '-')
    }
    prospectDisplay.value = obj
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

watch(report, (r) => {
  if (!r) return
  barsReady.value = false
  requestAnimationFrame(() => {
    barsReady.value = true
    if (r.prospects) animateProspects(r.prospects)
  })
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-4 sm:px-6 py-8 max-w-6xl" v-loading="loading">
      <!-- 沉浸式 Hero 头图 -->
      <section class="dept-hero relative overflow-hidden rounded-2xl shadow-lg shadow-orange-200/60 mb-6">
        <div class="dept-orb dept-orb-1" />
        <div class="dept-orb dept-orb-2" />
        <button class="dept-back" @click="goBack">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 18l-6-6 6-6" />
          </svg>
          返回
        </button>
        <div class="relative z-10 px-6 sm:px-8 py-9 sm:py-12">
          <div class="flex items-center gap-3 flex-wrap">
            <h1 class="dept-title">{{ deptName }}</h1>
            <span v-if="deptType" class="dept-type">{{ deptType }}</span>
          </div>
          <p v-if="report?.subtitle" class="dept-subtitle">{{ report.subtitle }}</p>
        </div>
      </section>

      <template v-if="report">
        <!-- 双栏主体：左 2/3 阅读型主体 + 右 1/3 速览（sticky） -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          <!-- 左栏：阅读型重内容 -->
          <div class="lg:col-span-2 space-y-6">
            <!-- 院系概述 -->
            <section v-if="report.overview" class="detail-card rounded-2xl p-6 shadow-card border border-gray-100 bg-white">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                <h3 class="text-lg font-bold text-gray-800">院系概述</h3>
              </div>
              <h4 v-if="report.overview.title" class="text-gray-700 font-medium mb-2">{{ report.overview.title }}</h4>
              <ul v-if="report.overview.descriptions?.length" class="list-disc list-inside text-gray-600 space-y-1">
                <li v-for="(desc, idx) in report.overview.descriptions" :key="idx">{{ desc }}</li>
              </ul>
            </section>

            <!-- 专业详情 -->
            <section v-if="report.subjectsDetail?.length" class="detail-card rounded-2xl p-6 shadow-card border border-gray-100 bg-white">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                <h3 class="text-lg font-bold text-gray-800">专业详情</h3>
              </div>
              <div class="subjects-grid">
                <div v-for="(major, idx) in report.subjectsDetail" :key="idx" class="major-card">
                  <h4 class="font-semibold text-gray-800 mb-2">{{ major.majorName }}</h4>
                  <div v-if="major.tags?.length" class="flex flex-wrap gap-1 mb-2">
                    <span v-for="tag in major.tags" :key="tag" class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{{ tag }}</span>
                  </div>
                  <div class="text-xs text-gray-500 space-y-1">
                    <p v-if="major.coreSubject"><span class="text-gray-400">核心学科：</span>{{ major.coreSubject }}</p>
                    <p v-if="major.supportSubject"><span class="text-gray-400">支撑学科：</span>{{ major.supportSubject }}</p>
                    <p v-if="major.positioning" class="text-gray-600 mt-1">{{ major.positioning }}</p>
                    <div v-if="major.coreCourses?.length" class="mt-1">
                      <span class="text-gray-400">核心课程：</span>
                      <span v-for="(c, ci) in major.coreCourses" :key="ci" class="inline-block bg-white rounded px-1.5 py-0.5 mr-1 mb-1 border border-gray-200">{{ c }}</span>
                    </div>
                    <div v-if="major.abilities?.length" class="mt-1">
                      <span class="text-gray-400">培养能力：</span>
                      <span v-for="(a, ai) in major.abilities" :key="ai" class="inline-block bg-white rounded px-1.5 py-0.5 mr-1 mb-1 border border-gray-200">{{ a }}</span>
                    </div>
                    <div v-if="major.certificates?.length" class="mt-1">
                      <span class="text-gray-400">推荐证书：</span>
                      <span v-for="(c, ci) in major.certificates" :key="ci" class="inline-block bg-white rounded px-1.5 py-0.5 mr-1 mb-1 border border-gray-200">{{ c }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- 城市薪资分布 -->
            <section v-if="report.citySalary?.length" class="detail-card rounded-2xl p-6 shadow-card border border-gray-100 bg-white">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                <h3 class="text-lg font-bold text-gray-800">城市薪资分布</h3>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div v-for="(item, idx) in report.citySalary" :key="idx" class="city-card">
                  <div class="font-medium text-gray-800">{{ item.cityName }}</div>
                  <div class="text-sm text-brand-orange font-semibold mt-1">{{ formatMoney(item.minSalary) }} - {{ formatMoney(item.maxSalary) }} 万元/年</div>
                </div>
              </div>
            </section>

            <!-- 就业趋势 -->
            <section v-if="report.trends" class="detail-card rounded-2xl p-6 shadow-card border border-gray-100 bg-white">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                <h3 class="text-lg font-bold text-gray-800">就业趋势</h3>
              </div>
              <div class="space-y-3">
                <div v-if="report.trends.highGrowthTracks?.length">
                  <span class="text-sm text-gray-400">高速增长赛道：</span>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <span v-for="t in report.trends.highGrowthTracks" :key="t" class="pill pill-orange text-sm">{{ t }}</span>
                  </div>
                </div>
                <div v-if="report.trends.policyOrientations?.length">
                  <span class="text-sm text-gray-400">核心政策导向：</span>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <span v-for="p in report.trends.policyOrientations" :key="p" class="pill pill-blue text-sm">{{ p }}</span>
                  </div>
                </div>
                <div v-if="report.trends.environmentAnalysis?.length">
                  <span class="text-sm text-gray-400">就业环境分析：</span>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <span v-for="e in report.trends.environmentAnalysis" :key="e" class="pill pill-orange text-sm">{{ e }}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- 右栏：速览摘要（sticky 跟随滚动） -->
          <div class="space-y-6 lg:sticky lg:top-24">
            <!-- 就业前景指标卡（白底 + 彩色数字） -->
            <section v-if="report.prospects" class="detail-card rounded-2xl p-5 shadow-card border border-gray-100 bg-white">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                <h3 class="text-lg font-bold text-gray-800">就业前景</h3>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="prospect-card">
                  <p class="prospect-label">综合就业率</p>
                  <p class="prospect-value" style="color:#16a34a">{{ prospectDisplay.employmentRate || report.prospects.employmentRate || '-' }}</p>
                </div>
                <div class="prospect-card">
                  <p class="prospect-label">硕士平均起薪</p>
                  <p class="prospect-value" style="color:#2563eb">{{ prospectDisplay.masterSalary || report.prospects.masterSalary || '-' }}</p>
                </div>
                <div class="prospect-card">
                  <p class="prospect-label">继续深造率</p>
                  <p class="prospect-value" style="color:#9333ea">{{ prospectDisplay.furtherStudyRate || report.prospects.furtherStudyRate || '-' }}</p>
                </div>
                <div class="prospect-card">
                  <p class="prospect-label">世界 500 强</p>
                  <p class="prospect-value" style="color:#d97706">{{ prospectDisplay.fortune500Rate || report.prospects.fortune500Rate || '-' }}</p>
                </div>
                <div class="prospect-card">
                  <p class="prospect-label">年薪增长率</p>
                  <p class="prospect-value" style="color:#e11d48">{{ prospectDisplay.salaryGrowthRate || report.prospects.salaryGrowthRate || '-' }}</p>
                </div>
                <div class="prospect-card">
                  <p class="prospect-label">海外深造占比</p>
                  <p class="prospect-value" style="color:#0d9488">{{ prospectDisplay.overseasRate || report.prospects.overseasRate || '-' }}</p>
                </div>
              </div>
            </section>

            <!-- 专业组成（进度条动画填充） -->
            <section v-if="report.majorCompose?.length" class="detail-card rounded-2xl p-6 shadow-card border border-gray-100 bg-white">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                <h3 class="text-lg font-bold text-gray-800">专业组成</h3>
              </div>
              <div class="space-y-4">
                <div v-for="(item, idx) in report.majorCompose" :key="idx">
                  <div class="flex justify-between text-sm mb-1.5">
                    <span class="text-gray-700">{{ item.subjectName }}</span>
                    <span class="text-brand-orange font-semibold">{{ item.percentage }}%</span>
                  </div>
                  <div class="bar-track">
                    <div class="bar-fill" :style="{ width: barsReady ? item.percentage + '%' : '0%' }" />
                  </div>
                </div>
              </div>
            </section>

            <!-- 考研方向 -->
            <section v-if="report.postgraduate" class="detail-card rounded-2xl p-6 shadow-card border border-gray-100 bg-white">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                <h3 class="text-lg font-bold text-gray-800">考研方向</h3>
              </div>
              <h4 v-if="report.postgraduate.title" class="text-gray-700 font-medium mb-2">{{ report.postgraduate.title }}</h4>
              <div v-if="report.postgraduate.directions?.length" class="flex flex-wrap gap-2">
                <span v-for="(d, idx) in report.postgraduate.directions" :key="idx" class="pill pill-orange text-sm">{{ d }}</span>
              </div>
            </section>
          </div>
        </div>

        <!-- 全宽：专业薪资（表格） -->
        <section v-if="report.salary?.length" class="detail-card rounded-2xl p-6 shadow-card border border-gray-100 bg-white mt-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
            <h3 class="text-lg font-bold text-gray-800">专业薪资</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 text-gray-400">
                  <th class="text-left py-2 px-3">专业名称</th>
                  <th class="text-left py-2 px-3">最低薪资（万元/年）</th>
                  <th class="text-left py-2 px-3">最高薪资（万元/年）</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in report.salary" :key="idx" class="border-b border-gray-50">
                  <td class="py-2.5 px-3 text-gray-800">{{ item.majorName }}</td>
                  <td class="py-2.5 px-3 text-gray-600">{{ formatMoney(item.minSalary) }}</td>
                  <td class="py-2.5 px-3 text-gray-600">{{ formatMoney(item.maxSalary) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 全宽：职业路径（竖向时间线） -->
        <section v-if="report.career?.length" class="detail-card rounded-2xl p-6 shadow-card border border-gray-100 bg-white mt-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
            <h3 class="text-lg font-bold text-gray-800">职业路径</h3>
          </div>
          <div class="space-y-7">
            <div v-for="(path, idx) in report.career" :key="idx">
              <h4 class="font-semibold text-gray-800 mb-1">{{ path.pathTitle }}</h4>
              <p v-if="path.pathDesc" class="text-sm text-gray-500 mb-4">{{ path.pathDesc }}</p>
              <div class="timeline">
                <div v-for="(stage, si) in path.stages" :key="si" class="timeline-item">
                  <span class="timeline-dot" />
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="stage-badge">{{ stage.stageTitle }}</span>
                    <span class="text-xs text-gray-400">{{ stage.workYears }}</span>
                    <span class="text-sm text-gray-700 font-medium">{{ stage.position }}</span>
                    <span v-if="stage.salaryRange" class="ml-auto text-brand-orange font-semibold text-sm">{{ stage.salaryRange }} 万</span>
                  </div>
                </div>
              </div>
              <p v-if="path.stages[0]?.coreGoal" class="mt-2 text-xs text-gray-400">核心目标：{{ path.stages[0].coreGoal }}</p>
            </div>
          </div>
        </section>

        <!-- 全宽：免责声明 -->
        <section v-if="report.disclaimer" class="detail-card rounded-2xl p-6 shadow-card border border-gray-100 bg-white mt-6">
          <p v-if="report.disclaimer.text" class="text-xs text-gray-400 leading-relaxed">{{ report.disclaimer.text }}</p>
          <div class="flex gap-4 mt-2 text-xs text-gray-400">
            <span v-if="report.disclaimer.version">版本：{{ report.disclaimer.version }}</span>
            <span v-if="report.disclaimer.updateTime">更新：{{ report.disclaimer.updateTime }}</span>
            <span v-if="report.disclaimer.compileUnit">编制：{{ report.disclaimer.compileUnit }}</span>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
/* ===== 沉浸式 Hero ===== */
.dept-hero {
  min-height: 180px;
  background: linear-gradient(90deg, #f97316 0%, #f59e0b 100%) !important;
  animation: fadeUp 0.55s ease both;
}
.dept-orb {
  position: absolute;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12);
  pointer-events: none;
}
.dept-orb-1 {
  width: 260px;
  height: 260px;
  top: -90px;
  right: -60px;
}
.dept-orb-2 {
  width: 180px;
  height: 180px;
  bottom: -70px;
  left: 24%;
}
.dept-back {
  position: absolute;
  top: 16px;
  left: 20px;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.9rem;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  color: #ffffff;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.1);
  transition: background 0.2s ease;
}
.dept-back:hover {
  background: rgba(255, 255, 255, 0.22);
}
.dept-title {
  font-size: 1.9rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.25;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
}
.dept-type {
  padding: 3px 12px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  font-size: 12px;
}
.dept-subtitle {
  margin-top: 0.8rem;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

/* ===== 就业前景指标卡 ===== */
.prospect-card {
  background: #ffffff !important;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  animation: fadeUp 0.55s ease both;
}
.prospect-card:nth-child(1) { animation-delay: 0.06s; }
.prospect-card:nth-child(2) { animation-delay: 0.1s; }
.prospect-card:nth-child(3) { animation-delay: 0.14s; }
.prospect-card:nth-child(4) { animation-delay: 0.18s; }
.prospect-card:nth-child(5) { animation-delay: 0.22s; }
.prospect-card:nth-child(6) { animation-delay: 0.26s; }
.prospect-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px -10px rgba(0, 0, 0, 0.16);
}
.prospect-label {
  font-size: 12px;
  color: #9aa3ad;
  margin-bottom: 4px;
}
.prospect-value {
  font-size: 20px;
  font-weight: 700;
  color: #e8722a;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

/* ===== 卡片入场 + hover ===== */
.detail-card {
  background: #ffffff !important;
  animation: fadeUp 0.55s ease both;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.detail-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 32px -12px rgba(0, 0, 0, 0.12);
}

/* ===== 专业组成进度条 ===== */
.bar-track {
  height: 8px;
  border-radius: 4px;
  background: #f3f4f6;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #f97316, #f59e0b);
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ===== 专业详情自适应网格（1 条占满整行，多条自动分列） ===== */
.subjects-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

/* ===== 专业详情 / 城市薪资卡片 ===== */
.major-card {
  border-radius: 12px;
  background: #ffffff !important;
  border: 1px solid #f3f4f6;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.major-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 22px -10px rgba(0, 0, 0, 0.14);
}
.city-card {
  border-radius: 12px;
  background: #ffffff !important;
  border: 1px solid #f3f4f6;
  padding: 0.9rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.city-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 22px -10px rgba(0, 0, 0, 0.14);
}

/* ===== 职业路径时间线 ===== */
.timeline {
  position: relative;
  padding-left: 22px;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: #e5e7eb;
}
.timeline-item {
  position: relative;
  padding-bottom: 16px;
  animation: fadeUp 0.5s ease both;
}
.timeline-item:nth-child(1) { animation-delay: 0.05s; }
.timeline-item:nth-child(2) { animation-delay: 0.15s; }
.timeline-item:nth-child(3) { animation-delay: 0.25s; }
.timeline-item:nth-child(4) { animation-delay: 0.35s; }
.timeline-item:last-child {
  padding-bottom: 0;
}
.timeline-dot {
  position: absolute;
  left: -22px;
  top: 5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #f97316;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px #e5e7eb;
}
.stage-badge {
  border-radius: 9999px;
  background: #ffffff !important;
  border: 1px solid #f3f4f6;
  color: #f97316;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 500;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}

@media (max-width: 767px) {
  .dept-title {
    font-size: 1.5rem;
  }
  .prospect-value {
    font-size: 18px;
  }
}
</style>
