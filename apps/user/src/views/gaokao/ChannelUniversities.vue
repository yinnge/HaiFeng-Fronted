<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getChannelDetail, getChannelUniversityList } from '@/api/special'
import { ProvinceOptions } from '@haifeng/shared'
import type { SpecialChannelDetailVO, ChannelUniversityListVO } from '@/types/special'
import StrongBaseList from '@/components/gaokao/StrongBaseList.vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<SpecialChannelDetailVO | null>(null)

// 关联大学
const univRecords = ref<ChannelUniversityListVO[]>([])
const univTotal = ref(0)
const univPage = ref(1)
const univPageSize = 10
const univLoading = ref(false)
const univRegionTag = ref('')
const univSignupStart = ref('')
const univSignupEnd = ref('')

async function fetchDetail() {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('通道ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getChannelDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取通道详情失败')
  } finally {
    loading.value = false
  }
}

async function fetchUniversityList() {
  if (!detail.value) return
  univLoading.value = true
  try {
    const res = await getChannelUniversityList({
      page: univPage.value,
      size: univPageSize,
      channelCode: detail.value.channelCode,
      regionTag: univRegionTag.value || undefined,
      signupStart: univSignupStart.value || undefined,
      signupEnd: univSignupEnd.value || undefined,
    })
    univRecords.value = res.data.data.records
    univTotal.value = res.data.data.total
  } catch {
    // 关联大学列表公开接口，不需要特殊处理
  } finally {
    univLoading.value = false
  }
}

function onUnivSearch() {
  univPage.value = 1
  fetchUniversityList()
}

function onUnivPageChange(page: number) {
  univPage.value = page
  fetchUniversityList()
}

function goUnivDetail(universityId: string) {
  router.push(`/university/${universityId}`)
}

function goBack() {
  router.push('/gaokao')
}

onMounted(async () => {
  await fetchDetail()
  if (detail.value) {
    fetchUniversityList()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <!-- 返回 -->
        <button
          class="mb-6 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-600 hover:border-orange-300 hover:text-orange-500 transition-all"
          @click="goBack"
        >
          ← 返回选择报考类型
        </button>

        <!-- 基本信息 -->
        <section class="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h2 class="mb-4 text-2xl font-bold text-gray-800">{{ detail.channelName }}</h2>
          <p v-if="detail.subtitle" class="mb-4 text-gray-400">{{ detail.subtitle }}</p>
          <div class="flex flex-wrap gap-2">
            <span v-if="detail.filterLabel" class="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-600">{{ detail.filterLabel }}</span>
          </div>
        </section>

        <!-- 通道正文（富文本） -->
        <section v-if="detail.content" class="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">通道详情</h3>
          <div v-html="detail.content" class="text-gray-600 leading-relaxed prose prose-sm max-w-none" />
        </section>

        <!-- 强基计划入围/录取数据（STRONG_BASE 通道） -->
        <StrongBaseList v-if="detail.channelCode === 'STRONG_BASE'" />

        <!-- 关联大学 -->
        <section v-if="detail.channelCode !== 'STRONG_BASE'" class="mb-8">
          <h3 class="text-xl font-bold text-gray-800 mb-4">关联大学</h3>

          <!-- 搜索栏 -->
          <div class="flex flex-wrap items-end gap-4 mb-6 rounded-2xl bg-white p-5 shadow-md border border-gray-100">
            <div class="w-44">
              <label class="block text-sm font-medium text-gray-600 mb-1.5">地区</label>
              <el-select v-model="univRegionTag" placeholder="全部" clearable filterable class="w-full" @change="onUnivSearch">
                <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">报名开始 &gt;=</label>
              <el-date-picker
                v-model="univSignupStart"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DDTHH:mm:ss+08:00"
                class="w-full"
                @change="onUnivSearch"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">报名截止 &lt;=</label>
              <el-date-picker
                v-model="univSignupEnd"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DDTHH:mm:ss+08:00"
                class="w-full"
                @change="onUnivSearch"
              />
            </div>
            <button
              class="h-[40px] px-6 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200"
              @click="onUnivSearch"
            >
              搜索
            </button>
          </div>

          <!-- 卡片网格 -->
          <div v-loading="univLoading" class="min-h-[200px]">
            <div v-if="univRecords.length" class="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div
                v-for="item in univRecords"
                :key="item.universityId"
                class="rounded-2xl bg-white p-5 shadow-lg border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all"
              >
                <h4 class="text-base font-bold text-gray-800 mb-2 truncate">{{ item.universityName }}</h4>
                <p class="text-xs text-gray-400 mb-2">招生年份: {{ item.year }}</p>
                <span v-if="item.regionTag" class="inline-block rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600 mb-2">{{ item.regionTag }}</span>
                <p class="text-xs text-gray-400 mb-3">
                  报名: {{ item.signupStart?.slice(0, 10) || '待定' }} ~ {{ item.signupEnd?.slice(0, 10) || '待定' }}
                </p>
                <button
                  class="w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-1.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
                  @click="goUnivDetail(item.universityId)"
                >
                  查看详情
                </button>
              </div>
            </div>
            <div v-else-if="!univLoading" class="py-12 text-center text-gray-400">
              暂无关联大学数据
            </div>
          </div>

          <div v-if="univTotal > univPageSize" class="mt-6 flex justify-center">
            <el-pagination
              background
              layout="prev, pager, next, total"
              :total="univTotal"
              :page-size="univPageSize"
              :current-page="univPage"
              @current-change="onUnivPageChange"
            />
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
