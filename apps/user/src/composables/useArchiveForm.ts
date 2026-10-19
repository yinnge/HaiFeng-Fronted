// apps/user/src/composables/useArchiveForm.ts
// 高考档案表单共享逻辑：省份/年份/总分/选科/位次(自动查可改)/批次(自动带省控线)。
// 抽取自 ArchiveDialog，使「首页右侧测算卡片」与「档案弹窗」保存行为完全一致，
// 数据经由 saveArchiveSmart 持久化（登录入库 / 游客 localStorage），两处填写互相同步。
import { reactive, ref, computed, watch } from 'vue'
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

const ALL_SUBJECT_FIELDS = [
  { name: '物理', field: 'scorePhysics' },
  { name: '化学', field: 'scoreChemistry' },
  { name: '生物', field: 'scoreBiology' },
  { name: '政治', field: 'scorePolitics' },
  { name: '历史', field: 'scoreHistory' },
  { name: '地理', field: 'scoreGeography' },
] as const

type SubjectField = (typeof ALL_SUBJECT_FIELDS)[number]['field']

const subjectFieldMap = new Map<string, SubjectField>(
  ALL_SUBJECT_FIELDS.map((s) => [s.name, s.field]),
)

function getSubjectTypeForAPI(subject: string): string {
  if (subject === '物理') return '物理类'
  if (subject === '历史') return '历史类'
  return subject
}

function buildLocalYears(): number[] {
  const current = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => current - 4 + i)
}

function defaultForm(): GaokaoArchiveForm {
  return {
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
  }
}

/**
 * 高考档案表单 composable：组件挂载后调用 loadYears() + initFrom(archive) 接入数据。
 * 返回 form（reactive）与全部联动逻辑；保存统一走 saveArchiveSmart。
 */
