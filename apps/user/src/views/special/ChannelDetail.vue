<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElDialog } from 'element-plus'
import { getChannelDetail, getChannelUniversityList, getChannelUniversityDetail } from '@/api/special'
import { ProvinceOptions } from '@haifeng/shared'
import type { SpecialChannelDetailVO, ChannelUniversityListVO, ChannelUniversityDetailVO } from '@/types/special'

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

// 关联大学详情弹窗
const showUnivDialog = ref(false)
const univDetail = ref<ChannelUniversityDetailVO | null>(null)
const univDetailLoading = ref(false)

async function fetchDetail() {
  const id = Number(route.params.id)
  if (!id) {
    ElMessage.error('通道ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getChannelDetail(id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取通道详情失败')
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

async function viewUnivDetail(universityId: number) {
  univDetailLoading.value = true
  showUnivDialog.value = true
  try {
    const res = await getChannelUniversityDetail(universityId)
    univDetail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取关联大学详情失败')
    showUnivDialog.value = false
  } finally {
    univDetailLoading.value = false
  }
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
        <!-- 基本信息 -->
        <section class="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h2 class="mb-4 text-2xl font-bold text-gray-800">{{ detail.channelName }}</h2>
          <p v-if="detail.subtitle" class="mb-4 text-gray-400">{{ detail.subtitle }}</p>
          <div class="flex flex-wrap gap-2">
            <span v-if="detail.filterLabel" class="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-600">{{ detail.filterLabel }}</span>
            <span class="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-600">{{ detail.displayType }}</span>
          </div>
        </section>

        <!-- 通道正文（富文本） -->
        <section v-if="detail.content" class="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h3 class="text-lg font-bold text-gray-800 mb-4">通道详情</h3>
          <div v-html="detail.content" class="text-gray-600 leading-relaxed prose prose-sm max-w-none" />
        </section>

        <!-- 关联大学 -->
        <section class="mb-8">
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
                  class="w-full rounded-lg border border-orange-200 py-1.5 text-sm text-orange-500 font-medium hover:bg-orange-50 transition-all"
                  @click="viewUnivDetail(item.universityId)"
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

    <!-- 关联大学详情弹窗 -->
    <ElDialog
      v-model="showUnivDialog"
      :title="univDetail?.universityName || '关联大学详情'"
      width="640px"
      :close-on-click-modal="false"
    >
      <div v-loading="univDetailLoading" class="min-h-[200px]">
        <template v-if="univDetail">
          <div class="grid grid-cols-2 gap-4 text-sm mb-4">
            <div><span class="text-gray-400">大学名称：</span><span class="text-gray-700">{{ univDetail.universityName }}</span></div>
            <div><span class="text-gray-400">招生年份：</span><span class="text-gray-700">{{ univDetail.year }}</span></div>
            <div><span class="text-gray-400">地区：</span><span class="text-gray-700">{{ univDetail.regionTag }}</span></div>
            <div><span class="text-gray-400">报名时间：</span><span class="text-gray-700">{{ univDetail.signupStart?.slice(0, 10) }} ~ {{ univDetail.signupEnd?.slice(0, 10) }}</span></div>
          </div>
          <div class="mb-4">
            <span class="text-gray-400 text-sm">官网：</span>
            <a v-if="univDetail.officialUrl" :href="univDetail.officialUrl" target="_blank" class="text-orange-500 text-sm hover:underline">
              {{ univDetail.officialUrl }}
            </a>
            <span v-else class="text-gray-400 text-sm">-</span>
          </div>
          <div v-if="univDetail.brochureContent" class="border-t border-gray-100 pt-4">
            <h4 class="text-base font-bold text-gray-800 mb-3">{{ univDetail.brochureTitle || '招生简章' }}</h4>
            <div v-html="univDetail.brochureContent" class="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none" />
          </div>
        </template>
      </div>
    </ElDialog>
  </div>
</template>
