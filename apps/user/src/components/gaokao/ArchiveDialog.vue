<script setup lang="ts">
// apps/user/src/components/gaokao/ArchiveDialog.vue
// 高考档案填写弹窗：省份/年份/总分/选科/位次(自动查可改)/批次(自动带省控线)
// 无普通类·艺术类之分；不展示改革模式文案，按模式直接渲染选科控件。
// 「模拟填报」= 校验并保存（登录入库 / 游客存 localStorage）后跳转专业组查询；
// 「制定方案」= AI 生成 PDF，功能暂未上线，占位提示。
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getReformModel,
  getRank,
  getBatchLines,
  getGaokaoYears,
  type ReformModelData,
  type BatchLine,
  type GaokaoArchiveForm,
  type GaokaoArchiveVO,
} from '@/api/gaokao'
import { saveArchiveSmart } from '@/utils/gaokaoArchive'
import ProvincePicker from './ProvincePicker.vue'
import bgImg from '@/assets/img_1.png'

// 弹窗背景：顶部铺暖色插画（img_1.png，1672×941 横图，100% 宽约 360px 高），
// 向下用渐变 veil 渐隐融入暖白画布，表单区域近纯色保证可读性。
const dialogBgStyle = computed(() => ({
  backgroundImage: [
    // 顶部插画从上到下渐隐的 veil（0~380px，之后全遮，露出下方渐变）
    'linear-gradient(180deg, rgba(255,251,247,0.06) 0px, rgba(255,251,247,0.55) 140px, rgba(255,253,251,0.93) 270px, #fffdfb 380px)',
    `url(${bgImg})`,
    // 兜底暖色光晕（图片加载失败时也有底色）
    'radial-gradient(120% 55% at 50% -12%, #fff7ed 0%, rgba(255,247,237,0) 58%)',
    'linear-gradient(180deg, #ffffff 0%, #fffdfb 100%)',
  ].join(', '),
  backgroundSize: 'auto, 100% auto, auto, auto',
  backgroundPosition: '0 0, center top, 0 0, 0 0',
  backgroundRepeat: 'no-repeat, no-repeat, no-repeat, no-repeat',
}))

const props = defineProps<{
  visible: boolean
  /** 打开弹窗时回填的档案（服务端档案或游客本地档案），可为 null */
  initialForm: GaokaoArchiveVO | GaokaoArchiveForm | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  /** 模拟填报保存成功（已入库或已存本地），携带最终表单 */
  (e: 'saved', form: GaokaoArchiveForm): void
}>()

// ===== 表单 =====
const form = reactive<GaokaoArchiveForm>({
  gaokaoYear: new Date().getFullYear(),
  gaokaoProvince: '',
  score: 0,
  rank: 0,
  subjectType: '',
  secondSubjectType: undefined,
  thirdSubjectType: undefined,
  batch: '',
  batchDataYear: new Date().getFullYear(),
  batchLineScore: 0,
})

// ===== 改革模式 / 批次线 =====
const reformModel = ref<ReformModelData | null>(null)
const modelLoading = ref(false)
const batchList = ref<BatchLine[]>([])
const batchLoading = ref(false)

/**
 * 归一化改革模式：3+3 / 3+1+2 / 传统文理；null=该省份未配置（后端查不到时
 * 会返回 reformModel=null 的 VO，若不归一化三个分支都不渲染，科目区直接空白）
 */
const modelType = computed(() => {
  const m = reformModel.value?.reformModel
  return m === '3+3' || m === '3+1+2' || m === '传统文理' ? m : null
})

// checkbox-group 绑定
const secondSubjects = ref<string[]>([]) // 3+1+2 再选
const firstSubjects = ref<string[]>([])  // 3+3 选考

// 位次数据来源年份（当年无数据自动回溯时提示）
const rankDataYear = ref<number | null>(null)

// ===== 年份选项（后端 /years，失败回退本地最近5年） =====
const yearOptions = ref<number[]>([])

function buildLocalYears(): number[] {
  const current = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => current - 4 + i)
}

