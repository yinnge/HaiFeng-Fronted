<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getPdfProfile, savePdfProfile, type PdfProfileVO } from '@/api/pdf-report'

const props = defineProps<{ visible: boolean }>()
const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'proceed'): void
}>()

// ========== 状态 ==========

// confirm=确认弹窗 fill=渐进式填写 view=总体档案展示
const mode = ref<'confirm' | 'fill' | 'view'>('confirm')
const currentPart = ref(1)
const viewEditable = ref(false)
const loading = ref(false)
const saving = ref(false)

// ========== 表单（前端统一用字符串，布尔以 是/否/空 表示） ==========

interface ProfileForm {
  careerDevPath: string
  personalityTraits: string
  interestDirection: string
  otherHealthConditions: string
  politicalReviewStatus: string
  stayInProvince: string
  familyResources: string
  tuitionAffordability: string
  acceptGrassroot: string
  acceptShiftWork: string
  acceptNightWork: string
  acceptBusinessTrip: string
  acceptRelocation: string
  rejectedIndustries: string
  rejectedDirections: string
}

const emptyForm = (): ProfileForm => ({
  careerDevPath: '',
  personalityTraits: '',
  interestDirection: '',
  otherHealthConditions: '',
  politicalReviewStatus: '',
  stayInProvince: '',
  familyResources: '',
  tuitionAffordability: '',
  acceptGrassroot: '',
  acceptShiftWork: '',
  acceptNightWork: '',
  acceptBusinessTrip: '',
  acceptRelocation: '',
  rejectedIndustries: '',
  rejectedDirections: '',
})

const form = reactive<ProfileForm>(emptyForm())

// ========== 字段定义（5 部分渐进式，全部选填） ==========

interface ProfileField {
  key: keyof ProfileForm
  type: 'select' | 'radio' | 'textarea' | 'input'
  label: string
  options?: string[]
  placeholder?: string
  hint?: string
}

interface ProfilePart {
  title: string
  fields: ProfileField[]
}

const parts: ProfilePart[] = [
  {
    title: '发展定位 · 性格 · 兴趣',
    fields: [
      {
        key: 'careerDevPath',
        type: 'select',
        label: '发展定位',
        options: ['本科就业', '考研深造', '并行'],
        hint: '毕业后更倾向于直接就业、继续考研深造，还是两者并行考虑？AI会结合你的定位推荐院校与专业方向。',
      },
      {
        key: 'personalityTraits',
        type: 'textarea',
        label: '性格特质',
        placeholder: '如：活泼开朗、沉稳内敛、善于沟通、喜欢独立思考',
        hint: '描述你的性格特点，越具体越好，AI会据此匹配适合的专业方向。',
      },
      {
        key: 'interestDirection',
        type: 'textarea',
        label: '兴趣倾向',
        placeholder: '如：计算机、医学、教育、金融、艺术等',
        hint: '你对哪些学科或领域感兴趣？可以多写几个，AI会据此推荐相关专业。',
      },
    ],
  },
  {
    title: '身体状况 · 政审',
    fields: [
      {
        key: 'otherHealthConditions',
        type: 'textarea',
        label: '其他疾病',
        placeholder: '请自述身体状况，没有可跳过',
        hint: '如近视度数、慢性疾病、过敏等可能影响专业录取的身体状况；无特殊情况可跳过。',
      },
      {
        key: 'politicalReviewStatus',
        type: 'textarea',
        label: '政审情况',
        placeholder: '自身、父母有无犯罪记录，大致描述即可',
        hint: '自身及直系亲属有无犯罪记录、失信记录等，大致描述即可，AI会智能分析是否影响军校/公安/司法等特殊院校报考。',
      },
    ],
  },
  {
    title: '地域 · 家庭 · 学费',
    fields: [
      {
        key: 'stayInProvince',
        type: 'radio',
        label: '是否必须留本省',
        options: ['是', '否'],
        hint: '是否只能接受本省高校，还是愿意考虑外省院校？',
      },
      {
        key: 'familyResources',
        type: 'textarea',
        label: '家庭资源',
        placeholder: '如：父母在体制内/医疗/教育/金融等行业',
        hint: '家庭在体制内、医疗、教育、金融等行业是否有资源可助就业？可大致描述。',
      },
      {
        key: 'tuitionAffordability',
        type: 'input',
        label: '学费承受度',
        placeholder: '如：每年2万、5万、不限制',
        hint: '每年可承担的学费上限，民办/中外合作办学学费较高，可据此筛选院校。',
      },
    ],
  },
  {
    title: '工作方式偏好',
    fields: [
      {
        key: 'acceptGrassroot',
        type: 'radio',
        label: '是否接受基层岗位',
        options: ['是', '否'],
        hint: '基层岗位指乡镇、街道、社区、村等一线岗位，如基层公务员、乡村教师、社区工作者等，工作环境相对艰苦但发展空间大。',
      },
      {
        key: 'acceptShiftWork',
        type: 'radio',
        label: '是否接受倒班',
        options: ['是', '否'],
        hint: '倒班指需要轮班工作，如三班倒、两班倒，常见于医院、工厂、电力、通信等行业。',
      },
      {
        key: 'acceptNightWork',
        type: 'radio',
        label: '是否接受夜班',
        options: ['是', '否'],
        hint: '夜班指需要夜间工作，如护士、医生、警察、客服等岗位常有夜班安排。',
      },
    ],
  },
  {
    title: '出差 · 异地 · 排斥',
    fields: [
      {
        key: 'acceptBusinessTrip',
        type: 'radio',
        label: '是否接受长期出差',
        options: ['是', '否'],
        hint: '长期出差指需要频繁或长时间离开常住地工作，常见于销售、工程、审计、咨询等行业。',
      },
      {
        key: 'acceptRelocation',
        type: 'radio',
        label: '是否接受异地工作',
        options: ['是', '否'],
        hint: '异地工作指需要到其他城市长期工作生活，需考虑离家距离与生活成本。',
      },
      {
        key: 'rejectedIndustries',
        type: 'textarea',
        label: '排斥行业/岗位',
        placeholder: '如：化工、军工、销售、高危行业（可不填）',
        hint: '明确不接受的行业或岗位，如化工、军工、销售、高危行业等；可为空。',
      },
      {
        key: 'rejectedDirections',
        type: 'textarea',
        label: '排斥方向',
        placeholder: '如：不想做临床、不想进工厂、不想当老师（可不填）',
        hint: '明确不想从事的方向或领域，AI会避开这些方向进行推荐；可为空。',
      },
    ],
  },
]

