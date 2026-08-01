<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { ProvinceOptions } from '@haifeng/shared'
import {
  getReformModel,
  getRank,
  getBatchLines,
  saveArchive,
  getArchive,
  matchConstraints,
  getConstraintDetails,
  type ReformModelData,
  type BatchLine,
  type GaokaoArchiveForm,
  type ConstraintItem,
} from '@/api/gaokao'
import ConstraintDisplay from '@/components/gaokao/ConstraintDisplay.vue'

const router = useRouter()

// 表单数据
const form = reactive<GaokaoArchiveForm>({
  gaokaoYear: new Date().getFullYear(),
  gaokaoProvince: '',
  score: 0,
  rank: 0,
  subjectType: '',
  secondSubjectType: '',
  thirdSubjectType: '',
  batch: '',
  batchDataYear: new Date().getFullYear(),
  batchLineScore: 0,
})

// 改革模式数据
const reformModel = ref<ReformModelData | null>(null)
const batchList = ref<BatchLine[]>([])

// 折叠状态
const showScores = ref(false)
const showBodyCondition = ref(false)
const showIdentityCondition = ref(false)

// 加载状态
const loading = ref(false)
const saving = ref(false)
const saved = ref(false)
const archiveId = ref<string | null>(null)

// 约束相关
const constraintList = ref<ConstraintItem[]>([])
const constraintLoading = ref(false)

// 年份选项
const yearOptions = Array.from({ length: 11 }, (_, i) => {
  const year = new Date().getFullYear() - 5 + i
  return { value: year, label: `${year}年` }
})

// 外语语种选项
const foreignLanguageOptions = [
  { value: '英语', label: '英语' },
  { value: '日语', label: '日语' },
  { value: '俄语', label: '俄语' },
  { value: '德语', label: '德语' },
  { value: '法语', label: '法语' },
  { value: '西班牙语', label: '西班牙语' },
]

// 政治面貌选项
const politicalStatusOptions = [
  { value: '群众', label: '群众' },
  { value: '共青团员', label: '共青团员' },
  { value: '中共党员', label: '中共党员' },
  { value: '中共预备党员', label: '中共预备党员' },
  { value: '民主党派', label: '民主党派' },
]

// 户籍类型选项
const householdTypeOptions = [
  { value: '城镇', label: '城镇' },
  { value: '农村', label: '农村' },
]

function goHome() {
  router.push('/')
}

// 监听省份和年份变化，查询改革模式
watch(
  () => [form.gaokaoProvince, form.gaokaoYear],
  async ([province, year]) => {
    if (!province || !year) return
    try {
      const res = await getReformModel({
        province: province as string,
        year: year as number,
      })
      reformModel.value = res.data.data
      form.subjectType = ''
      form.secondSubjectType = ''
      form.thirdSubjectType = ''
    } catch (e: any) {
      ElMessage.error(e?.message || '获取改革模式失败')
    }
  }
)

// 监听省份、年份、科类、分数变化，查询位次
let rankTimer: ReturnType<typeof setTimeout> | null = null
watch(
  () => [form.gaokaoProvince, form.gaokaoYear, form.subjectType, form.score],
  ([province, year, subjectType, score]) => {
    if (rankTimer) clearTimeout(rankTimer)
    if (!province || !year || !subjectType || !score) return
    rankTimer = setTimeout(async () => {
      try {
        const res = await getRank({
          province: province as string,
          year: year as number,
          subjectType: subjectType as string,
          score: score as number,
        })
        if (res.data.data) {
          form.rank = res.data.data.rank
        }
      } catch (e) {
        // 位次查询失败静默处理
      }
    }, 500)
  }
)

// 监听省份、年份、科类变化，查询批次线
watch(
  () => [form.gaokaoProvince, form.gaokaoYear, form.subjectType],
  async ([province, year, subjectType]) => {
    if (!province || !year || !subjectType) return
    try {
      const res = await getBatchLines({
        province: province as string,
        year: year as number,
        subjectType: subjectType as string,
      })
      batchList.value = res.data.data.batches
      form.batchDataYear = res.data.data.dataYear
    } catch (e) {
      // 批次线查询失败静默处理
    }
  }
)

// 监听批次变化，自动设置省控线
watch(
  () => form.batch,
  (batch) => {
    const found = batchList.value.find((b) => b.batch === batch)
    if (found) {
      form.batchLineScore = found.scoreLine
    }
  }
)