async function loadYears() {
  try {
    const res = await getGaokaoYears()
    const years = (Array.isArray(res.data.data) ? res.data.data : [])
      .filter((y: number) => Number.isFinite(y))
      .sort((a: number, b: number) => a - b)
      .filter((y: number) => y >= new Date().getFullYear() - 5 && y <= new Date().getFullYear() + 1)
    yearOptions.value = years.length ? years : buildLocalYears()
  } catch {
    yearOptions.value = buildLocalYears()
  }
}

// ===== 科类转换（后端 rank/batch 接口用 物理类/历史类/文科/理科） =====
function getSubjectTypeForAPI(subject: string): string {
  if (subject === '物理') return '物理类'
  if (subject === '历史') return '历史类'
  return subject
}

// ===== 回显机制：打开弹窗回填已有档案时，等改革模式加载完再回填科目 =====
let restoringData: GaokaoArchiveVO | GaokaoArchiveForm | null = null

watch(
  () => [form.gaokaoProvince, form.gaokaoYear] as const,
  async ([province, year]) => {
    if (!province || !year) return
    modelLoading.value = true
    try {
      const res = await getReformModel({ province, year })
      reformModel.value = res.data.data
      if (restoringData) {
        restoreSubjects(restoringData)
        restoringData = null
      } else {
        resetSubjects()
      }
      if (!modelType.value) {
        ElMessage.warning(`${province}暂未配置高考改革模式，暂时无法选择科目`)
      }
    } catch (e: any) {
      restoringData = null
      reformModel.value = null
      ElMessage.error(e?.message || '获取改革模式失败')
    } finally {
      modelLoading.value = false
    }
  },
)

// ===== 位次：省/年/科类/分数变化后自动查询（防抖 500ms），可手动修改 =====
let rankTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => [form.gaokaoProvince, form.gaokaoYear, form.subjectType, form.score] as const,
  ([province, year, subjectType, score]) => {
    if (rankTimer) clearTimeout(rankTimer)
    rankDataYear.value = null
    if (!province || !year || !subjectType || !score) return
    rankTimer = setTimeout(async () => {
      try {
        const res = await getRank({
          province,
          year,
          subjectType: getSubjectTypeForAPI(subjectType),
          score,
        })
        if (res.data.data) {
          form.rank = res.data.data.rank
          rankDataYear.value = res.data.data.dataYear ?? null
        }
      } catch {
        // 位次查询失败静默，用户可手填
      }
    }, 500)
  },
)

// ===== 批次线：省/年/科类变化自动查询 =====
watch(
  () => [form.gaokaoProvince, form.gaokaoYear, form.subjectType] as const,
  async ([province, year, subjectType]) => {
    if (!province || !year || !subjectType) return
    batchLoading.value = true
    try {
      const res = await getBatchLines({
        province,
        year,
        subjectType: getSubjectTypeForAPI(subjectType),
      })
      batchList.value = res.data.data?.batches || []
      form.batchDataYear = res.data.data?.dataYear || year
    } catch (e: any) {
      batchList.value = []
      ElMessage.warning(e?.message || '批次线查询失败，请稍后重试')
    } finally {
      batchLoading.value = false
    }
  },
)

// 批次变化自动带出省控线
watch(
  () => form.batch,
  (batch) => {
    const found = batchList.value.find((b) => b.batch === batch)
    if (found) form.batchLineScore = found.scoreLine
  },
)

// ===== 科目联动清理 =====
watch(secondSubjects, (vals, oldVals) => {
  oldVals?.forEach((name) => {
    if (!vals.includes(name)) clearSubjectScore(name)
  })
})

watch(firstSubjects, (vals, oldVals) => {
  form.subjectType = vals[0] || ''
  oldVals?.forEach((name) => {
    if (!vals.includes(name)) clearSubjectScore(name)
  })
})

watch(
  () => form.subjectType,
  (val, oldVal) => {
    if (val === oldVal) return
    if (reformModel.value?.reformModel === '3+1+2' && oldVal) {
      clearSubjectScore(oldVal)
    } else if (reformModel.value?.reformModel === '传统文理') {
      ALL_SUBJECT_FIELDS.forEach(({ field }) => (form[field] = undefined))
    }
  },
)

