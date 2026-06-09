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

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<UniversityDetailVO | null>(null)
const activeTab = ref('laboratory')
const tabs = [
  { key: 'laboratory', label: '重点实验室', icon: '🔬' },
  { key: 'postgrad', label: '考研专业', icon: '🎓' },
  { key: 'department', label: '院系', icon: '🏛️' },
  { key: 'evaluation', label: '学科评估', icon: '📊' },
]

async function fetchDetail() {
  const id = Number(route.params.id)
  if (!id) {
    ElMessage.error('院校ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getUniversityDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取院校详情失败')
  } finally {
    loading.value = false
  }
}

function goGuide() {
  router.push(`/university/${route.params.id}/guide`)
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center px-6 py-4">
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="router.push('/university')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回列表</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16" v-if="detail">{{ detail.name }}</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <!-- 轮播图 -->
        <div v-if="detail.carouselImages?.length" class="mb-8 rounded-2xl overflow-hidden shadow-lg">
          <el-carousel height="420px" indicator-position="outside" arrow="always">
            <el-carousel-item v-for="(img, idx) in detail.carouselImages" :key="idx">
              <img :src="img" :alt="`${detail.name} ${idx + 1}`" class="h-full w-full object-cover" />
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- 基本信息 -->
        <section class="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h2 class="mb-4 text-2xl font-bold text-gray-800">{{ detail.name }}</h2>
          <p v-if="detail.nameEn" class="mb-4 text-gray-400">{{ detail.nameEn }}</p>
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="tag in detail.tags" :key="tag" class="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-600">{{ tag }}</span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
            <div><span class="text-gray-400">大区：</span><span class="text-gray-700">{{ detail.region }}</span></div>
            <div><span class="text-gray-400">省份：</span><span class="text-gray-700">{{ detail.provinceName }}</span></div>
            <div><span class="text-gray-400">城市：</span><span class="text-gray-700">{{ detail.cityName }}</span></div>
            <div><span class="text-gray-400">类型：</span><span class="text-gray-700">{{ detail.category }}</span></div>
            <div><span class="text-gray-400">性质：</span><span class="text-gray-700">{{ detail.nature }}</span></div>
            <div><span class="text-gray-400">学历层次：</span><span class="text-gray-700">{{ detail.educationLevel }}</span></div>
            <div><span class="text-gray-400">主管部门：</span><span class="text-gray-700">{{ detail.department }}</span></div>
            <div><span class="text-gray-400">所属联盟：</span><span class="text-gray-700">{{ detail.famousUnion || '-' }}</span></div>
            <div><span class="text-gray-400">专业数：</span><span class="text-gray-700">{{ detail.majorCount }}</span></div>
            <div><span class="text-gray-400">博士点：</span><span class="text-gray-700">{{ detail.hasDoctorate ? '有' : '无' }}</span></div>
            <div><span class="text-gray-400">硕士点：</span><span class="text-gray-700">{{ detail.hasMaster ? '有' : '无' }}</span></div>
          </div>
        </section>

        <!-- 详细信息 -->
        <section class="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="mb-4 text-lg font-bold text-gray-800">详细信息</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span class="text-gray-400">地址：</span><span class="text-gray-700">{{ detail.address || '-' }}</span></div>
            <div><span class="text-gray-400">招生电话：</span><span class="text-gray-700">{{ detail.admissionPhone || '-' }}</span></div>
            <div><span class="text-gray-400">官网：</span><a v-if="detail.website" :href="detail.website" target="_blank" class="text-orange-500 hover:underline">{{ detail.website }}</a><span v-else class="text-gray-700">-</span></div>
            <div><span class="text-gray-400">历史组分数线：</span><span class="text-gray-700">{{ detail.historyGroupScore ?? '-' }}</span></div>
            <div><span class="text-gray-400">物理组分数线：</span><span class="text-gray-700">{{ detail.scienceGroupScore ?? '-' }}</span></div>
            <div><span class="text-gray-400">推荐率：</span><span class="text-gray-700">{{ detail.recommendationRate ? `${detail.recommendationRate}%` : '-' }}</span></div>
            <div><span class="text-gray-400">推荐年份：</span><span class="text-gray-700">{{ detail.recommendationYear ?? '-' }}</span></div>
            <div><span class="text-gray-400">出国比例：</span><span class="text-gray-700">{{ detail.abroadRate || '-' }}</span></div>
            <div><span class="text-gray-400">男女比例：</span><span class="text-gray-700">{{ detail.genderRatio || '-' }}</span></div>
          </div>
          <div v-if="detail.rankings && Object.keys(detail.rankings).length" class="mt-4">
            <span class="text-gray-400">排行榜：</span>
            <div class="mt-2 flex flex-wrap gap-3">
              <span v-for="(val, key) in detail.rankings" :key="key" class="rounded-lg bg-orange-50 px-3 py-1.5 text-sm text-orange-700">
                {{ key }}: 第 {{ val }} 名
              </span>
            </div>
          </div>
        </section>

        <!-- 详细介绍 -->
        <section class="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="mb-4 text-lg font-bold text-gray-800">院校介绍</h3>
          <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.introduction || '暂无详细介绍' }}</p>
        </section>

        <!-- Tab 导航 -->
        <section class="mb-8">
          <div class="grid grid-cols-4 gap-4">
            <button
              v-for="tab in tabs" :key="tab.key"
              class="relative rounded-2xl p-5 text-center transition-all border"
              :class="activeTab === tab.key
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg border-transparent'
                : 'bg-white text-gray-700 border-gray-100 shadow-md hover:shadow-lg hover:border-orange-200'"
              @click="activeTab = tab.key"
            >
              <div class="text-3xl mb-2">{{ tab.icon }}</div>
              <div class="text-sm font-semibold">{{ tab.label }}</div>
            </button>
          </div>
        </section>

        <!-- Tab 内容区 -->
        <section class="min-h-[200px] mb-8">
          <LaboratoryTab v-if="activeTab === 'laboratory'" :university-id="Number(route.params.id)" />
          <PostgradMajorForUniversityTab v-else-if="activeTab === 'postgrad'" :university-id="Number(route.params.id)" />
          <DepartmentTab v-else-if="activeTab === 'department'" :university-id="Number(route.params.id)" />
          <SubjectEvaluationTab v-else-if="activeTab === 'evaluation'" :university-id="Number(route.params.id)" />
        </section>

        <!-- 操作 -->
        <div class="text-center pb-8">
          <button
            class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
            @click="goGuide"
          >
            查看适应指南
          </button>
        </div>
      </template>
    </main>
  </div>
</template>
