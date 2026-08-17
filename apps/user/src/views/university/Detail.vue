<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-brand-gray-50 via-orange-50/20 to-white">
    <main class="flex-1 container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
      <!-- 骨架屏 -->
      <template v-if="loading && !detail">
        <div class="flex justify-between items-center mb-6">
          <div class="space-y-2">
            <div class="h-8 skeleton w-48 rounded" />
            <div class="h-4 skeleton w-24 rounded" />
          </div>
          <div class="h-10 skeleton w-24 rounded-full" />
        </div>
        <div class="carousel-full skeleton aspect-[16/8] rounded-2xl mb-6" />
        <div class="detail-layout">
          <aside class="detail-aside">
            <div class="name-card rounded-2xl shadow-card border-t-2 border-brand-orange p-5 space-y-3">
              <div class="h-6 skeleton w-32 rounded" />
              <div class="h-3 skeleton w-24 rounded" />
              <div class="flex gap-2">
                <div v-for="i in 3" :key="i" class="h-5 skeleton w-12 rounded-full" />
              </div>
              <div class="h-px bg-brand-orange/15" />
              <div class="space-y-2.5">
                <div v-for="i in 6" :key="i" class="h-3 skeleton w-full rounded" />
              </div>
              <div class="h-9 skeleton w-full rounded-full" />
              <div class="h-9 skeleton w-full rounded-full" />
            </div>
          </aside>
          <div class="detail-main space-y-6">
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
            <div class="flex justify-center pt-2">
              <div class="inline-flex gap-2">
                <div v-for="i in 6" :key="i" class="h-10 skeleton w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="detail">
        <!-- 顶部操作栏 -->
        <div class="flex justify-between items-center mb-6 detail-topbar">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">{{ detail.name }}</h1>
            <p class="text-sm text-gray-500 mt-1">{{ detail.nameEn || '院校详情' }}</p>
          </div>
          <button
            class="btn-secondary px-4 py-2 text-sm flex items-center gap-1.5"
            @click="goBack"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回列表
          </button>
        </div>

        <!-- 轮播图（全宽提顶） -->
        <div v-if="detail.carouselImages?.length" class="carousel-full rounded-2xl shadow-card overflow-hidden mb-6">
          <el-carousel height="360px" indicator-position="outside" arrow="always">
            <el-carousel-item v-for="(img, idx) in detail.carouselImages" :key="idx">
              <img :src="img" :alt="`${detail.name} ${idx + 1}`" class="h-full w-full object-cover" />
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- 双栏布局：左内容流 + 右 sticky 名片 -->
        <div class="detail-layout">
          <!-- 右栏 sticky 院校名片（DOM 在前，移动端置顶） -->
          <aside class="detail-aside">
            <div class="name-card rounded-2xl shadow-card border-t-2 border-brand-orange overflow-hidden">
              <div class="p-5 space-y-3.5">
                <!-- 名称 -->
                <div>
                  <h2 class="text-2xl font-bold text-gray-800 leading-tight">{{ detail.name }}</h2>
                  <p v-if="detail.nameEn" class="text-xs text-gray-400 mt-1">{{ detail.nameEn }}</p>
                </div>

                <!-- 标签 -->
                <div v-if="detail.tags?.length" class="flex flex-wrap gap-1.5">
                  <span v-for="tag in detail.tags" :key="tag" class="pill pill-orange text-xs">{{ tag }}</span>
                </div>

                <div class="h-px bg-brand-orange/15" />

                <!-- 核心档案 -->
                <div class="space-y-2.5">
                  <p class="text-xs font-semibold text-brand-orange/80 tracking-wide">核心档案</p>
                  <div v-if="detail.region" class="flex items-center gap-2">
                    <span class="dot-brand shrink-0" />
                    <span class="text-gray-400 text-sm w-20 shrink-0">大区</span>
                    <span class="text-gray-700 font-medium text-sm">{{ detail.region }}</span>
                  </div>
                  <div v-if="detail.provinceName" class="flex items-center gap-2">
                    <span class="dot-brand shrink-0" />
                    <span class="text-gray-400 text-sm w-20 shrink-0">省份</span>
                    <span class="text-gray-700 font-medium text-sm">{{ detail.provinceName }}</span>
                  </div>
                  <div v-if="detail.category" class="flex items-center gap-2">
                    <span class="dot-brand shrink-0" />
                    <span class="text-gray-400 text-sm w-20 shrink-0">类型</span>
                    <span class="text-gray-700 font-medium text-sm">{{ detail.category }}</span>
                  </div>
                  <div v-if="detail.nature" class="flex items-center gap-2">
                    <span class="dot-brand shrink-0" />
                    <span class="text-gray-400 text-sm w-20 shrink-0">性质</span>
                    <span class="text-gray-700 font-medium text-sm">{{ detail.nature }}</span>
                  </div>
                  <div v-if="detail.educationLevel" class="flex items-center gap-2">
                    <span class="dot-brand shrink-0" />
                    <span class="text-gray-400 text-sm w-20 shrink-0">学历层次</span>
                    <span class="text-gray-700 font-medium text-sm">{{ detail.educationLevel }}</span>
                  </div>
                  <div v-if="detail.department" class="flex items-center gap-2">
                    <span class="dot-brand shrink-0" />
                    <span class="text-gray-400 text-sm w-20 shrink-0">主管部门</span>
                    <span class="text-gray-700 font-medium text-sm">{{ detail.department }}</span>
                  </div>
                </div>

                <div class="h-px bg-brand-orange/15" />

                <!-- 操作按钮 -->
                <div class="space-y-2 pt-1">
                  <button
                    class="btn-secondary w-full px-4 py-2.5 text-sm flex items-center justify-center gap-1.5"
                    @click="goBack"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    返回列表
                  </button>
                  <button
                    class="btn-brand w-full px-4 py-2.5 text-sm flex items-center justify-center gap-1.5"
                    @click="goGuide"
                  >
                    查看适应指南
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <!-- 左栏内容流 -->
          <div class="detail-main space-y-6">
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
                  <span class="text-gray-400 w-20 shrink-0">专业数</span>
                  <span class="text-gray-700 font-medium num-pop">{{ detail.majorCount ?? '-' }}</span>
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
                  <span class="dot-gold shrink-0" />
                  <span class="text-gray-400 w-20 shrink-0">历史组分数线</span>
                  <span class="text-brand-orange font-semibold num-pop">{{ detail.historyGroupScore ?? '-' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="dot-blue shrink-0" />
                  <span class="text-gray-400 w-20 shrink-0">物理组分数线</span>
                  <span class="text-brand-orange font-semibold num-pop">{{ detail.scienceGroupScore ?? '-' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="dot-gold shrink-0" />
                  <span class="text-gray-400 w-20 shrink-0">推荐率</span>
                  <span class="text-brand-orange font-semibold num-pop">{{ detail.recommendationRate ? `${detail.recommendationRate}%` : '-' }}</span>
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
                <p class="text-xs text-gray-400 mb-2.5">排行榜</p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="(val, key) in detail.rankings" :key="key" class="pill pill-gold text-xs">
                    {{ key }}: 第 {{ val }} 名
                  </span>
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
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
/* ===== 双栏布局：左内容流 + 右 sticky 名片 ===== */
.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  grid-template-areas: "main aside";
  gap: 1.5rem;
  align-items: start;
}
.detail-main {
  grid-area: main;
  min-width: 0;
}
.detail-aside {
  grid-area: aside;
  position: sticky;
  top: 5rem;
  align-self: flex-start;
}

/* ===== 右栏核心名片：暖橙渐变背景 ===== */
.name-card {
  background: linear-gradient(160deg, #fff4e6 0%, #ffedd5 45%, #ffffff 100%);
}

/* ===== 字段前色点 ===== */
.dot-brand {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: #e8722a;
}
.dot-gray {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: #cbd5e1;
}
.dot-gold {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: #f5a54a;
}
.dot-blue {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: #1e88e5;
}

/* ===== 全宽轮播 + 右名片：入场动效 ===== */
.carousel-full,
.name-card {
  animation: fadeUp 0.55s ease both;
}
.name-card {
  animation-delay: 0.08s;
}

/* ===== 左栏卡片：入场 stagger + hover 动效 ===== */
.detail-card {
  animation: fadeUp 0.55s ease both;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.detail-main > .detail-card:nth-child(1) { animation-delay: 0.12s; }
.detail-main > .detail-card:nth-child(2) { animation-delay: 0.20s; }
.detail-main > .detail-card:nth-child(3) { animation-delay: 0.28s; }
.detail-main > .detail-card:nth-child(4) { animation-delay: 0.36s; }
.detail-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 32px -10px rgba(232, 114, 42, 0.18);
}

/* ===== 关键数值：弹入动效（tabular-nums 防数字跳动） ===== */
.num-pop {
  font-variant-numeric: tabular-nums;
  animation: numPop 0.7s cubic-bezier(0.2, 0.7, 0.3, 1) both;
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
@keyframes numPop {
  0% { opacity: 0; transform: translateY(8px) scale(0.85); }
  60% { opacity: 1; transform: translateY(-2px) scale(1.04); }
  100% { opacity: 1; transform: none; }
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

/* ===== 响应式：移动端回落单列，名片置顶、取消 sticky ===== */
@media (max-width: 1023px) {
  .detail-layout {
    grid-template-columns: 1fr;
    grid-template-areas: "aside" "main";
  }
  .detail-aside {
    position: static;
  }
}
</style>