const ALL_SUBJECT_FIELDS = [
  { name: '物理', field: 'scorePhysics' },
  { name: '化学', field: 'scoreChemistry' },
  { name: '生物', field: 'scoreBiology' },
  { name: '政治', field: 'scorePolitics' },
  { name: '历史', field: 'scoreHistory' },
  { name: '地理', field: 'scoreGeography' },
] as const

type SubjectField = (typeof ALL_SUBJECT_FIELDS)[number]['field']

const subjectFieldMap = new Map<string, SubjectField>(ALL_SUBJECT_FIELDS.map((s) => [s.name, s.field]))

function clearSubjectScore(name: string) {
  const field = subjectFieldMap.get(name)
  if (field) form[field] = undefined
}

function resetSubjects() {
  form.subjectType = ''
  secondSubjects.value = []
  firstSubjects.value = []
  ALL_SUBJECT_FIELDS.forEach(({ field }) => (form[field] = undefined))
}

// ===== 科目按钮 toggle（自定义橙色按钮，替代 radio/checkbox 原生控件） =====
function toggleSecondSubject(name: string) {
  const idx = secondSubjects.value.indexOf(name)
  if (idx >= 0) {
    secondSubjects.value = secondSubjects.value.filter((s) => s !== name)
  } else if (secondSubjects.value.length < 2) {
    secondSubjects.value = [...secondSubjects.value, name]
  } else {
    ElMessage.warning('再选科目最多选择 2 个')
  }
}

function toggleFirstSubject(name: string) {
  const idx = firstSubjects.value.indexOf(name)
  if (idx >= 0) {
    firstSubjects.value = firstSubjects.value.filter((s) => s !== name)
  } else if (firstSubjects.value.length < 3) {
    firstSubjects.value = [...firstSubjects.value, name]
  } else {
    ElMessage.warning('选考科目最多选择 3 个')
  }
}

// 按档案回填已选科目：优先用 second/thirdSubjectType 字段（当前简化表单不采集
// 单科分数，只靠 scorePhysics 等分数字段推导会永远为空 → 再选科目回填丢失）
function restoreSubjects(data: GaokaoArchiveVO | GaokaoArchiveForm) {
  const byScore = ALL_SUBJECT_FIELDS.filter((s) => data[s.field] != null).map((s) => s.name)
  const model = reformModel.value?.reformModel
  if (model === '3+1+2') {
    const seconds = [data.secondSubjectType, data.thirdSubjectType].filter((s): s is string => !!s)
    secondSubjects.value = seconds.length ? seconds : byScore.filter((s) => s !== form.subjectType)
  } else if (model === '3+3') {
    const subs = [form.subjectType, data.secondSubjectType, data.thirdSubjectType].filter((s): s is string => !!s)
    firstSubjects.value = subs.length ? subs : byScore
  } else if (form.subjectType === '物理' || form.subjectType === '历史') {
    secondSubjects.value = byScore.filter((s) => s !== form.subjectType)
  } else if (byScore.length > 0) {
    firstSubjects.value = byScore
  }
}

// ===== 打开弹窗：回填 initialForm =====
// 草稿保留：以「档案对象引用」为基准——同一份档案对象重复打开（引用未变）时
// 保留上次的选择（含未保存的科目草稿）；只有档案被外部更新/保存/换省份
// （displayForm 生成新对象）时才重新回填。
let lastInitSource: GaokaoArchiveVO | GaokaoArchiveForm | null | undefined

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return
    const init = props.initialForm
    if (form.gaokaoProvince && init === lastInitSource) return
    lastInitSource = init
    if (init && init.gaokaoProvince) {
      restoringData = init
      Object.assign(form, {
        gaokaoYear: init.gaokaoYear || new Date().getFullYear(),
        gaokaoProvince: init.gaokaoProvince,
        score: init.score || 0,
        rank: init.rank || 0,
        subjectType: init.subjectType || '',
        secondSubjectType: undefined,
        thirdSubjectType: undefined,
        batch: init.batch || '',
        batchDataYear: init.batchDataYear || init.gaokaoYear || new Date().getFullYear(),
        batchLineScore: init.batchLineScore || 0,
        scorePhysics: init.scorePhysics,
        scoreChemistry: init.scoreChemistry,
        scoreBiology: init.scoreBiology,
        scorePolitics: init.scorePolitics,
        scoreHistory: init.scoreHistory,
        scoreGeography: init.scoreGeography,
      })
    } else {
      restoringData = null
      Object.assign(form, {
        gaokaoYear: yearOptions.value.length
          ? yearOptions.value[yearOptions.value.length - 1]
          : new Date().getFullYear(),
        gaokaoProvince: '北京',
        score: 0,
        rank: 0,
        subjectType: '',
        secondSubjectType: undefined,
        thirdSubjectType: undefined,
        batch: '',
        batchDataYear: new Date().getFullYear(),
        batchLineScore: 0,
        scorePhysics: undefined,
        scoreChemistry: undefined,
        scoreBiology: undefined,
        scorePolitics: undefined,
        scoreHistory: undefined,
        scoreGeography: undefined,
      })
      resetSubjects()
      reformModel.value = null
      batchList.value = []
    }
  },
  { immediate: true },
)

