<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getLaboratoryDetail } from '@/api/university/laboratory'
import type { LaboratoryDetailVO } from '@/types/university/laboratory'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<LaboratoryDetailVO | null>(null)

async function fetchDetail() {
  const labId = route.params.labId as string
  if (!labId) {
    ElMessage.error('实验室ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getLaboratoryDetail(labId)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取实验室详情失败')
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}

onMounted(fetchDetail)

// ===== 统计数据数字滚动（纯展示动效，不触碰数据逻辑）=====
const statDisplay = ref<{ label: string; count: number }[]>([])
const statColors = ['#16a34a', '#2563eb', '#9333ea', '#d97706', '#e11d48', '#0d9488']

function animateStats(targets: { label: string; count: number }[]) {
  const duration = 700
  const start = performance.now()
  const step = (now: number) => {
    const p = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    statDisplay.value = targets.map((t) => ({ label: t.label, count: Math.round(t.count * eased) }))
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

watch(detail, (d) => {
  if (d?.statistics?.length) animateStats(d.statistics)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-4 sm:px-6 py-8 max-w-6xl" v-loading="loading">
      <template v-if="detail">
        <!-- 沉浸式 Hero 头图（橙→琥珀渐变，对齐专业详情页） -->
        <section class="lab-hero relative overflow-hidden rounded-2xl shadow-lg shadow-orange-200/60 mb-6">
          <div class="lab-orb lab-orb-1" />
          <div class="lab-orb lab-orb-2" />
          <button class="lab-back" @click="goBack">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 18l-6-6 6-6" />
            </svg>
            返回
          </button>
          <div class="relative z-10 px-6 sm:px-8 py-9 sm:py-12">
            <h1 class="lab-title">{{ detail.labType }}</h1>
            <div class="lab-chips">
              <span v-if="detail.universityName" class="lab-chip">所属院校：{{ detail.universityName }}</span>
              <span v-if="detail.establishedYear" class="lab-chip">成立：{{ detail.establishedYear }} 年</span>
              <span v-if="detail.region" class="lab-chip">{{ detail.region }}</span>
            </div>
          </div>
        </section>

        <!-- 双栏主体：左 2/3 阅读型主体 + 右 1/3 速览（sticky） -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          <!-- 左栏：阅读型重内容 -->
          <div class="lg:col-span-2 space-y-6">
            <!-- 实验室概况 -->
            <section class="detail-card rounded-2xl p-6 shadow-card border border-gray-100 bg-white space-y-5">
              <div v-if="detail.introduction">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                  <h3 class="text-lg font-bold text-gray-800">实验室简介</h3>
                </div>
                <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.introduction }}</p>
              </div>
              <div v-if="detail.researchDescription">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                  <h3 class="text-lg font-bold text-gray-800">研究方向描述</h3>
                </div>
                <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.researchDescription }}</p>
              </div>
              <div v-if="detail.labSpace">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                  <h3 class="text-lg font-bold text-gray-800">实验室空间</h3>
                </div>
                <p class="text-gray-600">{{ detail.labSpace }}</p>
              </div>
            </section>

            <!-- 研究领域 / 主要设备（彩色 chip，对齐专业详情页） -->
            <section class="detail-card rounded-2xl p-6 shadow-card border border-gray-100 bg-white space-y-5">
              <div v-if="detail.researchFields?.length">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                  <h3 class="text-lg font-bold text-gray-800">研究领域</h3>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span v-for="field in detail.researchFields" :key="field" class="rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-700">{{ field }}</span>
                </div>
              </div>
              <div v-if="detail.majorEquipment?.length">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                  <h3 class="text-lg font-bold text-gray-800">主要设备</h3>
                </div>
                <div class="flex flex-wrap gap-2">
                  <span v-for="eq in detail.majorEquipment" :key="eq" class="rounded-lg bg-green-50 px-3 py-1.5 text-sm text-green-700">{{ eq }}</span>
                </div>
              </div>
            </section>

            <!-- 开放课题 / 合作交流 / 访问学者 -->
            <section class="detail-card rounded-2xl p-6 shadow-card border border-gray-100 bg-white space-y-5">
              <div v-if="detail.openTopics">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                  <h3 class="text-lg font-bold text-gray-800">开放课题</h3>
                </div>
                <p class="text-gray-600">{{ detail.openTopics }}</p>
              </div>
              <div v-if="detail.cooperation">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                  <h3 class="text-lg font-bold text-gray-800">合作交流</h3>
                </div>
                <p class="text-gray-600">{{ detail.cooperation }}</p>
              </div>
              <div v-if="detail.visitingScholars">
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                  <h3 class="text-lg font-bold text-gray-800">访问学者</h3>
                </div>
                <p class="text-gray-600">{{ detail.visitingScholars }}</p>
              </div>
            </section>

            <!-- 核心团队（头像卡片，2 列） -->
            <section v-if="detail.coreTeam?.length" class="detail-card rounded-2xl p-6 shadow-card border border-gray-100 bg-white">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                <h3 class="text-lg font-bold text-gray-800">核心团队</h3>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-for="(member, idx) in detail.coreTeam" :key="idx" class="team-card flex items-center gap-3">
                  <div class="team-avatar shrink-0">{{ (member.name || '?').charAt(0) }}</div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-gray-800 truncate">{{ member.name || '-' }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ member.position || '-' }}</p>
                    <p v-if="member.title" class="text-xs text-brand-orange truncate">{{ member.title }}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- 右栏：速览摘要（sticky 跟随滚动） -->
          <div class="space-y-6 lg:sticky lg:top-24">
            <!-- 统计卡（白底 + 彩色数字 + 滚动） -->
            <section v-if="statDisplay.length" class="detail-card rounded-2xl p-5 shadow-card border border-gray-100 bg-white">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                <h3 class="text-lg font-bold text-gray-800">统计速览</h3>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div v-for="(stat, idx) in statDisplay" :key="idx" class="stat-card">
                  <p class="stat-label">{{ stat.label }}</p>
                  <p class="stat-value" :style="{ color: statColors[idx % statColors.length] }">{{ stat.count }}</p>
                </div>
              </div>
            </section>

            <!-- 基本信息（上标签下值竖排，适配窄栏） -->
            <section class="detail-card rounded-2xl p-6 shadow-card border border-gray-100 bg-white">
              <div class="flex items-center gap-3 mb-5">
                <div class="w-1 h-5 rounded-full bg-gradient-to-b from-brand-orange to-brand-orange-light" />
                <h3 class="text-lg font-bold text-gray-800">基本信息</h3>
              </div>
              <div class="space-y-4 text-sm">
                <div>
                  <p class="text-gray-400 text-xs mb-1">实验室主任</p>
                  <p class="text-gray-700 font-medium">{{ detail.director || '-' }}</p>
                </div>
                <div>
                  <p class="text-gray-400 text-xs mb-1">主管部门</p>
                  <p class="text-gray-700 font-medium">{{ detail.department || '-' }}</p>
                </div>
                <div>
                  <p class="text-gray-400 text-xs mb-1">人员规模</p>
                  <p class="text-gray-700 font-medium">{{ detail.staffCount || '-' }}</p>
                </div>
                <div>
                  <p class="text-gray-400 text-xs mb-1">学生规模</p>
                  <p class="text-gray-700 font-medium">{{ detail.studentCount || '-' }}</p>
                </div>
                <div>
                  <p class="text-gray-400 text-xs mb-1">联系邮箱</p>
                  <p class="text-gray-700 break-all">{{ detail.email || '-' }}</p>
                </div>
                <div>
                  <p class="text-gray-400 text-xs mb-1">联系电话</p>
                  <p class="text-gray-700">{{ detail.phone || '-' }}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
/* ===== 沉浸式 Hero（橙→琥珀，对齐专业详情页） ===== */
.lab-hero {
  min-height: 200px;
  background: linear-gradient(90deg, #f97316 0%, #f59e0b 100%) !important;
  animation: fadeUp 0.55s ease both;
}
.lab-orb {
  position: absolute;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12);
  pointer-events: none;
}
.lab-orb-1 {
  width: 260px;
  height: 260px;
  top: -90px;
  right: -60px;
}
.lab-orb-2 {
  width: 180px;
  height: 180px;
  bottom: -70px;
  left: 24%;
}
.lab-back {
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
.lab-back:hover {
  background: rgba(255, 255, 255, 0.22);
}
.lab-title {
  font-size: 1.9rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.25;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
}
.lab-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.9rem;
}
.lab-chip {
  padding: 3px 12px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  font-size: 12px;
}

/* ===== 统计卡（白底 + 阴影，数字彩色由内联 style 控制） ===== */
.stat-card {
  background: #ffffff !important;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  animation: fadeUp 0.55s ease both;
}
.stat-card:nth-child(1) { animation-delay: 0.08s; }
.stat-card:nth-child(2) { animation-delay: 0.14s; }
.stat-card:nth-child(3) { animation-delay: 0.2s; }
.stat-card:nth-child(4) { animation-delay: 0.26s; }
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px -10px rgba(0, 0, 0, 0.16);
}
.stat-label {
  font-size: 13px;
  color: #9aa3ad;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 24px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

/* ===== 字段色点 ===== */
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

/* ===== 卡片入场 stagger + hover ===== */
.detail-card {
  background: #ffffff !important;
  animation: fadeUp 0.55s ease both;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.detail-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 32px -12px rgba(0, 0, 0, 0.12);
}

/* ===== 团队头像卡片（白卡） ===== */
.team-card {
  background: #ffffff !important;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  animation: fadeUp 0.55s ease both;
}
.team-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 22px -10px rgba(0, 0, 0, 0.14);
}
.team-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #f59e0b);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: none; }
}

@media (max-width: 767px) {
  .lab-title {
    font-size: 1.5rem;
  }
  .stat-value {
    font-size: 20px;
  }
}
</style>