// 加载已有档案
async function loadArchive() {
  loading.value = true
  try {
    const res = await getArchive()
    const data = res.data.data
    if (data) {
      archiveId.value = data.id
      saved.value = true
      Object.assign(form, {
        gaokaoYear: data.gaokaoYear,
        gaokaoProvince: data.gaokaoProvince,
        score: data.score,
        rank: data.rank,
        subjectType: data.subjectType,
        secondSubjectType: data.secondSubjectType || '',
        thirdSubjectType: data.thirdSubjectType || '',
        batch: data.batch,
        batchDataYear: data.batchDataYear,
        batchLineScore: data.batchLineScore,
        scoreChinese: data.scoreChinese,
        scoreMath: data.scoreMath,
        scoreEnglish: data.scoreEnglish,
        foreignLanguage: data.foreignLanguage || '',
        scoreSubject1: data.scoreSubject1,
        scoreSubject2: data.scoreSubject2,
        scoreSubject3: data.scoreSubject3,
        isColorBlind: data.isColorBlind,
        isColorWeak: data.isColorWeak,
        visionLeft: data.visionLeft,
        visionRight: data.visionRight,
        hasSmellDisorder: data.hasSmellDisorder,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        isLeftHanded: data.isLeftHanded,
        hasTattoo: data.hasTattoo,
        hasScar: data.hasScar,
        hasStutter: data.hasStutter,
        isFreshGraduate: data.isFreshGraduate,
        politicalStatus: data.politicalStatus || '',
        householdType: data.householdType || '',
        isPovertyCounty: data.isPovertyCounty,
      })
      loadConstraints()
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '加载档案失败')
  } finally {
    loading.value = false
  }
}

