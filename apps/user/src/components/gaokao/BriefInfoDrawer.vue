<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { getCityBriefByName, getUniversityBriefByName, getMajorBriefByName } from '@/api/gaokao/brief'
import type { CityBriefVO, UniversityBriefVO, MajorBriefVO, BriefDrawerData } from '@/types/gaokao/brief'

const props = defineProps<{
  visible: boolean
  data: BriefDrawerData | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const router = useRouter()
const loading = ref(false)
const cityData = ref<CityBriefVO | null>(null)
const universityData = ref<UniversityBriefVO | null>(null)
const majorData = ref<MajorBriefVO | null>(null)

const drawerVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

const currentName = computed(() => props.data?.name || '')
const currentType = computed(() => props.data?.type || 'university')

watch(
  () => [props.visible, props.data] as const,
  async ([visible, data]) => {
    if (!visible || !data) return
    loading.value = true
    cityData.value = null
    universityData.value = null
    majorData.value = null
    try {
      if (data.type === 'city') {
        const res = await getCityBriefByName(data.name)
        cityData.value = res.data.data
      } else if (data.type === 'major') {
        const res = await getMajorBriefByName(data.name)
        majorData.value = res.data.data
      } else {
        const res = await getUniversityBriefByName(data.name)
        universityData.value = res.data.data
      }
    } catch (e: any) {
      ElMessage.error(e?.message || '加载简要信息失败')
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)

const currentId = computed(() => {
  if (currentType.value === 'city' && cityData.value) {
    return cityData.value.id
  }
  if (currentType.value === 'university' && universityData.value) {
    return universityData.value.id
  }
  if (currentType.value === 'major' && majorData.value) {
    return majorData.value.id
  }
  return null
})

function goDetail() {
  if (!currentId.value) {
    ElMessage.warning('暂无详情数据')
    return
  }
  drawerVisible.value = false
  if (currentType.value === 'city') {
    router.push(`/city/${currentId.value}`)
  } else if (currentType.value === 'major') {
    router.push(`/major/${currentId.value}`)
  } else {
    router.push(`/university/${currentId.value}`)
  }
}

function handleClose() {
  drawerVisible.value = false
}
</script>

<template>
  <el-drawer
    v-model="drawerVisible"
    direction="rtl"
    size="420px"
    :show-close="true"
    :with-header="false"
    class="brief-drawer"
  >
    <div class="h-full flex flex-col">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex-1 flex items-center justify-center">
        <el-icon class="is-loading text-4xl text-orange-500"><Loading /></el-icon>
      </div>

      <!-- 无数据 -->
      <div v-else-if="!cityData && !universityData && !majorData" class="flex-1 flex items-center justify-center text-gray-400">
        暂无数据
      </div>

      <!-- 城市信息 -->
      <div v-else-if="currentType === 'city' && cityData" class="flex-1 overflow-y-auto">
        <div class="p-6">
          <div class="mb-6">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                {{ cityData.cityName.charAt(0) }}
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-800">{{ cityData.cityName }}</h2>
                <p class="text-sm text-gray-500">{{ cityData.province }} · {{ cityData.region }}</p>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">城市简介</h3>
            <p class="text-sm text-gray-600 leading-relaxed">{{ cityData.cityIntro || '暂无简介' }}</p>
          </div>

          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">院校数量</h3>
            <div class="text-2xl font-bold text-orange-500">{{ cityData.collegeCount }}<span class="text-sm font-normal text-gray-500 ml-1">所</span></div>
          </div>
        </div>
      </div>

      <!-- 院校信息 -->
      <div v-else-if="currentType === 'university' && universityData" class="flex-1 overflow-y-auto">
        <div class="p-6">
          <div class="mb-6">
            <div class="flex items-center gap-3 mb-2">
              <div
                v-if="universityData.imageUrl"
                class="w-14 h-14 rounded-full bg-gray-100 shrink-0 overflow-hidden"
              >
                <img :src="universityData.imageUrl" :alt="universityData.name" class="w-full h-full object-cover" />
              </div>
              <div
                v-else
                class="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xl font-bold shrink-0"
              >
                {{ universityData.name.charAt(0) }}
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-800">{{ universityData.name }}</h2>
                <p class="text-sm text-gray-500">{{ universityData.provinceName }} · {{ universityData.cityName }}</p>
              </div>
            </div>
          </div>

          <div v-if="universityData.tags && universityData.tags.length > 0" class="mb-6">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in universityData.tags"
                :key="tag"
                class="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-medium"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">基本信息</h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-xs text-gray-400 mb-1">区域</div>
                <div class="text-sm font-medium text-gray-700">{{ universityData.region || '-' }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-xs text-gray-400 mb-1">类型</div>
                <div class="text-sm font-medium text-gray-700">{{ universityData.category || '-' }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-xs text-gray-400 mb-1">层次</div>
                <div class="text-sm font-medium text-gray-700">{{ universityData.educationLevel || '-' }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-xs text-gray-400 mb-1">性质</div>
                <div class="text-sm font-medium text-gray-700">{{ universityData.nature || '-' }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-xs text-gray-400 mb-1">主管部门</div>
                <div class="text-sm font-medium text-gray-700">{{ universityData.department || '-' }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-xs text-gray-400 mb-1">推荐指数</div>
                <div class="text-sm font-medium text-orange-500">{{ universityData.recommendationRate ?? '-' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 专业信息 -->
      <div v-else-if="currentType === 'major' && majorData" class="flex-1 overflow-y-auto">
        <div class="p-6">
          <div class="mb-6">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
                {{ majorData.majorName.charAt(0) }}
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-800">{{ majorData.majorName }}</h2>
                <p class="text-sm text-gray-500 font-mono">代码：{{ majorData.majorCode }}</p>
              </div>
            </div>
          </div>

          <div v-if="majorData.majorTags" class="mb-6">
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in majorData.majorTags.split(/[,，、]/).filter(Boolean)"
                :key="tag"
                class="text-xs bg-orange-50 text-orange-600 px-3 py-1 rounded-full font-medium"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="mb-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">基本信息</h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-xs text-gray-400 mb-1">门类</div>
                <div class="text-sm font-medium text-gray-700">{{ majorData.disciplineName || '-' }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-xs text-gray-400 mb-1">专业类别</div>
                <div class="text-sm font-medium text-gray-700">{{ majorData.majorCategory || '-' }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-xs text-gray-400 mb-1">所属大类</div>
                <div class="text-sm font-medium text-gray-700">{{ majorData.parentCategory || '-' }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-xs text-gray-400 mb-1">专业类型</div>
                <div class="text-sm font-medium text-gray-700">{{ majorData.majorType || '-' }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-xs text-gray-400 mb-1">授予学位</div>
                <div class="text-sm font-medium text-gray-700">{{ majorData.degreeAwarded || '-' }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-xs text-gray-400 mb-1">学制</div>
                <div class="text-sm font-medium text-gray-700">{{ majorData.studyDuration || '-' }}</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-xs text-gray-400 mb-1">就业率</div>
                <div class="text-sm font-medium text-orange-500">
                  {{ majorData.employmentRate != null ? `${(majorData.employmentRate * 100).toFixed(1)}%` : '-' }}
                </div>
              </div>
              <div class="bg-gray-50 rounded-lg p-3">
                <div class="text-xs text-gray-400 mb-1">薪资区间</div>
                <div class="text-sm font-medium text-orange-500">
                  {{ majorData.salaryMin != null && majorData.salaryMax != null
                    ? `¥${majorData.salaryMin} ~ ¥${majorData.salaryMax}`
                    : '-' }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="majorData.description" class="mb-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">专业简介</h3>
            <p class="text-sm text-gray-600 leading-relaxed">{{ majorData.description }}</p>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="shrink-0 border-t border-gray-100 p-4 bg-white flex gap-3">
        <button
          class="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-md text-sm"
          :disabled="!currentId"
          @click="goDetail"
        >
          查看详情
        </button>
        <button
          class="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-gray-600 font-semibold hover:bg-gray-200 transition-all text-sm"
          @click="handleClose"
        >
          退出
        </button>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
.brief-drawer :deep(.el-drawer__body) {
  padding: 0;
}
</style>