const totalCount = computed(() =>
  parts.reduce((sum, p) => sum + p.fields.length, 0),
)

const filledCount = computed(() =>
  (Object.keys(form) as (keyof ProfileForm)[]).filter((k) => form[k].trim() !== '').length,
)

// ========== 数据转换 ==========

function fillFromVO(data: PdfProfileVO) {
  const boolText = (v: boolean | null | undefined) => (v == null ? '' : v ? '是' : '否')
  form.careerDevPath = data.careerDevPath ?? ''
  form.personalityTraits = data.personalityTraits ?? ''
  form.interestDirection = data.interestDirection ?? ''
  form.otherHealthConditions = data.otherHealthConditions ?? ''
  form.politicalReviewStatus = data.politicalReviewStatus ?? ''
  form.familyResources = data.familyResources ?? ''
  form.tuitionAffordability = data.tuitionAffordability ?? ''
  form.rejectedIndustries = data.rejectedIndustries ?? ''
  form.rejectedDirections = data.rejectedDirections ?? ''
  form.stayInProvince = boolText(data.stayInProvince)
  form.acceptGrassroot = boolText(data.acceptGrassroot)
  form.acceptShiftWork = boolText(data.acceptShiftWork)
  form.acceptNightWork = boolText(data.acceptNightWork)
  form.acceptBusinessTrip = boolText(data.acceptBusinessTrip)
  form.acceptRelocation = boolText(data.acceptRelocation)
}

function toVO(): PdfProfileVO {
  const boolVal = (v: string): boolean | null => (v === '' ? null : v === '是')
  return {
    careerDevPath: form.careerDevPath || null,
    personalityTraits: form.personalityTraits || null,
    interestDirection: form.interestDirection || null,
    otherHealthConditions: form.otherHealthConditions || null,
    politicalReviewStatus: form.politicalReviewStatus || null,
    stayInProvince: boolVal(form.stayInProvince),
    familyResources: form.familyResources || null,
    tuitionAffordability: form.tuitionAffordability || null,
    acceptGrassroot: boolVal(form.acceptGrassroot),
    acceptShiftWork: boolVal(form.acceptShiftWork),
    acceptNightWork: boolVal(form.acceptNightWork),
    acceptBusinessTrip: boolVal(form.acceptBusinessTrip),
    acceptRelocation: boolVal(form.acceptRelocation),
    rejectedIndustries: form.rejectedIndustries || null,
    rejectedDirections: form.rejectedDirections || null,
  }
}

