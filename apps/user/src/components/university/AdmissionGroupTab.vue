<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { getAdmissionGroupPage } from '@/api/university'
import { ProvinceOptions } from '@haifeng/shared'
import { MemberType } from '@haifeng/shared'
import { ElMessage } from 'element-plus'
import type { AdmissionGroupListVO, AdmissionGroupQueryDTO } from '@/types/university'

const props = defineProps<{ universityId: string }>()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const list = ref<AdmissionGroupListVO[]>([])
const total = ref(0)
const page = ref(1)
const size = ref(6)

const province = ref('')
const batch = ref('')
const cityName = ref('')

const isVip = computed(() => {
  return userStore.isLoggedIn() && userStore.userInfo?.memberType === MemberType.VIP
})

const batchOptions = ['本科批', '提前批', '专科批']

async function fetchList() {
  loading.value = true
  try {
    const params: AdmissionGroupQueryDTO = { page: page.value, size: size.value }
    if (province.value) params.province = province.value
    if (batch.value) params.batch = batch.value
    if (cityName.value) params.cityName = cityName.value

    const res = await getAdmissionGroupPage(props.universityId, params)
    list.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    if (e?.response?.status === 403) {
      list.value = []
    } else {
      ElMessage.error(e?.response?.data?.msg || '获取录取数据失败')
    }
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchList()
}

function handleReset() {
  province.value = ''
  batch.value = ''
  cityName.value = ''
  page.value = 1
  fetchList()
}

function onPageChange(p: number) {
  page.value = p
  fetchList()
}

function onSizeChange(s: number) {
  size.value = s
  page.value = 1
  fetchList()
}

function goDetail(groupId: number) {
  router.push(`/university/admission-group/${groupId}`)
}

function goLogin() {
  userStore.setRedirectPath(router.currentRoute.value.fullPath)
  router.push('/login')
}

function goVip() {
  router.push('/profile')
}

onMounted(() => {
  if (isVip.value) {
    fetchList()
  }
})
</script>

<template>
  <div>
    <!-- VIP 引导卡片 -->
    <div v-if="!isVip" class="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-8 text-center border border-orange-100 shadow-lg">
      <div class="mb-4 text-5xl">🔒</div>
      <h3 class="mb-2 text-xl font-bold text-gray-800">开通 VIP 查看录取数据</h3>
      <p class="mb-6 text-gray-500 max-w-md mx-auto">
        查看院校近5年录取分数线、专业组详情、录取位次等核心数据
      </p>
      <div class="flex justify-center gap-4">
        <button
          class="rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3 text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
          @click="userStore.isLoggedIn() ? goVip() : goLogin()"
        >
          {{ userStore.isLoggedIn() ? '立即开通 VIP' : '前往登录' }}
        </button>
        <button
          class="rounded-lg border border-orange-300 px-8 py-3 text-orange-500 font-medium hover:bg-orange-50 transition-all"
          @click="goVip"
        >
          了解会员权益
        </button>
      </div>
    </div>

    <!-- VIP 用户可见内容 -->
    <template v-else>
      <!-- 搜索栏 -->
      <div class="mb-6 flex flex-wrap items-end gap-4 rounded-2xl bg-white p-5 shadow-md border border-gray-100">
        <div class="w-44">
          <label class="block text-sm font-medium text-gray-600 mb-1.5">招生省份</label>
          <el-select v-model="province" placeholder="全部" clearable filterable class="w-full" @change="handleSearch">
            <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
        <div class="w-44">
          <label class="block text-sm font-medium text-gray-600 mb-1.5">录取批次</label>
          <el-select v-model="batch" placeholder="全部" clearable class="w-full" @change="handleSearch">
            <el-option v-for="opt in batchOptions" :key="opt" :label="opt" :value="opt" />
          </el-select>
        </div>
        <div class="min-w-[160px] flex-1">
          <label class="block text-sm font-medium text-gray-600 mb-1.5">城市名</label>
          <input
            v-model="cityName"
            type="text"
            placeholder="模糊搜索城市"
            class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
            @keyup.enter="handleSearch"
          />
        </div>
        <button
          class="h-[40px] rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-6 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md shadow-orange-200"
          @click="handleSearch"
        >
          搜索
        </button>
        <button
          class="h-[40px] rounded-lg border border-gray-200 px-6 text-sm text-gray-600 font-medium hover:border-orange-300 hover:text-orange-500 transition-all"
          @click="handleReset"
        >
          重置
        </button>
      </div>

      <!-- 卡片列表 2列 -->
      <div v-loading="loading" class="min-h-[200px]">
        <div v-if="list.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="item in list"
            :key="item.id"
            class="rounded-2xl bg-white p-5 shadow-lg border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all"
          >
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-base font-bold text-gray-800">
                {{ item.year }} · {{ item.groupName }}
              </h4>
              <span class="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs text-orange-600">{{ item.batch }}</span>
            </div>
            <p class="text-sm text-gray-500 mb-3">{{ item.province }} · {{ item.cityName }}</p>
            <div v-if="item.subjects?.length" class="mb-3 text-xs text-gray-500">
              选科: {{ item.subjects.join(', ') }} ({{ item.requirementType }})
            </div>
            <div class="grid grid-cols-3 gap-3 mb-3 text-center">
              <div class="rounded-lg bg-orange-50 p-2">
                <div class="text-xs text-gray-400">最低分</div>
                <div class="text-sm font-bold text-orange-600">{{ item.minScore }}</div>
                <div class="text-xs text-gray-400">位次 {{ item.minRank }}</div>
              </div>
              <div class="rounded-lg bg-amber-50 p-2">
                <div class="text-xs text-gray-400">最高分</div>
                <div class="text-sm font-bold text-amber-600">{{ item.maxScore }}</div>
                <div class="text-xs text-gray-400">位次 {{ item.maxRank }}</div>
              </div>
              <div class="rounded-lg bg-blue-50 p-2">
                <div class="text-xs text-gray-400">平均分</div>
                <div class="text-sm font-bold text-blue-600">{{ item.avgScore }}</div>
                <div class="text-xs text-gray-400">位次 {{ item.avgRank }}</div>
              </div>
            </div>
            <div class="flex items-center justify-between text-xs text-gray-400 mb-3">
              <span>{{ item.majorCount }} 个专业</span>
              <span>录取 {{ item.admissionCount }} 人</span>
            </div>
            <button
              class="w-full rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-sm text-white font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
              @click="goDetail(item.id)"
            >
              查看详情 →
            </button>
          </div>
        </div>
        <div v-else-if="!loading" class="py-16 text-center text-gray-400">
          暂无录取数据
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > size" class="mt-6 flex justify-center">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-sizes="[6, 9, 18, 30]"
          :page-size="size"
          :current-page="page"
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </template>
  </div>
</template>
