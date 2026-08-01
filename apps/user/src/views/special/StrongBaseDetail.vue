<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStrongBaseScoreDetail, getStrongBaseUniversityDetail } from '@/api/special'
import type { StrongBaseScoreDetailVO, StrongBaseUniversityDetailVO } from '@/types/special'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<StrongBaseScoreDetailVO | null>(null)

// 强基院校配置
const univConfig = ref<StrongBaseUniversityDetailVO | null>(null)
const configLoading = ref(false)

async function fetchDetail() {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('数据ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getStrongBaseScoreDetail(id)
    detail.value = res.data.data
    if (detail.value) {
      fetchUnivConfig(String(detail.value.universityId))
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取强基数据详情失败')
  } finally {
    loading.value = false
  }
}

async function fetchUnivConfig(universityId: string) {
  configLoading.value = true
  try {
    const res = await getStrongBaseUniversityDetail(universityId)
    univConfig.value = res.data.data
  } catch {
    univConfig.value = null
  } finally {
    configLoading.value = false
  }
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <!-- 基本信息 -->
        <section class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h2 class="mb-2 text-2xl font-bold text-gray-800">{{ detail.universityName }}</h2>
          <p class="text-gray-500 mb-4">
            {{ detail.majorName }}
            <span v-if="detail.majorCode" class="text-gray-400">({{ detail.majorCode }})</span>
          </p>
          <div class="flex flex-wrap gap-4 text-sm">
            <span class="text-gray-400">年份：<span class="text-gray-700">{{ detail.year }}</span></span>
            <span class="text-gray-400">省份：<span class="text-gray-700">{{ detail.province }}</span></span>
            <span class="text-gray-400">科类：<span class="text-gray-700">{{ detail.subjectType }}</span></span>
          </div>
        </section>

        <!-- 入围信息 -->
        <section class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">入围信息</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span class="text-gray-400">入围分数线：</span><span class="font-semibold text-orange-500">{{ detail.entryScore ?? '-' }}</span></div>
            <div><span class="text-gray-400">入围类型：</span><span class="text-gray-700">{{ detail.entryScoreType }}</span></div>
            <div><span class="text-gray-400">入围比例：</span><span class="text-gray-700">{{ detail.entryRatio }}</span></div>
            <div v-if="detail.entryFormula" class="col-span-2 md:col-span-4">
              <span class="text-gray-400">计算公式：</span>
              <code class="ml-2 rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-700">{{ detail.entryFormula }}</code>
            </div>
          </div>
        </section>

        <!-- 录取信息 -->
        <section class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">录取信息</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span class="text-gray-400">录取综合分：</span><span class="font-semibold text-orange-500">{{ detail.admissionScore ?? '-' }}</span></div>
            <div><span class="text-gray-400">计划招生：</span><span class="text-gray-700">{{ detail.planCount ?? '-' }} 人</span></div>
            <div><span class="text-gray-400">实际录取：</span><span class="text-gray-700">{{ detail.admissionCount ?? '-' }} 人</span></div>
            <div v-if="detail.admissionFormula" class="col-span-2 md:col-span-4">
              <span class="text-gray-400">计算公式：</span>
              <code class="ml-2 rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-700">{{ detail.admissionFormula }}</code>
            </div>
          </div>
        </section>

        <!-- 备注 -->
        <section v-if="detail.remark" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-3">备注</h3>
          <p class="text-sm text-gray-600">{{ detail.remark }}</p>
        </section>

        <!-- 强基院校配置 -->
        <section v-if="univConfig" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100" v-loading="configLoading">
          <h3 class="text-lg font-bold text-gray-800 mb-4">强基院校配置</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span class="text-gray-400">强基试点：</span>
              <span :class="univConfig.isPilot ? 'text-green-600' : 'text-red-500'">
                {{ univConfig.isPilot ? '✅ 是' : '❌ 否' }}
              </span>
              <span v-if="univConfig.pilotYear" class="text-gray-400 ml-1">({{ univConfig.pilotYear }}年试点)</span>
            </div>
            <div>
              <span class="text-gray-400">出分前校测：</span>
              <span :class="!univConfig.testBeforeScore ? 'text-gray-700' : 'text-orange-500'">
                {{ univConfig.testBeforeScore ? '✅ 是' : '❌ 否' }}
              </span>
            </div>
            <div>
              <span class="text-gray-400">默认入围比例：</span>
              <span class="text-gray-700">{{ univConfig.defaultEntryRatio }}</span>
            </div>
            <div class="md:col-span-2">
              <span class="text-gray-400">录取公式：</span>
              <code class="ml-2 rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-700">{{ univConfig.defaultAdmissionFormula }}</code>
            </div>
          </div>
          <div class="mb-3">
            <span class="text-sm text-gray-400">官方页面：</span>
            <a v-if="univConfig.officialUrl" :href="univConfig.officialUrl" target="_blank" class="text-orange-500 text-sm hover:underline">{{ univConfig.officialUrl }}</a>
            <span v-else class="text-sm text-gray-400">-</span>
          </div>
          <div class="mb-3">
            <span class="text-sm text-gray-400">报名入口：</span>
            <a v-if="univConfig.signupUrl" :href="univConfig.signupUrl" target="_blank" class="text-orange-500 text-sm hover:underline">{{ univConfig.signupUrl }}</a>
            <span v-else class="text-sm text-gray-400">-</span>
          </div>
          <div class="mb-3">
            <span class="text-sm text-gray-400">可选专业：</span>
            <div class="mt-1 flex flex-wrap gap-2">
              <span
                v-for="major in univConfig.availableMajors"
                :key="major"
                class="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs text-orange-600"
              >
                {{ major }}
              </span>
            </div>
          </div>
          <div v-if="univConfig.specialNotes">
            <span class="text-sm text-gray-400">特殊说明：</span>
            <p class="mt-1 text-sm text-gray-600">{{ univConfig.specialNotes }}</p>
          </div>
        </section>

        <!-- 未配置强基院校信息的提示 -->
        <section v-else-if="!configLoading && detail" class="mb-6 rounded-2xl bg-white p-6 shadow-lg border border-gray-100 text-center text-gray-400 text-sm">
          该院校暂未配置强基计划详细信息
        </section>
      </template>
    </main>
  </div>
</template>
