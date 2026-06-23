<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Motion } from 'motion-v'
import SiteFooter from '@/components/SiteFooter.vue'
import { getCompetitionList } from '@/api/certificate'
import type { CompetitionListVO } from '@/types/certificate'

const router = useRouter()

const loading = ref(false)
const list = ref<CompetitionListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

async function fetchList() {
  loading.value = true
  try {
    const res = await getCompetitionList({ page: currentPage.value, size: pageSize.value })
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch {
    ElMessage.error('获取竞赛列表失败')
  } finally {
    loading.value = false
  }
}

function goDetail(id: number) {
  router.push(`/competition/${id}`)
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

onMounted(fetchList)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div class="container mx-auto flex items-center px-6 py-4">
        <button class="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors" @click="router.push('/')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">返回首页</span>
        </button>
        <h1 class="flex-1 text-center text-xl font-bold text-gray-800 mr-16">大学科研与竞赛</h1>
      </div>
    </header>

    <main class="container mx-auto px-6 py-8">
      <!-- Intro Banner -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-6 border border-orange-100">
          <p class="text-gray-700 leading-relaxed">
            参与科研竞赛是提升综合素质、展示个人能力的重要途径。我们汇集了各类学科竞赛信息，助您找到最适合的竞赛项目。
          </p>
        </div>
      </Motion>

      <!-- Value of competitions (hardcoded) -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.1 }" class="mb-8">
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h2 class="mb-4 text-lg font-bold text-gray-800">学术竞赛的价值</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center p-4">
              <div class="text-3xl mb-2">🏆</div>
              <h3 class="font-semibold text-gray-800 mb-1">提升竞争力</h3>
              <p class="text-sm text-gray-500">获奖经历是保研、考研复试、求职简历中的重要加分项</p>
            </div>
            <div class="text-center p-4">
              <div class="text-3xl mb-2">🧠</div>
              <h3 class="font-semibold text-gray-800 mb-1">锻炼综合能力</h3>
              <p class="text-sm text-gray-500">培养创新思维、团队协作、问题解决和项目管理能力</p>
            </div>
            <div class="text-center p-4">
              <div class="text-3xl mb-2">🌐</div>
              <h3 class="font-semibold text-gray-800 mb-1">拓展视野</h3>
              <p class="text-sm text-gray-500">接触前沿领域，与全国优秀学子交流，开阔学术视野</p>
            </div>
          </div>
        </section>
      </Motion>

      <!-- Competition List -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.2 }">
        <section class="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <h2 class="mb-4 text-lg font-bold text-gray-800">竞赛列表</h2>
          <div v-loading="loading" class="min-h-[300px]">
            <div v-if="list.length" class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 text-left text-sm text-gray-500">
                    <th class="pb-3 pr-4 font-medium">竞赛名称</th>
                    <th class="pb-3 pr-4 font-medium w-28">级别</th>
                    <th class="pb-3 pr-4 font-medium w-40">报名时间</th>
                    <th class="pb-3 font-medium w-20">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in list" :key="item.id"
                    class="border-b border-gray-50 hover:bg-orange-50/50 transition-colors"
                  >
                    <td class="py-3 pr-4 text-sm font-medium text-gray-800">{{ item.compName }}</td>
                    <td class="py-3 pr-4 text-sm">
                      <span
                        class="rounded-full px-2.5 py-0.5 text-xs"
                        :class="item.compLevel === '国家级' ? 'bg-red-50 text-red-600' : item.compLevel === '省级' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'"
                      >{{ item.compLevel }}</span>
                    </td>
                    <td class="py-3 pr-4 text-sm text-gray-600">{{ item.registrationTime || '-' }}</td>
                    <td class="py-3 text-sm">
                      <button
                        class="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                        @click="goDetail(item.id)"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else-if="!loading" class="py-16 text-center text-gray-400">暂无竞赛数据</div>
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
      </Motion>
    </main>

    <SiteFooter />
  </div>
</template>
