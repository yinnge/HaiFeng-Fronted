<script setup lang="ts">
// apps/user/src/components/gaokao/ArchiveDialog.vue
// 高考档案填写弹窗：省份/年份/总分/选科/位次(自动查可改)/批次(自动带省控线)
// 无普通类·艺术类之分；不展示改革模式文案，按模式直接渲染选科控件。
// 「模拟填报」= 校验并保存（登录入库 / 游客存 localStorage）后跳转专业组查询；
// 「制定方案」= AI 生成 PDF，功能暂未上线，占位提示。
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ProvinceOptions } from '@haifeng/shared'
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

// 按已有档案的分数字段推导已选科目并回填
function restoreSubjects(data: GaokaoArchiveVO | GaokaoArchiveForm) {
  const selected = ALL_SUBJECT_FIELDS.filter((s) => data[s.field] != null).map((s) => s.name)
  const model = reformModel.value?.reformModel
  if (model === '3+1+2') {
    secondSubjects.value = selected.filter((s) => s !== form.subjectType)
  } else if (model === '3+3') {
    firstSubjects.value = selected
  } else if (form.subjectType === '物理' || form.subjectType === '历史') {
    secondSubjects.value = selected.filter((s) => s !== form.subjectType)
  } else if (selected.length > 0) {
    firstSubjects.value = selected
  }
}

// ===== 打开弹窗：回填 initialForm =====
watch(
  () => props.visible,
  (visible) => {
    if (!visible) return
    const init = props.initialForm
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
        gaokaoProvince: '',
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
    title="请填写您的高考信息"
    width="640px"
    top="6vh"
    class="archive-dialog"
    :close-on-click-modal="false"
    @close="emit('update:visible', false)"
  >
    <div class="archive-form">
      <!-- 省份 / 年份 -->
      <div class="form-grid">
        <div class="form-item">
          <label class="form-label">高考省份</label>
          <el-select v-model="form.gaokaoProvince" placeholder="选择省份" filterable class="w-full">
            <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
        <div class="form-item">
          <label class="form-label">高考年份</label>
          <el-select v-model="form.gaokaoYear" placeholder="选择年份" class="w-full">
            <el-option v-for="y in yearOptions" :key="y" :label="`${y}年`" :value="y" />
          </el-select>
        </div>
      </div>

      <!-- 高考科目（按改革模式直接渲染，不展示模式文案） -->
      <div class="form-item">
        <label class="form-label">高考科目</label>
        <div v-if="!form.gaokaoProvince || !form.gaokaoYear" class="subject-placeholder">请先选择省份和年份</div>
        <div v-else-if="modelLoading" class="subject-placeholder">正在获取科目配置…</div>
        <div v-else-if="!modelType" class="subject-placeholder subject-placeholder-warn">
          该省份暂未配置高考改革模式，无法选择科目
        </div>
        <div v-else class="space-y-3">
          <!-- 传统文理 -->
          <el-radio-group v-if="modelType === '传统文理'" v-model="form.subjectType">
            <el-radio-button value="文科">文科</el-radio-button>
            <el-radio-button value="理科">理科</el-radio-button>
          </el-radio-group>

          <!-- 3+1+2 -->
          <div v-else-if="modelType === '3+1+2'" class="space-y-3">
            <div>
              <p class="subject-sub-label">首选科目</p>
              <el-radio-group v-model="form.subjectType">
                <el-radio-button v-for="sub in reformModel!.subjects.first" :key="sub" :value="sub">{{ sub }}</el-radio-button>
              </el-radio-group>
            </div>
            <div>
              <p class="subject-sub-label">再选科目（选择2个）</p>
              <el-checkbox-group v-model="secondSubjects" :max="2">
                <el-checkbox v-for="sub in reformModel!.subjects.second" :key="sub" :value="sub" :label="sub" />
              </el-checkbox-group>
            </div>
          </div>

          <!-- 3+3 -->
          <div v-else-if="modelType === '3+3'">
            <p class="subject-sub-label">选考科目（选择3个）</p>
            <el-checkbox-group v-model="firstSubjects" :max="3">
              <el-checkbox v-for="sub in reformModel!.subjects.first" :key="sub" :value="sub" :label="sub" />
            </el-checkbox-group>
          </div>
        </div>
      </div>

      <!-- 总分 / 位次 -->
      <div class="form-grid">
        <div class="form-item">
          <label class="form-label">预估分数</label>
          <el-input-number v-model="form.score" :min="0" :max="750" controls-position="right" class="w-full" />
        </div>
        <div class="form-item">
          <label class="form-label">对应位次</label>
          <el-input-number v-model="form.rank" :min="0" controls-position="right" class="w-full" />
        </div>
      </div>
      <p class="form-hint">
        <template v-if="rankDataYear && rankDataYear !== form.gaokaoYear">
          位次数据基于 <b>{{ rankDataYear }}</b> 年（当年暂无，自动取最近年份），可手动输入
        </template>
        <template v-else>填完分数后系统自动查位次，可手动修改</template>
      </p>

      <!-- 填报批次 -->
      <div class="form-item">
        <label class="form-label">填报批次</label>
        <el-select v-model="form.batch" placeholder="选择批次" :disabled="!batchList.length" class="w-full">
          <el-option v-for="b in batchList" :key="b.batch" :label="b.batch" :value="b.batch" />
        </el-select>
        <p v-if="!form.subjectType" class="form-hint">选择科目后自动加载可选批次</p>
        <p v-else-if="batchLoading" class="form-hint">正在查询批次线…</p>
        <p v-else-if="!batchList.length" class="form-hint">未查到该省份/科类的批次线数据，请确认分数表是否有对应记录</p>
        <p v-if="form.batch && form.batchLineScore" class="form-hint">
          {{ form.batch }}省控线：<b class="text-brand-orange-dark">{{ form.batchLineScore }} 分</b>
          <span v-if="form.batchDataYear">（{{ form.batchDataYear }}年）</span>
        </p>
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
.archive-dialog :deep(.el-dialog) {
  border-radius: 16px;
}

.archive-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.archive-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.archive-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 62vh;
  overflow-y: auto;
}

.archive-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

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
  font-size: 13px;
  font-weight: 600;
  color: #374151;
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
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.plan-btn,
.mock-btn {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 28px;
  border-radius: 14px;
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
