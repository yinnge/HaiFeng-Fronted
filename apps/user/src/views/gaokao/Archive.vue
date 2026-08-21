<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ProvinceOptions } from '@haifeng/shared'
import {
  getReformModel,
  getRank,
  getBatchLines,
  getGaokaoYears,
  saveArchive,
  getArchive,
  matchConstraints,
  getConstraintDetails,
  type ReformModelData,
  type BatchLine,
  type GaokaoArchiveForm,
  type GaokaoArchiveVO,
  type ConstraintItem,
} from '@/api/gaokao'
import ConstraintDisplay from '@/components/gaokao/ConstraintDisplay.vue'
import LottiePlayer from '@/components/ui/LottiePlayer.vue'

const router = useRouter()

// 表单数据
const form = reactive<GaokaoArchiveForm>({
  gaokaoYear: new Date().getFullYear(),
  gaokaoProvince: '',
  score: 0,
  rank: 0,
  subjectType: '',
  batch: '',
  batchDataYear: new Date().getFullYear(),
  batchLineScore: 0,
})

// 改革模式数据
const reformModel = ref<ReformModelData | null>(null)
const batchList = ref<BatchLine[]>([])

// checkbox-group 绑定用的数组
const secondSubjects = ref<string[]>([]) // 3+1+2 再选科目
const firstSubjects = ref<string[]>([])  // 3+3 选考科目

// 动态科目分数标签
type ScoreField = 'scorePhysics' | 'scoreChemistry' | 'scoreBiology' | 'scorePolitics' | 'scoreHistory' | 'scoreGeography'

const subjectScoreFieldMap: Record<string, ScoreField> = {
  '物理': 'scorePhysics',
  '化学': 'scoreChemistry',
  '生物': 'scoreBiology',
  '政治': 'scorePolitics',
  '历史': 'scoreHistory',
  '地理': 'scoreGeography',
}

const electiveSubjects = computed<{ name: string; field: ScoreField }[]>(() => {
  if (!reformModel.value) return []

  const model = reformModel.value.reformModel

  // 传统文理：固定科目
  if (model === '传统文理') {
    if (form.subjectType === '文科') {
      return [
        { name: '政治', field: 'scorePolitics' },
        { name: '历史', field: 'scoreHistory' },
        { name: '地理', field: 'scoreGeography' },
      ]
    }
    if (form.subjectType === '理科') {
      return [
        { name: '物理', field: 'scorePhysics' },
        { name: '化学', field: 'scoreChemistry' },
        { name: '生物', field: 'scoreBiology' },
      ]
    }
    return []
  }

  // 3+1+2：首选科目 + 再选科目
  if (model === '3+1+2') {
    const subjects = [form.subjectType, ...secondSubjects.value]
      .filter((n): n is string => !!n)
    return subjects
      .filter((n): n is string => !!subjectScoreFieldMap[n])
      .map(n => ({ name: n, field: subjectScoreFieldMap[n] }))
  }

  // 3+3：选考科目
  if (model === '3+3') {
    return firstSubjects.value
      .filter((n): n is string => !!n && !!subjectScoreFieldMap[n])
      .map(n => ({ name: n, field: subjectScoreFieldMap[n] }))
  }

  return []
})

// 将科目名转换为后端 API 需要的科类名
function getSubjectTypeForAPI(subject: string): string {
  if (subject === '物理') return '物理类'
  if (subject === '历史') return '历史类'
  return subject // 文科/理科 已是正确值
}

// 是否展示位次输入：科目已选定 且 总分已填
const showRank = computed(() => {
  return !!form.subjectType && !!form.score && form.score > 0
})

// 位次数据实际来源年份（当年无数据回溯时非空且与所选年份不同）
const rankDataYear = ref<number | null>(null)

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

// 年份选项（优先走后端 /years 动态获取，失败回退本地生成最近5年）
const yearOptions = ref<{ value: number; label: string }[]>([])

