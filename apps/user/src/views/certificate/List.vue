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
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 border border-orange-100">
          <p class="text-gray-700 leading-relaxed">
            职业技能证书是衡量个人专业能力的重要凭证，涵盖计算机、财会、语言、工程等多个领域。本页面为您提供各类证书的详细信息，助您规划职业发展路径。
          </p>
        </div>
      </Motion>

      <!-- Category filter -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.1 }" class="mb-6">
        <div class="flex flex-wrap gap-3" v-if="categories.length">
          <button
            v-for="cat in categories" :key="cat"
            class="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all"
            :class="activeCategory === cat
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500'"
            @click="switchCategory(cat)"
          >
            {{ cat }}
          </button>
        </div>
      </Motion>

      <!-- Search bar -->
      <div class="mb-6 flex flex-wrap items-center gap-3">
        <input
          v-model="keyword"
          type="text"
          placeholder="输入证书名称搜索"
          class="flex-1 min-w-[200px] rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
          @keyup.enter="handleSearch"
        />
        <button
          class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
          @click="handleSearch"
        >
          搜索
        </button>
      </div>

      <!-- Certificate List -->
      <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
        <h2 class="mb-4 text-lg font-bold text-gray-800">证书列表</h2>
        <div v-loading="loading" class="min-h-[300px]">
          <div v-if="list.length" class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-100 text-left text-sm text-gray-500">
                  <th class="pb-3 pr-4 font-medium">证书名称</th>
                  <th class="pb-3 pr-4 font-medium">分类</th>
                  <th class="pb-3 pr-4 font-medium">级别</th>
                  <th class="pb-3 pr-4 font-medium">费用</th>
                  <th class="pb-3 pr-4 font-medium">考试时间</th>
                  <th class="pb-3 font-medium">操作</th>
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
                      class="text-orange-500 hover:text-orange-600 font-medium transition-colors"
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
      title="报名指南"
      width="640px"
      :close-on-click-modal="false"
      v-loading="detailLoading"
    >
      <template v-if="currentCert">
        <div class="space-y-5">
          <div>
            <h3 class="text-xl font-bold text-gray-800">{{ currentCert.certName }}</h3>
            <div class="flex flex-wrap gap-2 mt-2">
              <span class="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs text-orange-600">{{ currentCert.category }}</span>
              <span class="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-600">{{ currentCert.certLevel }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div><span class="text-gray-400">适用专业：</span><span class="text-gray-700">{{ currentCert.applicableMajor || '-' }}</span></div>
            <div><span class="text-gray-400">报名时间：</span><span class="text-gray-700">{{ currentCert.registrationTime || '-' }}</span></div>
            <div><span class="text-gray-400">考试时间：</span><span class="text-gray-700">{{ currentCert.examTime || '-' }}</span></div>
            <div><span class="text-gray-400">考试费用：</span><span class="text-gray-700">{{ currentCert.examFee ? `¥${currentCert.examFee}` : '-' }}</span></div>
          </div>

          <div v-if="currentCert.certIntro" class="text-sm text-gray-600 leading-relaxed">
            <h4 class="font-semibold text-gray-800 mb-1">证书简介</h4>
            <p>{{ currentCert.certIntro }}</p>
          </div>

          <div v-if="currentCert.examRequirements?.length" class="text-sm">
            <h4 class="font-semibold text-gray-800 mb-2">考试要求</h4>
            <ul class="list-disc list-inside space-y-1 text-gray-600">
              <li v-for="req in currentCert.examRequirements" :key="req">{{ req }}</li>
            </ul>
          </div>

          <div v-if="currentCert.examArrangement" class="text-sm">
            <h4 class="font-semibold text-gray-800 mb-1">考试安排</h4>
            <p class="text-gray-600">{{ currentCert.examArrangement }}</p>
          </div>

          <div v-if="currentCert.officialWebsite" class="text-sm">
            <h4 class="font-semibold text-gray-800 mb-1">官方网站</h4>
            <a :href="currentCert.officialWebsite" target="_blank" class="text-orange-500 hover:text-orange-600 hover:underline">
              {{ currentCert.officialWebsite }}
            </a>
          </div>
        </div>
      </template>
      <template #footer>
        <button
          class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
          @click="showDetail = false"
        >
          关闭
        </button>
      </template>
    </ElDialog>
  </div>
</template>