// ===== 校验 + 保存 =====
function validate(): boolean {
  if (!form.gaokaoProvince) { ElMessage.warning('请选择高考省份'); return false }
  if (!form.gaokaoYear) { ElMessage.warning('请选择高考年份'); return false }
  if (!form.score || form.score <= 0 || form.score > 750) { ElMessage.warning('请填写正确的高考总分'); return false }
  if (!form.subjectType) { ElMessage.warning('请选择科目'); return false }
  if (!form.rank || form.rank <= 0) { ElMessage.warning('请填写正确的位次'); return false }
  if (!form.batch) { ElMessage.warning('请选择填报批次'); return false }
  return true
}

/** 组装再选科目（第二/第三科目），供后端选科匹配与查询过滤 */
function buildSubjectTypes() {
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
}

const saving = ref(false)

/** 模拟填报：保存档案（登录入库 / 游客本地）→ 通知父组件跳转查询 */
async function handleMockFill() {
  if (!validate()) return
  saving.value = true
  try {
    buildSubjectTypes()
    const { toServer } = await saveArchiveSmart({ ...form })
    ElMessage.success(toServer ? '档案已保存' : '档案已本地保存（登录后自动同步）')
    emit('saved', { ...form })
  } catch (e: any) {
    ElMessage.error(e?.message || '保存档案失败')
  } finally {
    saving.value = false
  }
}

/** 制定方案：AI 生成专属志愿方案（暂未上线） */
function handleMakePlan() {
  ElMessage.info('「制定方案」功能即将上线，敬请期待')
}

onMounted(() => {
  void loadYears()
})
</script>