// 保存档案
async function handleSave() {
  if (!form.gaokaoProvince) {
    ElMessage.warning('请选择高考省份')
    return
  }
  if (!form.score || form.score < 0 || form.score > 750) {
    ElMessage.warning('请填写正确的高考总分')
    return
  }
  if (!form.rank || form.rank <= 0) {
    ElMessage.warning('请填写正确的位次')
    return
  }
  if (!form.subjectType) {
    ElMessage.warning('请选择科目')
    return
  }
  if (!form.batch) {
    ElMessage.warning('请选择批次')
    return
  }

  saving.value = true
  try {
    await saveArchive(form)
    saved.value = true
    ElMessage.success('档案保存成功')
    loadConstraints()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// 加载约束匹配结果
async function loadConstraints() {
  constraintLoading.value = true
  try {
    const matchRes = await matchConstraints()
    const codes = matchRes.data.data.constraintCodes
    if (codes.length > 0) {
      const detailRes = await getConstraintDetails(codes)
      constraintList.value = detailRes.data.data.constraints
    } else {
      constraintList.value = []
    }
  } catch {
    // 静默处理
  } finally {
    constraintLoading.value = false
  }
}

// 查询专业组
function goGroups() {
  router.push('/gaokao/groups')
}

onMounted(loadArchive)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
    <main class="flex-1 container mx-auto px-6 py-8 max-w-3xl">
      <div v-if="loading" class="flex justify-center py-20">
        <el-icon class="is-loading text-4xl text-orange-500"><Loading /></el-icon>
      </div>

      <div v-else class="space-y-6">
        <!-- 区域1：基础信息 -->
        <div class="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
          <h2 class="text-lg font-bold text-gray-800 mb-4">基础信息</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">高考年份 *</label>
              <el-select v-model="form.gaokaoYear" placeholder="选择年份" class="w-full">
                <el-option v-for="opt in yearOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">高考省份 *</label>
              <el-select v-model="form.gaokaoProvince" placeholder="选择省份" filterable class="w-full">
                <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">高考总分 *</label>
              <el-input-number v-model="form.score" :min="0" :max="750" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">位次 *</label>
              <el-input-number v-model="form.rank" :min="0" class="w-full" />
            </div>
          </div>
        </div>

        <!-- 科目选择 -->
        <div class="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
          <h2 class="text-lg font-bold text-gray-800 mb-4">科目选择</h2>
          <div v-if="!reformModel" class="text-gray-400 text-center py-4">
            请先选择省份和年份
          </div>
          <div v-else>
            <p class="text-sm text-gray-500 mb-3">改革模式：{{ reformModel.reformModel }}</p>

            <!-- 传统文理 -->
            <div v-if="reformModel.reformModel === '传统文理'" class="flex gap-4">
              <el-radio-group v-model="form.subjectType">
                <el-radio-button value="文科">文科</el-radio-button>
                <el-radio-button value="理科">理科</el-radio-button>
              </el-radio-group>
            </div>

            <!-- 3+1+2 -->
            <div v-else-if="reformModel.reformModel === '3+1+2'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">首选科目 *</label>
                <el-radio-group v-model="form.subjectType">
                  <el-radio-button v-for="sub in reformModel.subjects.first" :key="sub" :value="sub">{{ sub }}</el-radio-button>
                </el-radio-group>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">再选科目（选择2个）</label>
                <el-checkbox-group v-model="form.secondSubjectType" :max="2">
                  <el-checkbox v-for="sub in reformModel.subjects.second" :key="sub" :value="sub" :label="sub" />
                </el-checkbox-group>
              </div>
            </div>

            <!-- 3+3 -->
            <div v-else-if="reformModel.reformModel === '3+3'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">选考科目（选择3个）</label>
                <el-checkbox-group v-model="form.subjectType" :max="3">
                  <el-checkbox v-for="sub in reformModel.subjects.first" :key="sub" :value="sub" :label="sub" />
                </el-checkbox-group>
              </div>
            </div>
          </div>
        </div>

        <!-- 批次信息 -->
        <div class="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
          <h2 class="text-lg font-bold text-gray-800 mb-4">批次信息</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">批次 *</label>
              <el-select v-model="form.batch" placeholder="选择批次" class="w-full">
                <el-option v-for="b in batchList" :key="b.batch" :label="b.batch" :value="b.batch" />
              </el-select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1.5">批次省控线 *</label>
              <el-input-number v-model="form.batchLineScore" :min="0" :max="750" class="w-full" />
            </div>
          </div>
        </div>

        <!-- 各科成绩（折叠） -->
        <div class="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
          <button
            class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            @click="showScores = !showScores"
          >
            <h2 class="text-lg font-bold text-gray-800">各科成绩（可选）</h2>
            <svg class="w-5 h-5 text-gray-400 transition-transform" :class="{ 'rotate-180': showScores }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-show="showScores" class="px-6 pb-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">语文</label>
                <el-input-number v-model="form.scoreChinese" :min="0" :max="150" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">数学</label>
                <el-input-number v-model="form.scoreMath" :min="0" :max="150" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">外语</label>
                <el-input-number v-model="form.scoreEnglish" :min="0" :max="150" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">外语语种</label>
                <el-select v-model="form.foreignLanguage" placeholder="选择语种" clearable class="w-full">
                  <el-option v-for="opt in foreignLanguageOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">第一科目分数</label>
                <el-input-number v-model="form.scoreSubject1" :min="0" :max="100" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">第二科目分数</label>
                <el-input-number v-model="form.scoreSubject2" :min="0" :max="100" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">第三科目分数</label>
                <el-input-number v-model="form.scoreSubject3" :min="0" :max="100" class="w-full" />
              </div>
            </div>
          </div>
        </div>

        <!-- 身体条件（折叠） -->
        <div class="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
          <button
            class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            @click="showBodyCondition = !showBodyCondition"
          >
            <h2 class="text-lg font-bold text-gray-800">身体条件（可选）</h2>
            <svg class="w-5 h-5 text-gray-400 transition-transform" :class="{ 'rotate-180': showBodyCondition }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-show="showBodyCondition" class="px-6 pb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-600">是否色盲</label>
                <el-switch v-model="form.isColorBlind" />
              </div>
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-600">是否色弱</label>
                <el-switch v-model="form.isColorWeak" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">左眼视力</label>
                <el-input-number v-model="form.visionLeft" :min="0" :max="5.5" :step="0.1" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">右眼视力</label>
                <el-input-number v-model="form.visionRight" :min="0" :max="5.5" :step="0.1" class="w-full" />
              </div>
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-600">是否嗅觉迟钝</label>
                <el-switch v-model="form.hasSmellDisorder" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">身高（cm）</label>
                <el-input-number v-model="form.heightCm" :min="100" :max="250" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">体重（kg）</label>
                <el-input-number v-model="form.weightKg" :min="20" :max="200" :step="0.1" class="w-full" />
              </div>
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-600">是否左利手</label>
                <el-switch v-model="form.isLeftHanded" />
              </div>
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-600">是否有纹身</label>
                <el-switch v-model="form.hasTattoo" />
              </div>
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-600">是否有面部疤痕</label>
                <el-switch v-model="form.hasScar" />
              </div>
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-600">是否口吃</label>
                <el-switch v-model="form.hasStutter" />
              </div>
            </div>
          </div>
        </div>

        <!-- 身份条件（折叠） -->
        <div class="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
          <button
            class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
            @click="showIdentityCondition = !showIdentityCondition"
          >
            <h2 class="text-lg font-bold text-gray-800">身份条件（可选）</h2>
            <svg class="w-5 h-5 text-gray-400 transition-transform" :class="{ 'rotate-180': showIdentityCondition }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-show="showIdentityCondition" class="px-6 pb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-600">是否应届生</label>
                <el-switch v-model="form.isFreshGraduate" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">政治面貌</label>
                <el-select v-model="form.politicalStatus" placeholder="选择政治面貌" clearable class="w-full">
                  <el-option v-for="opt in politicalStatusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1.5">户籍类型</label>
                <el-select v-model="form.householdType" placeholder="选择户籍类型" clearable class="w-full">
                  <el-option v-for="opt in householdTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </div>
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium text-gray-600">是否贫困县户籍</label>
                <el-switch v-model="form.isPovertyCounty" />
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="flex gap-4">
          <button
            v-if="saved"
            class="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-8 py-3 text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
            @click="goGroups"
          >
            查询专业组
          </button>
          <button
            class="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg disabled:opacity-50"
            :disabled="saving"
            @click="handleSave"
          >
            {{ saving ? '保存中...' : '保存档案信息' }}
          </button>
        </div>

        <!-- 约束匹配结果 -->
        <div v-if="saved" class="rounded-2xl bg-white p-6 shadow-md border border-gray-100">
          <h2 class="text-lg font-bold text-gray-800 mb-4">约束匹配结果</h2>
          <div v-if="constraintLoading" class="flex justify-center py-8">
            <el-icon class="is-loading text-2xl text-orange-500"><Loading /></el-icon>
          </div>
          <ConstraintDisplay v-else :constraints="constraintList" />
        </div>
      </div>
    </main>
  </div>
</template>
