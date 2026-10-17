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
    title="请填写您的高考信息"
    width="640px"
    top="6vh"
    class="archive-dialog"
    append-to-body
    :close-on-click-modal="false"
    @close="emit('update:visible', false)"
  >
    <div class="archive-form">
      <!-- 省份 / 年份 -->
      <div class="form-grid">
        <div class="form-item">
          <label class="form-label">高考省份</label>
          <ProvincePicker v-model="form.gaokaoProvince" variant="form" placeholder="北京" />
        </div>
        <div class="form-item">
          <label class="form-label">高考年份</label>
          <el-select v-model="form.gaokaoYear" placeholder="选择年份" class="form-select" popper-class="orange-select-popper">
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

          <!-- 3+1+2 -->
          <div v-else-if="modelType === '3+1+2'" class="space-y-3">
            <div>
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
            <div>
              <p class="subject-sub-label">再选科目（选择2个）</p>
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
          <label class="form-label">预估分数</label>
          <el-input-number v-model="form.score" :min="0" :max="750" :controls="false" class="form-number" />
        </div>
        <div class="form-item">
          <label class="form-label">对应位次</label>
          <el-input-number v-model="form.rank" :min="0" :controls="false" class="form-number" />
        </div>
      </div>
      <p class="form-hint">
        <template v-if="rankDataYear && rankDataYear !== form.gaokaoYear">
          位次数据基于 <b>{{ rankDataYear }}</b> 年（当年暂无，自动取最近年份），可手动输入
        </template>
        <template v-else>填完分数后系统自动查位次，可手动修改</template>
      </p>

      <!-- 填报批次：选择框变窄，右侧显示省控线 -->
      <div class="form-item">
        <label class="form-label">填报批次</label>
        <div class="batch-row">
          <el-select v-model="form.batch" placeholder="选择批次" :disabled="!batchList.length" class="batch-select" popper-class="orange-select-popper">
            <el-option v-for="b in batchList" :key="b.batch" :label="b.batch" :value="b.batch" />
          </el-select>
          <p v-if="form.batch && form.batchLineScore" class="batch-line">
            {{ form.batch }}省控线：<b class="batch-line-score">{{ form.batchLineScore }} 分</b>
            <span v-if="form.batchDataYear">（{{ form.batchDataYear }}年）</span>
          </p>
          <p v-else-if="batchLoading" class="batch-line batch-line-muted">正在查询批次线…</p>
        </div>
        <p v-if="!form.subjectType" class="form-hint">选择科目后自动加载可选批次</p>
        <p v-else-if="!batchLoading && !batchList.length" class="form-hint">未查到该省份/科类的批次线数据，请确认分数表是否有对应记录</p>
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
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}

/* 年份下拉：变窄（高度/配色见非 scoped 块的 EP 内部样式） */
.form-select {
  width: 100%;
  max-width: 220px;
}

/* 分数/位次数字输入：变窄（高度/配色见非 scoped 块） */
.form-number {
  width: 100%;
  max-width: 220px;
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

/* ===== 科目橙色按钮（替代 radio/checkbox 原生控件，无圆圈/方框） ===== */
.subject-btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.subject-btn {
  min-width: 88px;
  padding: 10px 20px;
  background: #fff7ed;
  border: 1px solid rgba(249, 115, 22, 0.35);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #9a3412;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.subject-btn:hover {
  border-color: #f97316;
  background: #ffedd5;
  transform: translateY(-1px);
}

.subject-btn:active {
  transform: scale(0.97);
}

/* 选中：浅橙背景 + #C2410C 文字 + 橙边（与省份面板一致） */
.subject-btn.is-selected,
.subject-btn.is-selected:hover {
  background: #ffedd5;
  border-color: #f97316;
  color: #c2410c;
  box-shadow: 0 0 0 1px #f97316 inset;
}

/* ===== 填报批次行：选择框靠左，省控线推到最右对齐 ===== */
.batch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.batch-select {
  width: 200px;
  flex-shrink: 0;
}

.batch-line {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
}

.batch-line-score {
  color: #c2410c;
  font-weight: 700;
}

.batch-line-muted {
  color: #9ca3af;
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

<style>
/* 弹窗壳样式：非 scoped（append-to-body 传送后 scoped :deep() 失效）。
   .archive-dialog 仅本组件使用，全局声明无泄漏风险。 */
/* class 可能落在 .el-dialog 本体或外层包裹（随 EP 版本），两种形态都覆盖 */
.archive-dialog.el-dialog,
.archive-dialog .el-dialog {
  border-radius: 16px;
  /* 整弹窗暖色渐变底（不再是只有头部一块橙 + 白身子） */
  background: linear-gradient(180deg, #fff7ed 0%, #ffffff 46%);
  overflow: hidden;
}

/* 头部：无分隔线、无独立橙块，标题用品牌渐变艺术字 */
.archive-dialog .el-dialog__header {
  border-bottom: none;
  background: transparent !important;
  padding: 24px 24px 10px;
  margin: 0;
  text-align: center;
}

.archive-dialog .el-dialog__title {
  display: inline-block;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.04em;
  background: linear-gradient(120deg, #9a3412 0%, #c2410c 30%, #f97316 62%, #fb923c 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
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
  min-height: 44px;
  border-radius: 12px;
  background: #fff7ed;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.45) inset;
  font-size: 14px;
  font-weight: 500;
  color: #9a3412;
  padding: 4px 12px;
}

.archive-dialog .el-select__wrapper.is-hovering,
.archive-dialog .el-select__wrapper.is-focused {
  box-shadow: 0 0 0 1.5px #f97316 inset;
}

.archive-dialog .el-select__placeholder {
  color: #b45309;
}

.archive-dialog .el-select__selected-item {
  color: #9a3412;
}

/* 年份 / 批次下拉：选中文字居中 */
.archive-dialog .form-select .el-select__selection,
.archive-dialog .batch-select .el-select__selection {
  justify-content: center;
}

.archive-dialog .form-select .el-select__selected-item,
.archive-dialog .batch-select .el-select__selected-item {
  text-align: center;
  width: 100%;
}

/* 分数/位次数字输入：橙色系、加高 */
.archive-dialog .el-input-number {
  height: 44px;
}

.archive-dialog .el-input-number .el-input__wrapper {
  border-radius: 12px;
  background: #fff7ed;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.45) inset;
  height: 44px;
}

.archive-dialog .el-input-number .el-input__wrapper.is-focus,
.archive-dialog .el-input-number .el-input__wrapper:hover {
  box-shadow: 0 0 0 1.5px #f97316 inset;
}

.archive-dialog .el-input-number .el-input__inner {
  color: #9a3412;
  font-weight: 600;
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
