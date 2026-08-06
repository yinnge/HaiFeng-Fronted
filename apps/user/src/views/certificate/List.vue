<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElDialog } from 'element-plus'
import { Motion } from 'motion-v'
import { getCertificateCategories, getCertificateList, getCertificateDetail } from '@/api/certificate'
import type { CertificateListVO, CertificateDetailVO } from '@/types/certificate'

const router = useRouter()

const loading = ref(false)
const categories = ref<string[]>([])
const activeCategory = ref('')
const keyword = ref('')
const list = ref<CertificateListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const detailLoading = ref(false)
const showDetail = ref(false)
const currentCert = ref<CertificateDetailVO | null>(null)

async function fetchCategories() {
  try {
    const res = await getCertificateCategories()
    categories.value = res.data.data
    if (categories.value.length > 0) {
      activeCategory.value = categories.value[0]
    }
  } catch {
    // silently fail, empty categories
  }
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getCertificateList({
      page: currentPage.value,
      size: pageSize.value,
      category: activeCategory.value || undefined,
      certName: keyword.value || undefined,
    })
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取证书列表失败')
  } finally {
    loading.value = false
  }
}

function switchCategory(cat: string) {
  activeCategory.value = activeCategory.value === cat ? '' : cat
  currentPage.value = 1
  fetchList()
}

function handleSearch() {
  currentPage.value = 1
  fetchList()
}

async function openDetail(certId: string) {
  detailLoading.value = true
  showDetail.value = true
  try {
    const res = await getCertificateDetail(certId)
    currentCert.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取证书详情失败')
    showDetail.value = false
  } finally {
    detailLoading.value = false
  }
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchList()
}

function onSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
  fetchList()
}