// ========== 生命周期 ==========

function reset() {
  mode.value = 'confirm'
  currentPart.value = 1
  viewEditable.value = false
  Object.assign(form, emptyForm())
}

watch(
  () => props.visible,
  async (v) => {
    if (!v) return
    reset()
    loading.value = true
    try {
      const res = await getPdfProfile()
      fillFromVO(res.data.data || {})
    } catch (e: any) {
      ElMessage.error(e?.message || '加载档案失败')
      close()
    } finally {
      loading.value = false
    }
  },
)

function close() {
  emit('update:visible', false)
}

// ========== 确认弹窗 ==========

function handleConfirmAnalyze() {
  emit('proceed')
  close()
}

function handleViewOrModify() {
  if (filledCount.value === totalCount.value) {
    // 已全部填写 -> 总体档案展示
    viewEditable.value = false
    mode.value = 'view'
  } else {
    // 有未填写项 -> 渐进式填写
    mode.value = 'fill'
    currentPart.value = 1
  }
}

// ========== 渐进式填写 ==========

function prevPart() {
  if (currentPart.value > 1) currentPart.value--
}

function nextPart() {
  if (currentPart.value < parts.length) currentPart.value++
}

async function handleFillComplete() {
  saving.value = true
  try {
    await savePdfProfile(toVO())
    ElMessage.success('档案已保存')
    viewEditable.value = false
    mode.value = 'view'
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// ========== 总体展示 ==========

function handleViewModify() {
  viewEditable.value = true
}

async function handleViewConfirm() {
  saving.value = true
  try {
    await savePdfProfile(toVO())
    ElMessage.success('档案已保存')
    emit('proceed')
    close()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function displayValue(key: keyof ProfileForm): string {
  const v = form[key]
  if (v == null || v === '') return '未填写'
  return v
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="'AI分析档案'"
    width="640px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @update:model-value="(v: boolean) => emit('update:visible', v)"
  >
    <div v-loading="loading" class="min-h-[120px]">
      <!-- ========== 模式一：确认弹窗 ========== -->
      <div v-if="mode === 'confirm'">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 shrink-0 rounded-xl bg-brand-orange/10 flex items-center justify-center">
            <svg class="w-5 h-5 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-base font-semibold text-gray-800 leading-snug">请确认是否填写完整AI分析档案表</p>
            <p class="text-sm text-gray-500 mt-1.5 leading-relaxed">
              填写考生画像（发展定位、性格、身体状况、工作偏好等）后，AI 将结合你的情况生成更精准的志愿分析报告。全部选填，可随时修改。
            </p>
          </div>
        </div>
        <div class="mt-4 rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 flex items-center gap-2">
          <svg class="w-4 h-4 text-brand-orange shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-xs text-orange-600">当前已填写 <b class="font-semibold">{{ filledCount }}</b> / {{ totalCount }} 项</span>
        </div>
      </div>

      <!-- ========== 模式二：渐进式填写 ========== -->
      <div v-else-if="mode === 'fill'">
        <div class="flex items-center justify-between mb-5">
          <div>
            <span class="text-sm font-semibold text-gray-700">第 {{ currentPart }} / {{ parts.length }} 部分</span>
            <span class="text-xs text-gray-400 ml-2">{{ parts[currentPart - 1].title }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span
              v-for="i in parts.length"
              :key="i"
              class="w-6 h-1.5 rounded-full transition-colors"
              :class="i <= currentPart ? 'bg-brand-orange' : 'bg-gray-200'"
            />
          </div>
        </div>
        <div class="max-h-[52vh] overflow-y-auto pr-1">
          <div v-for="field in parts[currentPart - 1].fields" :key="field.key" class="mb-5">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              {{ field.label }}
              <span class="text-xs text-gray-400 font-normal">（选填）</span>
            </label>
            <el-select
              v-if="field.type === 'select'"
              v-model="form[field.key]"
              placeholder="请选择"
              clearable
              class="w-full"
            >
              <el-option v-for="o in field.options ?? []" :key="o" :label="o" :value="o" />
            </el-select>
            <el-radio-group v-else-if="field.type === 'radio'" v-model="form[field.key]" class="pt-1">
              <el-radio v-for="o in field.options ?? []" :key="o" :value="o">{{ o }}</el-radio>
            </el-radio-group>
            <el-input
              v-else-if="field.type === 'textarea'"
              v-model="form[field.key]"
              type="textarea"
              :rows="3"
              :placeholder="field.placeholder"
              maxlength="500"
              show-word-limit
            />
            <el-input v-else v-model="form[field.key]" :placeholder="field.placeholder" maxlength="100" />
            <p v-if="field.hint" class="text-xs text-gray-400 leading-relaxed mt-1.5 flex items-start gap-1">
              <svg class="w-3.5 h-3.5 mt-0.5 shrink-0 text-brand-orange/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ field.hint }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- ========== 模式三：总体档案展示 ========== -->
      <div v-else>
        <div class="flex items-center justify-between mb-4">
          <p class="text-sm font-semibold text-gray-700">AI分析档案总览</p>
          <span class="text-xs text-gray-400">已填写 {{ filledCount }}/{{ totalCount }} 项</span>
        </div>
        <div class="max-h-[52vh] overflow-y-auto pr-1">
          <div v-for="(part, idx) in parts" :key="idx" class="mb-5">
            <h4 class="text-xs font-semibold text-brand-orange mb-2.5 flex items-center gap-1.5">
              <span class="w-4 h-4 rounded-full bg-brand-orange/10 text-brand-orange text-[10px] flex items-center justify-center font-bold">{{ idx + 1 }}</span>
              {{ part.title }}
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <div
                v-for="field in part.fields"
                :key="field.key"
                class="mb-3"
                :class="field.type === 'textarea' || field.type === 'select' ? 'sm:col-span-2' : ''"
              >
                <label class="block text-xs text-gray-400 mb-1">{{ field.label }}</label>
                <div
                  v-if="!viewEditable"
                  class="text-sm text-gray-700 rounded-lg bg-gray-50 px-3 py-2 min-h-[2.25rem] leading-relaxed"
                >
                  {{ displayValue(field.key) }}
                </div>
                <template v-else>
                  <el-select
                    v-if="field.type === 'select'"
                    v-model="form[field.key]"
                    placeholder="请选择"
                    clearable
                    class="w-full"
                  >
                    <el-option v-for="o in field.options ?? []" :key="o" :label="o" :value="o" />
                  </el-select>
                  <el-radio-group v-else-if="field.type === 'radio'" v-model="form[field.key]" class="pt-1">
                    <el-radio v-for="o in field.options ?? []" :key="o" :value="o">{{ o }}</el-radio>
                  </el-radio-group>
                  <el-input
                    v-else-if="field.type === 'textarea'"
                    v-model="form[field.key]"
                    type="textarea"
                    :rows="2"
                    :placeholder="field.placeholder"
                    maxlength="500"
                    show-word-limit
                  />
                  <el-input v-else v-model="form[field.key]" :placeholder="field.placeholder" maxlength="100" />
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== 底部按钮 ========== -->
    <template #footer>
      <!-- 确认弹窗 -->
      <div v-if="mode === 'confirm'" class="flex items-center justify-end gap-2">
        <button class="btn-secondary px-5 py-2 text-sm" @click="close">取消</button>
        <button class="btn-secondary px-5 py-2 text-sm" @click="handleViewOrModify">查看并修改档案</button>
        <button class="btn-brand px-5 py-2 text-sm" @click="handleConfirmAnalyze">确认并AI分析</button>
      </div>

      <!-- 渐进式填写 -->
      <div v-else-if="mode === 'fill'" class="flex items-center justify-between w-full">
        <button class="btn-secondary px-5 py-2 text-sm" @click="close">取消</button>
        <div class="flex items-center gap-2">
          <button v-if="currentPart > 1" class="btn-secondary px-5 py-2 text-sm" @click="prevPart">上一步</button>
          <button v-if="currentPart < parts.length" class="btn-brand px-5 py-2 text-sm" @click="nextPart">下一步</button>
          <button v-else class="btn-brand px-5 py-2 text-sm" :disabled="saving" @click="handleFillComplete">
            {{ saving ? '保存中...' : '完成' }}
          </button>
        </div>
      </div>

      <!-- 总体展示 -->
      <div v-else class="flex items-center justify-between w-full">
        <button class="btn-secondary px-5 py-2 text-sm" @click="close">取消</button>
        <div class="flex items-center gap-2">
          <button v-if="!viewEditable" class="btn-secondary px-5 py-2 text-sm" @click="handleViewModify">再次修改</button>
          <button class="btn-brand px-5 py-2 text-sm" :disabled="saving" @click="handleViewConfirm">
            {{ saving ? '保存中...' : '确认并AI分析' }}
          </button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
:deep(.el-dialog__body) {
  padding-top: 8px;
}
</style>