export function useArchiveForm() {
  const form = reactive<GaokaoArchiveForm>(defaultForm())

  const reformModel = ref<ReformModelData | null>(null)
  const modelLoading = ref(false)
  const batchList = ref<BatchLine[]>([])
  const batchLoading = ref(false)
  const rankDataYear = ref<number | null>(null)
  const yearOptions = ref<number[]>([])
  const saving = ref(false)
  const secondSubjects = ref<string[]>([]) // 3+1+2 再选
  const firstSubjects = ref<string[]>([]) // 3+3 选考
  /** 回填/初始化期间挂起 province/year 自动 watch，避免与手动 loadReform 重复触发 */
  const restoring = ref(false)

  const modelType = computed(() => {
    const m = reformModel.value?.reformModel
    return m === '3+3' || m === '3+1+2' || m === '传统文理' ? m : null
  })

  function clearSubjectScore(name: string) {
    const field = subjectFieldMap.get(name)
    if (field) (form as unknown as Record<string, unknown>)[field] = undefined
  }

  function resetSubjects() {
    form.subjectType = ''
    secondSubjects.value = []
    firstSubjects.value = []
    ALL_SUBJECT_FIELDS.forEach(({ field }) => ((form as unknown as Record<string, unknown>)[field] = undefined))
  }

  /** 按档案回填已选科目：优先用 second/thirdSubjectType 字段（简化表单不采集单科分数） */
  function restoreSubjects(data: GaokaoArchiveVO | GaokaoArchiveForm) {
    const byScore = ALL_SUBJECT_FIELDS.filter(
      (s) => (data as unknown as Record<string, unknown>)[s.field] != null,
    ).map((s) => s.name)
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

  let rankTimer: ReturnType<typeof setTimeout> | null = null

  /** 拉取改革模式 + 可选科目（回填时 restoreData 非空则回填已选科目） */
  async function loadReform(restoreData?: GaokaoArchiveVO | GaokaoArchiveForm | null) {
    if (!form.gaokaoProvince || !form.gaokaoYear) return
    modelLoading.value = true
    try {
      const res = await getReformModel({ province: form.gaokaoProvince, year: form.gaokaoYear })
      reformModel.value = res.data.data
      if (restoreData) {
        restoreSubjects(restoreData)
      } else {
        resetSubjects()
      }
      if (!modelType.value) {
        ElMessage.warning(`${form.gaokaoProvince}暂未配置高考改革模式，暂时无法选择科目`)
      }
    } catch (e: any) {
      reformModel.value = null
      ElMessage.error(e?.message || '获取改革模式失败')
    } finally {
      modelLoading.value = false
    }
  }

  // 省份 / 年份变化：重新拉取改革模式并重置科目（回填期间挂起）
  watch(
    () => [form.gaokaoProvince, form.gaokaoYear] as const,
    ([province, year]) => {
      if (restoring.value) return
      if (!province || !year) return
      void loadReform()
    },
  )

  // 位次：省/年/科类/分数变化后自动查询（防抖 500ms），可手动修改
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

  // 批次线：省/年/科类变化自动查询
  watch(
    () => [form.gaokaoProvince, form.gaokaoYear, form.subjectType] as const,
    async ([province, year, subjectType]) => {
      if (!province || !year || !subjectType) {
        batchList.value = []
        return
      }
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

  // 科目联动清理
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
        ALL_SUBJECT_FIELDS.forEach(({ field }) => ((form as unknown as Record<string, unknown>)[field] = undefined))
      }
    },
  )

  function validate(): boolean {
    if (!form.gaokaoProvince) {
      ElMessage.warning('请选择高考省份')
      return false
    }
    if (!form.gaokaoYear) {
      ElMessage.warning('请选择高考年份')
      return false
    }
    if (!form.score || form.score <= 0 || form.score > 750) {
      ElMessage.warning('请填写正确的高考总分')
      return false
    }
    if (!form.subjectType) {
      ElMessage.warning('请选择科目')
      return false
    }
    if (!form.rank || form.rank <= 0) {
      ElMessage.warning('请填写正确的位次')
      return false
    }
    if (!form.batch) {
      ElMessage.warning('请选择填报批次')
      return false
    }
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

  /** 模拟填报：校验并保存（登录入库 / 游客本地）；返回是否保存成功 */
  async function save(): Promise<boolean> {
    if (!validate()) return false
    saving.value = true
    try {
      buildSubjectTypes()
      const { toServer } = await saveArchiveSmart({ ...form })
      ElMessage.success(toServer ? '档案已保存' : '档案已本地保存（登录后自动同步）')
      return true
    } catch (e: any) {
      ElMessage.error(e?.message || '保存档案失败')
      return false
    } finally {
      saving.value = false
    }
  }

  /** 制定方案：AI 生成专属志愿方案（暂未上线） */
  function handleMakePlan() {
    ElMessage.info('「制定方案」功能即将上线，敬请期待')
  }

  /** 从已有档案回填（登录档案 / 游客本地档案）；null=游客默认北京 */
  async function initFrom(archive: GaokaoArchiveVO | GaokaoArchiveForm | null) {
    restoring.value = true
    if (archive && archive.gaokaoProvince) {
      Object.assign(form, {
        gaokaoYear: archive.gaokaoYear || new Date().getFullYear(),
        gaokaoProvince: archive.gaokaoProvince,
        score: archive.score || 0,
        rank: archive.rank || 0,
        subjectType: archive.subjectType || '',
        secondSubjectType: undefined,
        thirdSubjectType: undefined,
        batch: archive.batch || '',
        batchDataYear: archive.batchDataYear || archive.gaokaoYear || new Date().getFullYear(),
        batchLineScore: archive.batchLineScore || 0,
        scorePhysics: archive.scorePhysics,
        scoreChemistry: archive.scoreChemistry,
        scoreBiology: archive.scoreBiology,
        scorePolitics: archive.scorePolitics,
        scoreHistory: archive.scoreHistory,
        scoreGeography: archive.scoreGeography,
      })
    } else {
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
    await loadReform(archive && archive.gaokaoProvince ? archive : null)
    restoring.value = false
  }

  return {
    form,
    reformModel,
    modelType,
    modelLoading,
    batchList,
    batchLoading,
    rankDataYear,
    yearOptions,
    saving,
    secondSubjects,
    firstSubjects,
    loadYears,
    toggleSecondSubject,
    toggleFirstSubject,
    restoreSubjects,
    resetSubjects,
    clearSubjectScore,
    initFrom,
    validate,
    buildSubjectTypes,
    save,
    handleMakePlan,
  }
}