<template>
  <el-dialog
    :model-value="visible"
    width="min(580px, calc(100vw - 24px))"
    top="6vh"
    class="archive-dialog"
    append-to-body
    :close-on-click-modal="false"
    :style="dialogBgStyle"
    @close="emit('update:visible', false)"
  >
    <!-- 头部：学士帽徽章 + 标题/副标题（浮于插画背景之上，无分隔线） -->
    <template #header>
      <div class="dlg-head">
        <span class="dlg-head-badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3z" />
            <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
          </svg>
        </span>
        <div class="dlg-head-text">
          <p class="dlg-head-title">请填写您的<span class="dlg-head-hl">高考信息</span></p>
          <p class="dlg-head-sub">完善信息，帮助系统为您推荐更合适的院校和专业</p>
        </div>
      </div>
    </template>
    <div class="archive-form">
      <!-- 省份 / 年份 -->
      <div class="form-grid">
        <div class="form-item">
          <label class="form-label">
            <svg class="form-label-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            高考省份
          </label>
          <ProvincePicker v-model="form.gaokaoProvince" variant="form" placeholder="北京" />
        </div>
        <div class="form-item">
          <label class="form-label">
            <svg class="form-label-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            高考年份
          </label>
          <el-select v-model="form.gaokaoYear" placeholder="选择年份" class="form-select" popper-class="orange-select-popper">
            <template #prefix>
              <svg class="ctl-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </template>
            <el-option v-for="y in yearOptions" :key="y" :label="`${y}年`" :value="y" />
          </el-select>
        </div>
      </div>

      <!-- 高考科目（按改革模式直接渲染，不展示模式文案） -->
      <div class="form-item">
        <label class="form-label">
          <svg class="form-label-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
          高考科目
        </label>
        <div v-if="!form.gaokaoProvince || !form.gaokaoYear" class="subject-placeholder">请先选择省份和年份</div>
        <div v-else-if="modelLoading" class="subject-placeholder">正在获取科目配置…</div>
        <div v-else-if="!modelType" class="subject-placeholder subject-placeholder-warn">
          该省份暂未配置高考改革模式，无法选择科目
        </div>
        <div v-else class="space-y-3">
          <!-- 传统文理 -->
          <div v-if="modelType === '传统文理'" class="subject-btn-group">
            <button
              v-for="s in ['文科', '理科']"
              :key="s"
              type="button"
              class="subject-btn"
              :class="{ 'is-selected': form.subjectType === s }"
              @click="form.subjectType = s"
            >
              {{ s }}
            </button>
          </div>

          <!-- 3+1+2：首选｜再选同一行，避免首选行右侧空白 -->
          <div v-else-if="modelType === '3+1+2'" class="form-grid subject-dual">
            <div class="subj-cell">
              <p class="subject-sub-label">首选科目</p>
              <div class="subject-btn-group">
                <button
                  v-for="sub in reformModel!.subjects.first"
                  :key="sub"
                  type="button"
                  class="subject-btn"
                  :class="{ 'is-selected': form.subjectType === sub }"
                  @click="form.subjectType = sub"
                >
                  {{ sub }}
                </button>
              </div>
            </div>
            <div class="subj-cell">
              <p class="subject-sub-label">再选科目（2个）</p>
              <div class="subject-btn-group">
                <button
                  v-for="sub in reformModel!.subjects.second"
                  :key="sub"
                  type="button"
                  class="subject-btn"
                  :class="{ 'is-selected': secondSubjects.includes(sub) }"
                  @click="toggleSecondSubject(sub)"
                >
                  {{ sub }}
                </button>
              </div>
            </div>
          </div>

          <!-- 3+3 -->
          <div v-else-if="modelType === '3+3'">
            <p class="subject-sub-label">选考科目（选择3个）</p>
            <div class="subject-btn-group">
              <button
                v-for="sub in reformModel!.subjects.first"
                :key="sub"
                type="button"
                class="subject-btn"
                :class="{ 'is-selected': firstSubjects.includes(sub) }"
                @click="toggleFirstSubject(sub)"
              >
                {{ sub }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 总分 / 位次 -->
      <div class="form-grid">
        <div class="form-item">
          <label class="form-label">
            <svg class="form-label-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            预估分数
          </label>
          <el-input-number v-model="form.score" :min="0" :max="750" :controls="false" class="form-number">
            <template #prefix>
              <svg class="ctl-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </template>
            <template #suffix><span class="num-unit">分</span></template>
          </el-input-number>
        </div>
        <div class="form-item">
          <label class="form-label">
            <svg class="form-label-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 3v18h18" />
              <rect x="7" y="10" width="3" height="8" />
              <rect x="12" y="6" width="3" height="12" />
              <rect x="17" y="13" width="3" height="5" />
            </svg>
            对应位次
            <el-tooltip content="填完分数后系统自动查位次，可手动修改" placement="top" effect="dark">
              <svg class="label-tip-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="7.5" x2="12" y2="13" />
                <line x1="12" y1="16.5" x2="12.01" y2="16.5" />
              </svg>
            </el-tooltip>
          </label>
          <el-input-number v-model="form.rank" :min="0" :controls="false" class="form-number rank-number">
            <template #prefix>
              <svg class="ctl-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 3v18h18" />
                <rect x="7" y="10" width="3" height="8" />
                <rect x="12" y="6" width="3" height="12" />
                <rect x="17" y="13" width="3" height="5" />
              </svg>
            </template>
            <template #suffix><span class="num-unit">名</span></template>
          </el-input-number>
        </div>
      </div>
      <!-- 位次数据回溯年份提示（自动查位次的说明已移入「对应位次」label 的 tooltip 图标） -->
      <p v-if="rankDataYear && rankDataYear !== form.gaokaoYear" class="form-hint">
        位次数据基于 <b>{{ rankDataYear }}</b> 年（当年暂无，自动取最近年份），可手动输入
      </p>

      <!-- 填报批次：省控线以淡色小字显示在标签 tip 图标右侧（查到批次线数据时动态显示） -->
      <div class="form-item">
        <label class="form-label">
          <svg class="form-label-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
          填报批次
          <el-tooltip content="选择科目后自动加载可选批次" placement="top" effect="dark">
            <svg class="label-tip-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="7.5" x2="12" y2="13" />
              <line x1="12" y1="16.5" x2="12.01" y2="16.5" />
            </svg>
          </el-tooltip>
          <span v-if="form.batch && form.batchLineScore" class="batch-line-inline">
            {{ form.batch }}省控线：<b class="batch-score">{{ form.batchLineScore }} 分</b>（{{ form.batchDataYear }}年）
          </span>
        </label>
        <el-select v-model="form.batch" placeholder="选择批次" :disabled="!batchList.length" class="batch-select" popper-class="orange-select-popper">
          <template #prefix>
            <svg class="ctl-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </template>
          <el-option v-for="b in batchList" :key="b.batch" :label="b.batch" :value="b.batch" />
        </el-select>
        <p v-if="!batchLoading && batchList.length === 0 && form.subjectType" class="form-hint">未查到该省份/科类的批次线数据，请确认分数表是否有对应记录</p>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="plan-btn" @click="handleMakePlan">
          制定方案
          <span class="plan-sub">一键生成专属志愿</span>
        </button>
        <button type="button" class="mock-btn" :disabled="saving" @click="handleMockFill">
          {{ saving ? '保存中…' : '模拟填报' }}
          <span class="mock-sub">自选冲稳保院校</span>
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
/* 注意：弹窗壳（.el-dialog）经 append-to-body 传送到 body 后，
   scoped :deep() 对其失效（同 RechargeDialog 的坑），
   壳样式已提至下方非 scoped 块；这里只保留表单内容样式。 */
.archive-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.form-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}

