<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Motion } from 'motion-v'
import { getCompetitionList } from '@/api/certificate'
import type { CompetitionListVO, CompetitionQueryDTO } from '@/types/certificate'

const router = useRouter()

const loading = ref(false)
const list = ref<CompetitionListVO[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const query = reactive<CompetitionQueryDTO>({
  page: 1,
  size: 10,
  compName: '',
  compLevel: '',
})

const levelOptions = ['国家级', '省级', '校级']

async function fetchList() {
  loading.value = true
  try {
    const params: CompetitionQueryDTO = { page: currentPage.value, size: pageSize.value }
    if (query.compName) params.compName = query.compName
    if (query.compLevel) params.compLevel = query.compLevel
    const res = await getCompetitionList(params)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '获取竞赛列表失败')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchList()
}

function handleReset() {
  query.compName = ''
  query.compLevel = ''
  currentPage.value = 1
  fetchList()
}

function goDetail(id: string) {
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
    <main class="container mx-auto px-6 py-8">
      <!-- Intro Banner -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5 }" class="mb-8">
        <div class="rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 p-8 border border-orange-100">
          <div class="flex items-center gap-3 mb-3">
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v18l3-3 4 3 4-3 3 3V3a2 2 0 00-2-2H7a2 2 0 00-2 2zm7 11v2m0-6v1"/></svg>
            </span>
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800">竞赛信息大全 · 点亮学术履历</h1>
          </div>
          <p class="text-gray-600 leading-relaxed mb-4">
            参与科研竞赛是提升综合素质、展示个人能力的重要途径。我们汇集了各类学科竞赛信息，助您找到最适合的竞赛项目。
          </p>
          <div class="flex flex-wrap gap-2">
            <span v-for="kw in ['学科竞赛', '创新创业', '素质加分', '保研考研']" :key="kw" class="rounded-full bg-white px-4 py-1.5 text-sm text-orange-600 border border-orange-200">
              {{ kw }}
            </span>
          </div>
        </div>
      </Motion>

      <!-- Value of competitions (hardcoded) -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.1 }" class="mb-8">
        <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
          <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v18l3-3 4 3 4-3 3 3V3a2 2 0 00-2-2H7a2 2 0 00-2 2zm7 11v2m0-6v1"/></svg>
            学术竞赛的价值
          </div>
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

      <!-- Search bar -->
      <div class="mb-8 rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] shadow-lg p-6">
        <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          竞赛检索
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <input
            v-model="query.compName"
            type="text"
            placeholder="输入竞赛名称搜索"
            class="flex-1 min-w-[180px] rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
            @keyup.enter="handleSearch"
          />
          <el-select v-model="query.compLevel" placeholder="竞赛级别" clearable class="!w-32">
            <el-option v-for="opt in levelOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
          <button
            class="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-2.5 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
            @click="handleSearch"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            搜索
          </button>
          <button
            class="rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm text-gray-600 font-medium hover:border-orange-300 hover:text-orange-500 transition-all"
            @click="handleReset"
          >
            重置
          </button>
        </div>
      </div>

      <!-- Competition List -->
      <Motion :initial="{ opacity: 0, y: 20 }" :while-in-view="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.2 }">
        <section class="rounded-2xl bg-gradient-to-b from-orange-50/70 to-white border-t-[3px] border-[#F97316] border-b-[3px] border-[#FB923C] p-6 shadow-lg">
          <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-1.5 text-sm font-semibold text-white shadow-md shadow-orange-200">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v18l3-3 4 3 4-3 3 3V3a2 2 0 00-2-2H7a2 2 0 00-2 2zm7 11v2m0-6v1"/></svg>
            竞赛列表
          </div>
          <div v-loading="loading" class="min-h-[300px]">
            <div v-if="list.length" class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-gradient-to-b from-[#fff7ed] to-[#ffedd5] text-left text-sm text-gray-800">
                    <th class="py-3 pr-4 font-semibold border-b-2 border-[#F97316]">竞赛名称</th>
                    <th class="py-3 pr-4 font-semibold w-28 border-b-2 border-[#F97316]">级别</th>
                    <th class="py-3 pr-4 font-semibold w-40 border-b-2 border-[#F97316]">报名时间</th>
                    <th class="py-3 font-semibold w-20 border-b-2 border-[#F97316]">操作</th>
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
                        class="rounded-full bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-100 transition-colors"
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

  </div>
</template>