onMounted(() => {
  fetchCategories()
  fetchList()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <main class="container mx-auto px-6 py-8">
      <!-- Intro Banner -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 border border-orange-100">
          <div class="flex items-center gap-3 mb-3">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15a7 7 0 100-14 7 7 0 000 14zm0 0l-2 6h4l-2-6zm-6-8h12M6 7a6 6 0 1112 0v3a6 6 0 01-12 0V7z"/></svg>
            </span>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800">职业技能证书 · 提升职场竞争力</h1>
          </div>
          <p class="text-gray-600 leading-relaxed mb-4">
            职业技能证书是衡量个人专业能力的重要凭证，涵盖计算机、财会、语言、工程等多个领域。本页面为您提供各类证书的详细信息，助您规划职业发展路径。
          </p>
          <div class="flex flex-wrap gap-2">
            <span v-for="kw in ['计算机', '财会', '语言', '工程']" :key="kw" class="rounded-full bg-white px-4 py-1.5 text-sm text-orange-600 border border-orange-200">
              {{ kw }}
            </span>
          </div>
        </div>
      </Motion>

      <!-- Search + Category -->
      <div class="mb-8 rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] shadow-lg p-6">
        <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          证书检索
        </div>
        <div class="mb-5 flex flex-wrap items-center gap-3">
          <input
            v-model="keyword"
            type="text"
            placeholder="输入证书名称搜索"
            class="flex-1 min-w-[200px] rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
            @keyup.enter="handleSearch"
          />
          <button
            class="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
            @click="handleSearch"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            搜索
          </button>
        </div>
        <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.1 }">
          <div class="flex flex-wrap gap-3" v-if="categories.length">
            <button
              v-for="cat in categories" :key="cat"
              class="rounded-full px-4 py-2 text-sm font-medium transition-all"
              :class="activeCategory === cat
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'"
              @click="switchCategory(cat)"
            >
              {{ cat }}
            </button>
          </div>
        </Motion>
      </div>

      <!-- Certificate List -->
      <section class="mb-8 rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
        <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 15a7 7 0 100-14 7 7 0 000 14zm0 0l-2 6h4l-2-6z"/></svg>
          证书列表
        </div>
        <div v-loading="loading" class="min-h-[300px]">
          <div v-if="list.length" class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gradient-to-b from-[#fff7ed] to-[#ffedd5] text-left text-sm text-gray-800">
                  <th class="py-3 pr-4 font-semibold border-b-2 border-[#F97316]">证书名称</th>
                  <th class="py-3 pr-4 font-semibold border-b-2 border-[#F97316]">分类</th>
                  <th class="py-3 pr-4 font-semibold border-b-2 border-[#F97316]">级别</th>
                  <th class="py-3 pr-4 font-semibold border-b-2 border-[#F97316]">费用</th>
                  <th class="py-3 pr-4 font-semibold border-b-2 border-[#F97316]">考试时间</th>
                  <th class="py-3 font-semibold border-b-2 border-[#F97316]">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in list" :key="item.id"
                  class="border-b border-gray-50 hover:bg-orange-50/50 transition-colors"
                >
                  <td class="py-3 pr-4 text-sm font-medium text-gray-800">{{ item.certName }}</td>
                  <td class="py-3 pr-4 text-sm text-gray-600">
                    <span class="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs text-orange-600">{{ item.category }}</span>
                  </td>
                  <td class="py-3 pr-4 text-sm text-gray-600">{{ item.certLevel }}</td>
                  <td class="py-3 pr-4 text-sm text-gray-600">{{ item.examFee ? `¥${item.examFee}` : '-' }}</td>
                  <td class="py-3 pr-4 text-sm text-gray-600">{{ item.examTime || '-' }}</td>
                  <td class="py-3 text-sm">
                    <button
                      class="rounded-full bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-100 transition-colors"
                      @click="openDetail(String(item.id))"
                    >
                      报名指南
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else-if="!loading" class="py-16 text-center text-gray-400">暂无证书数据</div>
        </div>
        <div v-if="total > pageSize" class="mt-6 flex justify-center">
          <el-pagination
            background layout="total, sizes, prev, pager, next"
            :total="total" :page-sizes="[10, 20, 30, 50, 100]"
            :page-size="pageSize" :current-page="currentPage"
            @current-change="onPageChange" @size-change="onSizeChange"
          />
        </div>
      </section>
    </main>

    <!-- Certificate Detail Dialog -->
    <ElDialog
      v-model="showDetail"
      title="📋 报名指南"
      width="640px"
      :close-on-click-modal="false"
      v-loading="detailLoading"
      class="cert-guide-dialog"
    >
      <template v-if="currentCert">
        <div class="rounded-xl bg-gradient-to-b from-orange-50/70 to-white p-5 border-t-[3px] border-t-[#F97316] border-b-[3px] border-b-[#FB923C]">
          <div class="space-y-5">
            <div class="text-center">
              <h3 class="text-xl font-bold text-gray-800">{{ currentCert.certName }}</h3>
              <div class="flex justify-center flex-wrap gap-2 mt-2">
                <span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600">{{ currentCert.category }}</span>
                <span class="rounded-full bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-1 text-xs font-medium text-orange-600 ring-1 ring-inset ring-orange-200">{{ currentCert.certLevel }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm">
              <div class="rounded-xl bg-white px-4 py-3 shadow-sm border border-orange-100">
                <div class="text-xs text-gray-400">适用专业</div>
                <div class="mt-1 font-medium text-gray-700">{{ currentCert.applicableMajor || '-' }}</div>
              </div>
              <div class="rounded-xl bg-white px-4 py-3 shadow-sm border border-orange-100">
                <div class="text-xs text-gray-400">报名时间</div>
                <div class="mt-1 font-medium text-gray-700">{{ currentCert.registrationTime || '-' }}</div>
              </div>
              <div class="rounded-xl bg-white px-4 py-3 shadow-sm border border-orange-100">
                <div class="text-xs text-gray-400">考试时间</div>
                <div class="mt-1 font-medium text-gray-700">{{ currentCert.examTime || '-' }}</div>
              </div>
              <div class="rounded-xl bg-white px-4 py-3 shadow-sm border border-orange-100">
                <div class="text-xs text-gray-400">考试费用</div>
                <div class="mt-1 font-medium text-gray-700">{{ currentCert.examFee ? `¥${currentCert.examFee}` : '-' }}</div>
              </div>
            </div>

            <div class="h-px shrink-0 bg-gradient-to-r from-orange-500 to-amber-400"></div>

            <div v-if="currentCert.certIntro" class="text-sm">
              <h4 class="mb-1.5 flex items-center gap-1.5 font-semibold text-gray-800">
                <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                证书简介
              </h4>
              <div class="rounded-lg border-l-4 border-orange-400 bg-orange-50 p-4 text-sm leading-relaxed text-gray-600">
                {{ currentCert.certIntro }}
              </div>
            </div>

            <div v-if="currentCert.examRequirements?.length" class="text-sm">
              <h4 class="mb-2 flex items-center gap-1.5 font-semibold text-gray-800">
                <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                考试要求
              </h4>
              <ul class="list-disc list-inside space-y-1 text-gray-600">
                <li v-for="req in currentCert.examRequirements" :key="req">{{ req }}</li>
              </ul>
            </div>

            <div v-if="currentCert.examArrangement" class="text-sm">
              <h4 class="mb-1 flex items-center gap-1.5 font-semibold text-gray-800">
                <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                考试安排
              </h4>
              <p class="text-gray-600">{{ currentCert.examArrangement }}</p>
            </div>

            <div v-if="currentCert.officialWebsite" class="text-sm">
              <h4 class="mb-1 flex items-center gap-1.5 font-semibold text-gray-800">
                <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5m5.328 2.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5"/></svg>
                官方网站
              </h4>
              <a :href="currentCert.officialWebsite" target="_blank" class="text-orange-500 hover:text-orange-600 hover:underline">
                {{ currentCert.officialWebsite }}
              </a>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button
          class="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
          @click="showDetail = false"
        >
          关闭
        </button>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.cert-guide-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.cert-guide-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid #F97316;
  margin-right: 0;
  padding-bottom: 16px;
}

.cert-guide-dialog :deep(.el-dialog__title) {
  font-weight: 700;
  color: #1f2937;
}
</style>