/* 字段标签前的线性 SVG 图标（橙色） */
.form-label-ico {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  color: #f97316;
}

/* 标签右侧「圆圈感叹号」提示图标（hover 出 tooltip） */
.label-tip-ico {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: #fdba74;
  cursor: help;
  transition: color 0.2s ease;
}

.label-tip-ico:hover {
  color: #ea580c;
}

/* ===== 弹窗头部（#header 槽）：学士帽徽章 + 标题/副标题，浮于插画背景之上 ===== */
.dlg-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-right: 40px; /* 给右上角关闭按钮留位 */
}

.dlg-head-badge {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), #ffedd5);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.18);
}

.dlg-head-badge svg {
  width: 28px;
  height: 28px;
  color: #33507a; /* 学士帽藏青 */
}

.dlg-head-text {
  min-width: 0;
}

.dlg-head-title {
  margin: 0;
  font-size: 23px;
  font-weight: 900;
  letter-spacing: 0.03em;
  color: #44403c;
  line-height: 1.3;
}

/* 「高考信息」四字橙色渐变高亮 */
.dlg-head-hl {
  background: linear-gradient(120deg, #c2410c 0%, #f97316 60%, #fb923c 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.dlg-head-sub {
  margin: 3px 0 0;
  font-size: 13px;
  color: #a8a29e;
  line-height: 1.5;
}

/* 选项框内前缀 SVG 图标（省份/年份/分数/位次/批次，与标签图标同款） */
.ctl-ico {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  color: #f97316;
}

/* 年份下拉：变窄（高度/配色见非 scoped 块的 EP 内部样式） */
.form-select {
  width: 100%;
  max-width: 220px;
}

/* 分数/位次数字输入：变窄（高度/配色见非 scoped 块） */
.form-number {
  width: 100%;
  max-width: 160px;
}

/* 对应位次：整体左移 60px，贴拢预估分数（右侧让出留白） */
.rank-number {
  margin-left: -60px;
}

.form-hint {
  margin: -6px 0 0;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.6;
}

.subject-placeholder {
  padding: 14px 0;
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
  background: #f9fafb;
  border-radius: 10px;
}

.subject-placeholder-warn {
  color: #c2410c;
  background: #fff7ed;
  border: 1px dashed rgba(249, 115, 22, 0.4);
}

.subject-sub-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

/* ===== 科目按钮（替代 radio/checkbox 原生控件，无圆圈/方框） ===== */
.subject-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.subject-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-width: 88px;
  padding: 10px 18px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.subject-btn:hover {
  border-color: #fdba74;
  background: #fff7ed;
  color: #c2410c;
  transform: translateY(-1px);
}

.subject-btn:active {
  transform: scale(0.97);
}

/* 选中：中性灰→浅橙填充 + 橙描边 + ✓ + 加粗，对比拉满 */
.subject-btn.is-selected,
.subject-btn.is-selected:hover {
  background: #ffedd5;
  border: 1.5px solid #f97316;
  color: #c2410c;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.18);
  transform: none;
}

.subject-btn.is-selected::before {
  content: "✓";
  font-size: 13px;
  font-weight: 900;
  line-height: 1;
  color: #f97316;
}

/* ===== 填报批次网格：批次选择框占左、省控线信息卡占右（右列左缘对齐对应位次） ===== */
.subject-dual {
  align-items: start;
}

.batch-select {
  width: 100%;
  max-width: 220px;
}

/* 省控线淡色小字：标签 tip 图标右侧，查到批次线数据时动态显示 */
.batch-line-inline {
  font-size: 13px;
  font-weight: 400;
  color: #6b7280;
  white-space: nowrap;
  margin-left: 2px;
}

/* 省控线数字（如 410 分）橙红色高亮 */
.batch-line-inline .batch-score {
  color: #c2410c;
  font-weight: 700;
}

.dialog-footer {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
}

.plan-btn,
.mock-btn {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 9px 22px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  line-height: 1.2;
}

.plan-btn {
  background: #fff7ed;
  color: #c2410c;
  border: 1px solid rgba(249, 115, 22, 0.4);
}

.plan-btn:hover {
  background: #ffedd5;
  transform: translateY(-1px);
}

.plan-sub,
.mock-sub {
  font-size: 11px;
  font-weight: 400;
  opacity: 0.75;
}

.mock-btn {
  background: linear-gradient(135deg, #f97316, #fb923c);
  color: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35);
}

.mock-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.45);
}