function buildLocalYearOptions(): { value: number; label: string }[] {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - 4 + i
    return { value: year, label: `${year}年` }
  })
}

async function loadYears() {
  try {
    const res = await getGaokaoYears()
    const years = res.data.data
    const currentYear = new Date().getFullYear()
    yearOptions.value = (Array.isArray(years) ? years : [])
      .filter(y => Number.isFinite(y))
      .sort((a, b) => a - b)
      .filter(y => y >= currentYear - 5 && y <= currentYear + 1)
      .map(y => ({ value: y, label: `${y}年` }))
    if (yearOptions.value.length === 0) {
      yearOptions.value = buildLocalYearOptions()
    }
  } catch {
    yearOptions.value = buildLocalYearOptions()
  }
}

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
// 注意：这里只负责加载改革模式，不再清空科目——
// 回显（loadArchive 进行中）按已存数据回填；用户手动修改省份/年份才重置科目
let restoringData: GaokaoArchiveVO | null = null

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
      if (restoringData) {
        // 正在回显已有档案：按改革模式回填已选科目，不清空用户已存数据
        restoreSubjects(restoringData)
        restoringData = null
      } else {
        // 用户手动修改省份/年份：清空科目，重新选择
        resetSubjects()
      }
    } catch (e: any) {
      // 加载改革模式失败：丢弃回显残留，避免后续误回填
      restoringData = null
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
    rankDataYear.value = null
    if (!province || !year || !subjectType || !score) return
    rankTimer = setTimeout(async () => {
      try {
        const res = await getRank({
          province: province as string,
          year: year as number,
          subjectType: getSubjectTypeForAPI(subjectType as string),
          score: score as number,
        })
        if (res.data.data) {
          form.rank = res.data.data.rank
          rankDataYear.value = res.data.data.dataYear ?? null
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
        subjectType: getSubjectTypeForAPI(subjectType as string),
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

// 3+1+2：再选科目变化时，清除已取消科目的分数
watch(secondSubjects, (vals, oldVals) => {
  oldVals?.forEach(name => {
    if (!vals.includes(name) && subjectScoreFieldMap[name]) {
      form[subjectScoreFieldMap[name]] = undefined
    }
  })
})

// 3+3：选考科目变化时，同步 subjectType 并清除已取消科目的分数
watch(firstSubjects, (vals, oldVals) => {
  form.subjectType = vals[0] || ''
  oldVals?.forEach(name => {
    if (!vals.includes(name) && subjectScoreFieldMap[name]) {
      form[subjectScoreFieldMap[name]] = undefined
    }
  })
})

// 首选科目 / 文理切换时清空对应分数
watch(() => form.subjectType, (val, oldVal) => {
  if (val === oldVal) return
  if (reformModel.value?.reformModel === '3+1+2') {
    // 清除旧首选科目分数
    if (oldVal && subjectScoreFieldMap[oldVal]) {
      form[subjectScoreFieldMap[oldVal]] = undefined
    }
  } else if (reformModel.value?.reformModel === '传统文理') {
    // 文理切换，清除所有选考科目分数
    Object.values(subjectScoreFieldMap).forEach(field => {
      form[field] = undefined
    })
  }
})

// 清空科目选择（用户手动切换省份/年份时调用）
function resetSubjects() {
  form.subjectType = ''
  secondSubjects.value = []
  firstSubjects.value = []
  Object.values(subjectScoreFieldMap).forEach(field => {
    form[field] = undefined
  })
}

// 按改革模式回填已选科目（回显已有档案时调用，依赖 reformModel 已加载）
function restoreSubjects(data: GaokaoArchiveVO) {
  // 从非空分数字段推导已选科目，回填 checkbox-group 数组
  const allSubjects: { name: string; score?: number }[] = [
    { name: '物理', score: data.scorePhysics },
    { name: '化学', score: data.scoreChemistry },
    { name: '生物', score: data.scoreBiology },
    { name: '政治', score: data.scorePolitics },
    { name: '历史', score: data.scoreHistory },
    { name: '地理', score: data.scoreGeography },
  ]
  const selectedSubjects = allSubjects.filter(s => s.score != null).map(s => s.name)

  const model = reformModel.value?.reformModel
  if (model === '传统文理') {
    // 文理固定，无需回填
  } else if (model === '3+1+2') {
    // subjectType 是首选科目，其余为再选
    secondSubjects.value = selectedSubjects.filter(s => s !== form.subjectType)
  } else if (model === '3+3') {
    // 所有已选科目
    firstSubjects.value = selectedSubjects
  } else if (form.subjectType === '物理' || form.subjectType === '历史') {
    // 兜底：改革模式未知时按 3+1+2 处理
    secondSubjects.value = selectedSubjects.filter(s => s !== form.subjectType)
  } else if (selectedSubjects.length > 0) {
    firstSubjects.value = selectedSubjects
  }
}

// 加载已有档案
async function loadArchive() {
  loading.value = true
  try {
    const res = await getArchive()
    const data = res.data.data
    if (data) {
      archiveId.value = data.id
      saved.value = true
      // 先记录回显数据，等改革模式加载完成后由 watch 回填科目
      restoringData = data
      Object.assign(form, {
        gaokaoYear: data.gaokaoYear,
        gaokaoProvince: data.gaokaoProvince,
        score: data.score,
        rank: data.rank,
        subjectType: data.subjectType,
        batch: data.batch,
        batchDataYear: data.batchDataYear,
        batchLineScore: data.batchLineScore,
        scoreChinese: data.scoreChinese,
        scoreMath: data.scoreMath,
        scoreEnglish: data.scoreEnglish,
        foreignLanguage: data.foreignLanguage || '',
        scorePhysics: data.scorePhysics,
        scoreChemistry: data.scoreChemistry,
        scoreBiology: data.scoreBiology,
        scorePolitics: data.scorePolitics,
        scoreHistory: data.scoreHistory,
        scoreGeography: data.scoreGeography,
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
    // 组装再选科目（第二/第三科目）名称，供后端选科匹配与查询过滤使用
    form.secondSubjectType = undefined
    form.thirdSubjectType = undefined
    const model = reformModel.value?.reformModel
    if (model === '3+1+2') {
      if (secondSubjects.value.length > 0) form.secondSubjectType = secondSubjects.value[0]
      if (secondSubjects.value.length > 1) form.thirdSubjectType = secondSubjects.value[1]
    } else if (model === '3+3') {
      if (firstSubjects.value.length > 1) form.secondSubjectType = firstSubjects.value[1]
      if (firstSubjects.value.length > 2) form.thirdSubjectType = firstSubjects.value[2]
    }

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

// 进入报志愿（专业组选择）
function goWishPlan() {
  router.push('/gaokao/groups')
}

// 查看我的志愿表
function goPlans() {
  router.push('/gaokao/plans')
}

onMounted(async () => {
  await loadYears()
  if (yearOptions.value.length > 0 && !yearOptions.value.some(o => o.value === form.gaokaoYear)) {
    const latest = yearOptions.value[yearOptions.value.length - 1].value
    form.gaokaoYear = latest
    form.batchDataYear = latest
  }
  await loadArchive()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-brand-gray-50 to-white">
    <main class="flex-1 container mx-auto px-6 py-8 max-w-6xl">
      <!-- 页面标题 -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">{{ saved ? '修改档案' : '填写高考档案' }}</h1>
        <p class="text-sm text-gray-500 mt-1">{{ saved ? '更新你的档案信息，系统将重新匹配报考条件' : '填写基本信息，系统将自动匹配报考约束条件' }}</p>
      </div>

      <!-- 骨架屏加载 -->
      <div v-if="loading" class="flex flex-col lg:flex-row gap-8">
        <div class="flex-1 space-y-6">
          <div v-for="i in 4" :key="i" class="rounded-2xl border border-gray-100/60 bg-white p-6 shadow-card animate-pulse">
            <div class="w-24 h-5 bg-gray-200 rounded mb-5" />
            <div class="space-y-4">
              <div class="h-10 bg-gray-200 rounded-xl" />
              <div class="h-10 bg-gray-200 rounded-xl" />
              <div class="h-10 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
        <div class="hidden lg:block lg:w-[420px] shrink-0">
          <div class="rounded-2xl border border-gray-100/60 bg-white p-6 shadow-card animate-pulse h-[500px]" />
        </div>
      </div>

      <div v-else class="flex flex-col lg:flex-row gap-8">
        <!-- 左侧：表单区域 -->
        <div class="flex-1 min-w-0 space-y-6">

        <!-- 基础信息 -->
        <div class="rounded-2xl bg-white shadow-card border border-gray-100/80 overflow-hidden">
          <div class="h-1 bg-gradient-to-r from-brand-orange to-brand-orange-light" />
          <div class="p-6">
            <h2 class="text-base font-semibold text-gray-800 mb-5">基础信息</h2>
            <div class="space-y-5">
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">高考年份 *</label>
                <el-select v-model="form.gaokaoYear" placeholder="选择年份" class="w-full">
                  <el-option v-for="opt in yearOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">高考省份 *</label>
                <el-select v-model="form.gaokaoProvince" placeholder="选择省份" filterable class="w-full">
                  <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">高考总分 *</label>
                <el-input-number v-model="form.score" :min="0" :max="750" class="w-full" />
              </div>
            </div>
          </div>
        </div>

        <!-- 科目选择 -->
        <div class="rounded-2xl bg-white shadow-card border border-gray-100/80 overflow-hidden">
          <div class="h-1 bg-gradient-to-r from-brand-orange to-brand-orange-light" />
          <div class="p-6">
            <h2 class="text-base font-semibold text-gray-800 mb-5">科目选择</h2>
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
                <el-checkbox-group v-model="secondSubjects" :max="2">
                  <el-checkbox v-for="sub in reformModel.subjects.second" :key="sub" :value="sub" :label="sub" />
                </el-checkbox-group>
              </div>
            </div>

            <!-- 3+3 -->
            <div v-else-if="reformModel.reformModel === '3+3'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">选考科目（选择3个）</label>
                <el-checkbox-group v-model="firstSubjects" :max="3">
                  <el-checkbox v-for="sub in reformModel.subjects.first" :key="sub" :value="sub" :label="sub" />
                </el-checkbox-group>
              </div>
            </div>
          </div>

          <!-- 位次输入：科目选定 + 总分已填后展示 -->
          <div v-if="showRank" class="mt-5 pt-5 border-t border-gray-100">
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">位次 *</label>
            <el-input-number v-model="form.rank" :min="0" class="w-full" />
            <p class="text-xs text-gray-400 mt-1">填写总分后系统将自动查询位次，也可手动修改</p>
            <p v-if="rankDataYear && rankDataYear !== form.gaokaoYear" class="text-xs text-brand-orange mt-1">位次数据基于 <b>{{ rankDataYear }}</b> 年（当年暂无，自动取最近年份）</p>
          </div>
        </div>
        </div>

        <!-- 批次信息 -->
        <div class="rounded-2xl bg-white shadow-card border border-gray-100/80 overflow-hidden">
          <div class="h-1 bg-gradient-to-r from-brand-orange to-brand-orange-light" />
          <div class="p-6">
            <h2 class="text-base font-semibold text-gray-800 mb-5">批次信息</h2>
            <div class="space-y-5">
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">批次 *</label>
                <el-select v-model="form.batch" placeholder="选择批次" class="w-full">
                  <el-option v-for="b in batchList" :key="b.batch" :label="b.batch" :value="b.batch" />
                </el-select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">批次省控线 *</label>
                <el-input-number v-model="form.batchLineScore" :min="0" :max="750" class="w-full" />
              </div>
            </div>
          </div>
        </div>

        <!-- 各科成绩（折叠） -->
        <div class="rounded-2xl bg-white shadow-card border border-gray-100/80 overflow-hidden">
          <button
            class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-brand-orange/5 transition-colors duration-200"
            @click="showScores = !showScores"
          >
            <h2 class="text-base font-semibold text-gray-800">各科成绩（可选）</h2>
            <svg class="w-5 h-5 text-gray-400 transition-transform duration-300" :class="{ 'rotate-180': showScores }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            class="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            :style="{
              maxHeight: showScores ? '500px' : '0px',
              opacity: showScores ? 1 : 0,
              transform: showScores ? 'translateY(0)' : 'translateY(-8px)'
            }"
          >
            <div class="px-6 pb-6 pt-1">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">语文</label>
                  <el-input-number v-model="form.scoreChinese" :min="0" :max="150" class="w-full" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">数学</label>
                  <el-input-number v-model="form.scoreMath" :min="0" :max="150" class="w-full" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">外语</label>
                  <el-input-number v-model="form.scoreEnglish" :min="0" :max="150" class="w-full" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">外语语种</label>
                  <el-select v-model="form.foreignLanguage" placeholder="选择语种" clearable class="w-full">
                    <el-option v-for="opt in foreignLanguageOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                  </el-select>
                </div>
                <div v-for="sub in electiveSubjects" :key="sub.field">
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{ sub.name }}</label>
                  <el-input-number v-model="form[sub.field]" :min="0" :max="100" class="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 身体条件（折叠·卡片式） -->
        <div class="rounded-2xl bg-white shadow-card border border-gray-100/80 overflow-hidden">
          <button
            class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-brand-orange/5 transition-colors duration-200"
            @click="showBodyCondition = !showBodyCondition"
          >
            <h2 class="text-base font-semibold text-gray-800">身体条件（可选）</h2>
            <svg class="w-5 h-5 text-gray-400 transition-transform duration-300" :class="{ 'rotate-180': showBodyCondition }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            class="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            :style="{
              maxHeight: showBodyCondition ? '800px' : '0px',
              opacity: showBodyCondition ? 1 : 0,
              transform: showBodyCondition ? 'translateY(0)' : 'translateY(-8px)'
            }"
          >
            <div class="px-6 pb-6 pt-1">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- 开关类条件 -->
                <div class="flex items-center justify-between rounded-2xl bg-brand-orange/5 px-4 py-3.5">
                  <span class="text-sm text-gray-700">是否色盲</span>
                  <el-switch v-model="form.isColorBlind" />
                </div>
                <div class="flex items-center justify-between rounded-2xl bg-brand-orange/5 px-4 py-3.5">
                  <span class="text-sm text-gray-700">是否色弱</span>
                  <el-switch v-model="form.isColorWeak" />
                </div>
                <div class="flex items-center justify-between rounded-2xl bg-brand-orange/5 px-4 py-3.5">
                  <span class="text-sm text-gray-700">是否嗅觉迟钝</span>
                  <el-switch v-model="form.hasSmellDisorder" />
                </div>
                <div class="flex items-center justify-between rounded-2xl bg-brand-orange/5 px-4 py-3.5">
                  <span class="text-sm text-gray-700">是否左利手</span>
                  <el-switch v-model="form.isLeftHanded" />
                </div>
                <div class="flex items-center justify-between rounded-2xl bg-brand-orange/5 px-4 py-3.5">
                  <span class="text-sm text-gray-700">是否有纹身</span>
                  <el-switch v-model="form.hasTattoo" />
                </div>
                <div class="flex items-center justify-between rounded-2xl bg-brand-orange/5 px-4 py-3.5">
                  <span class="text-sm text-gray-700">是否有面部疤痕</span>
                  <el-switch v-model="form.hasScar" />
                </div>
                <div class="flex items-center justify-between rounded-2xl bg-brand-orange/5 px-4 py-3.5">
                  <span class="text-sm text-gray-700">是否口吃</span>
                  <el-switch v-model="form.hasStutter" />
                </div>
                <!-- 数值类条件 -->
                <div class="rounded-2xl bg-brand-orange/5 px-4 py-3.5">
                  <label class="block text-sm text-gray-700 mb-1.5">左眼视力</label>
                  <el-input-number v-model="form.visionLeft" :min="0" :max="5.5" :step="0.1" size="small" class="w-full" />
                </div>
                <div class="rounded-2xl bg-brand-orange/5 px-4 py-3.5">
                  <label class="block text-sm text-gray-700 mb-1.5">右眼视力</label>
                  <el-input-number v-model="form.visionRight" :min="0" :max="5.5" :step="0.1" size="small" class="w-full" />
                </div>
                <div class="rounded-2xl bg-brand-orange/5 px-4 py-3.5">
                  <label class="block text-sm text-gray-700 mb-1.5">身高（cm）</label>
                  <el-input-number v-model="form.heightCm" :min="100" :max="250" size="small" class="w-full" />
                </div>
                <div class="rounded-2xl bg-brand-orange/5 px-4 py-3.5">
                  <label class="block text-sm text-gray-700 mb-1.5">体重（kg）</label>
                  <el-input-number v-model="form.weightKg" :min="20" :max="200" :step="0.1" size="small" class="w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 身份条件（折叠·卡片式） -->
        <div class="rounded-2xl bg-white shadow-card border border-gray-100/80 overflow-hidden">
          <button
            class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-brand-orange/5 transition-colors duration-200"
            @click="showIdentityCondition = !showIdentityCondition"
          >
            <h2 class="text-base font-semibold text-gray-800">身份条件（可选）</h2>
            <svg class="w-5 h-5 text-gray-400 transition-transform duration-300" :class="{ 'rotate-180': showIdentityCondition }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            class="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            :style="{
              maxHeight: showIdentityCondition ? '400px' : '0px',
              opacity: showIdentityCondition ? 1 : 0,
              transform: showIdentityCondition ? 'translateY(0)' : 'translateY(-8px)'
            }"
          >
            <div class="px-6 pb-6 pt-1">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="flex items-center justify-between rounded-2xl bg-brand-orange/5 px-4 py-3.5">
                  <span class="text-sm text-gray-700">是否应届生</span>
                  <el-switch v-model="form.isFreshGraduate" />
                </div>
                <div class="flex items-center justify-between rounded-2xl bg-brand-orange/5 px-4 py-3.5">
                  <span class="text-sm text-gray-700">是否贫困县户籍</span>
                  <el-switch v-model="form.isPovertyCounty" />
                </div>
                <div class="rounded-2xl bg-brand-orange/5 px-4 py-3.5">
                  <label class="block text-sm text-gray-700 mb-1.5">政治面貌</label>
                  <el-select v-model="form.politicalStatus" placeholder="选择政治面貌" clearable size="small" class="w-full">
                    <el-option v-for="opt in politicalStatusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                  </el-select>
                </div>
                <div class="rounded-2xl bg-brand-orange/5 px-4 py-3.5">
                  <label class="block text-sm text-gray-700 mb-1.5">户籍类型</label>
                  <el-select v-model="form.householdType" placeholder="选择户籍类型" clearable size="small" class="w-full">
                    <el-option v-for="opt in householdTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                  </el-select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <button
          class="btn-brand w-full py-3.5 text-base"
          :disabled="saving"
          @click="handleSave"
        >
          {{ saving ? '保存中...' : '保存档案信息' }}
        </button>

        <!-- 档案保存成功后生成的报志愿入口 -->
        <div
          v-if="saved"
          class="rounded-2xl border border-brand-orange/20 bg-gradient-to-r from-brand-orange/5 to-brand-orange-light/5 p-6"
        >
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 class="text-base font-bold text-gray-800">档案已就绪</h3>
              </div>
              <p class="mt-1.5 text-sm text-gray-500">
                系统已按你的档案匹配报考条件，现在可以开始挑选专业组、生成志愿表
              </p>
            </div>
            <div class="flex shrink-0 gap-3">
              <button
                class="btn-secondary px-5 py-2.5 text-sm"
                @click="goPlans"
              >
                我的志愿表
              </button>
              <button
                class="btn-brand px-6 py-2.5 text-sm"
                @click="goWishPlan"
              >
                进入报志愿 →
              </button>
</div>
        </div>

        <!-- 约束匹配结果 -->
        <div v-if="saved" class="rounded-2xl bg-white p-6 shadow-card border border-gray-100/80">
          <h2 class="text-base font-semibold text-gray-800 mb-4">约束匹配结果</h2>
          <div v-if="constraintLoading" class="flex items-center justify-center py-8 gap-2">
            <div class="w-2 h-2 rounded-full bg-brand-orange animate-bounce" style="animation-delay: 0ms" />
            <div class="w-2 h-2 rounded-full bg-brand-orange animate-bounce" style="animation-delay: 150ms" />
            <div class="w-2 h-2 rounded-full bg-brand-orange animate-bounce" style="animation-delay: 300ms" />
          </div>
          <ConstraintDisplay v-else :constraints="constraintList" />
        </div>
        </div>
        </div>

      <!-- 右侧：Lottie 动画 + 填报流程（≥1024px 显示） -->
      <div class="hidden lg:block lg:w-[420px] shrink-0">
        <div class="sticky top-8 space-y-6">
          <!-- Lottie 动画卡片：橙色渐变底 -->
          <div class="rounded-2xl bg-gradient-to-br from-brand-orange/10 via-brand-orange/5 to-brand-orange-light/10 p-8 flex flex-col items-center shadow-card">
            <LottiePlayer
              path="/lottiefiles/GaoKao-Achieve.json"
              :loop="true"
              :autoplay="true"
              class="w-full max-w-[360px] aspect-square"
            />
            <p class="mt-4 text-sm text-brand-orange font-medium">高考志愿填报助手</p>
          </div>

          <!-- 四步流程卡片 -->
          <div class="rounded-2xl bg-white p-6 shadow-card border border-gray-100/80">
            <h3 class="text-sm font-semibold text-gray-800 mb-4">填报流程</h3>
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-brand-orange to-brand-orange-light flex items-center justify-center text-xs font-bold text-white">1</div>
                <div>
                  <p class="text-sm font-medium text-gray-800">填写档案信息</p>
                  <p class="text-xs text-gray-400 mt-0.5">录入高考成绩、科目、身体条件等基本信息</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-brand-orange to-brand-orange-light flex items-center justify-center text-xs font-bold text-white">2</div>
                <div>
                  <p class="text-sm font-medium text-gray-800">匹配报考约束</p>
                  <p class="text-xs text-gray-400 mt-0.5">系统自动识别身体、身份等限制条件</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-brand-orange to-brand-orange-light flex items-center justify-center text-xs font-bold text-white">3</div>
                <div>
                  <p class="text-sm font-medium text-gray-800">选择专业组</p>
                  <p class="text-xs text-gray-400 mt-0.5">浏览匹配的专业组，查看历年录取数据</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-brand-orange to-brand-orange-light flex items-center justify-center text-xs font-bold text-white">4</div>
                <div>
                  <p class="text-sm font-medium text-gray-800">生成志愿表</p>
                  <p class="text-xs text-gray-400 mt-0.5">智能排序并导出志愿填报方案</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
  </div>
</template>