.mock-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>

<style>
/* 弹窗壳样式：非 scoped（append-to-body 传送后 scoped :deep() 失效）。
   .archive-dialog 仅本组件使用，全局声明无泄漏风险。 */
/* class 可能落在 .el-dialog 本体或外层包裹（随 EP 版本），两种形态都覆盖 */
.archive-dialog.el-dialog,
.archive-dialog .el-dialog {
  border-radius: 16px;
  /* 去掉全局 .el-dialog 的上下 3px 突兀橙线：改为四面一致的 1px 柔和橙边 */
  border-top: none !important;
  border-bottom: none !important;
  border-left: 1px solid rgba(249, 115, 22, 0.18);
  border-right: 1px solid rgba(249, 115, 22, 0.18);
  /* 整弹窗柔和暖色渐变底 + 顶部/右下双光晕（不再是只有头部一块橙 + 白身子） */
  background:
    radial-gradient(120% 55% at 50% -12%, #fff7ed 0%, rgba(255, 247, 237, 0) 58%),
    radial-gradient(80% 50% at 100% 100%, rgba(251, 146, 60, 0.1) 0%, rgba(251, 146, 60, 0) 60%),
    linear-gradient(180deg, #ffffff 0%, #fffdfb 100%);
  overflow: hidden;
}

/* 头部：无分隔线、无独立橙块；内容由 #header 槽渲染（徽章+标题+副标题，见 scoped 块） */
.archive-dialog .el-dialog__header {
  border-bottom: none;
  background: transparent !important;
  padding: 22px 24px 10px;
  margin: 0;
}

.archive-dialog .el-dialog__body {
  padding: 24px;
  max-height: 62vh;
  overflow-y: auto;
}

.archive-dialog .el-dialog__footer {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

/* ===== 弹窗内 EP 控件统一橙色风格 =====
   选项框：不要白框，橙色系；高度加高；去掉下拉框右侧箭头 */
.archive-dialog .el-select__suffix,
.archive-dialog .el-select__caret {
  display: none;
}

.archive-dialog .el-select__wrapper {
  box-sizing: border-box;
  height: 44px;
  min-height: 44px;
  flex-wrap: nowrap;
  border-radius: 12px;
  background: #fffaf3;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.4) inset, 0 1px 2px rgba(249, 115, 22, 0.06);
  font-size: 16px;
  font-weight: 500;
  color: #9a3412;
  padding: 0 14px;
  transition: box-shadow 0.2s ease, background 0.2s ease;
}

.archive-dialog .el-select__wrapper.is-hovering,
.archive-dialog .el-select__wrapper.is-focused {
  background: #fff7ed;
  box-shadow: 0 0 0 1.5px #f97316 inset, 0 2px 6px rgba(249, 115, 22, 0.12);
}

.archive-dialog .el-select__placeholder {
  color: #b45309;
}

.archive-dialog .el-select__selected-item {
  color: #9a3412;
}

/* 年份 / 批次下拉：图标紧贴文字、整组居中（与省份按钮一致，Q3 统一）；
   垂直居中修正（position:static 后文字偏低 → 抬高） */
.archive-dialog .form-select .el-select__wrapper,
.archive-dialog .batch-select .el-select__wrapper {
  justify-content: center;
  align-items: center;
}

.archive-dialog .form-select .el-select__selection,
.archive-dialog .batch-select .el-select__selection {
  flex: 0 1 auto;
  justify-content: center;
  align-items: center;
}

.archive-dialog .form-select .el-select__selected-item,
.archive-dialog .batch-select .el-select__selected-item {
  position: static;
  z-index: auto;
  justify-content: center;
  text-align: center;
  align-self: center;
  transform: translateY(-1px);
}

.archive-dialog .el-select__prefix {
  display: inline-flex;
  align-items: center;
  margin-right: 2px;
}

/* 分数/位次数字输入：橙色系、加高 */
.archive-dialog .el-input-number {
  height: 44px;
}

.archive-dialog .el-input-number .el-input__wrapper {
  border-radius: 12px;
  background: #fffaf3;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.4) inset, 0 1px 2px rgba(249, 115, 22, 0.06);
  height: 44px;
  transition: box-shadow 0.2s ease, background 0.2s ease;
}

.archive-dialog .el-input-number .el-input__wrapper.is-focus,
.archive-dialog .el-input-number .el-input__wrapper:hover {
  background: #fff7ed;
  box-shadow: 0 0 0 1.5px #f97316 inset, 0 2px 6px rgba(249, 115, 22, 0.12);
}

.archive-dialog .el-input-number .el-input__inner {
  color: #9a3412;
  font-weight: 600;
}

/* 分数/位次：图标/单位钉在两端，数字居中占满中间（7 位以上位次不省略） */
.archive-dialog .form-number .el-input__inner {
  flex: 1 1 auto;
  min-width: 0;
  width: auto;
  text-align: center;
  font-size: 16px;
}

/* 输入框内右侧单位（分 / 名） */
.archive-dialog .el-input-number .num-unit {
  color: #f97316;
  font-size: 14px;
  font-weight: 700;
  margin-left: 2px;
}

.archive-dialog .el-input__prefix {
  display: inline-flex;
  align-items: center;
  margin-right: 4px;
}

.archive-dialog .el-input-number.is-disabled .el-input__wrapper {
  background: #f5f5f4;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.2) inset;
}

/* 下拉面板（年份/批次）：选中项橙色而非蓝色 */
.orange-select-popper .el-select-dropdown__item.is-selected {
  color: #c2410c;
  font-weight: 700;
}

.orange-select-popper .el-select-dropdown__item.is-hovering {
  background: #fff7ed;
  color: #ea580c;
}
</style>
