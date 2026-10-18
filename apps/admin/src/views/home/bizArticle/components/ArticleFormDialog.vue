<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import RichTextEditor from '@/components/common/RichTextEditor.vue'
import { ARTICLE_MODULE_OPTIONS, ARTICLE_PROVINCE_OPTIONS } from '@/types/home/bizArticle'
import type { BizArticleDetailVO, ArticleFormPayload } from '@/types/home/bizArticle'
import { getBizArticleColumns } from '@/api/home/bizArticle'

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit'
  formLoading: boolean
  initialData: BizArticleDetailVO | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'submit', payload: ArticleFormPayload): void
}>()

const formRef = ref()
const publishTimeDate = ref<Date | null>(null)
const yearInput = ref('')

/** 专栏名下拉选项（按所选模块动态查询，去重） */
const columnOptions = ref<string[]>([])
const columnLoading = ref(false)

/** 查询某模块下的专栏名列表；ensureValue 用于编辑时兜底确保当前专栏名可选 */
const fetchColumns = async (module: string, ensureValue?: string) => {
  if (!module) {
    columnOptions.value = []
    return
  }
  columnLoading.value = true
  try {
    const res = await getBizArticleColumns(module)
    let list: string[] = res.data.code === 200 ? res.data.data || [] : []
    if (ensureValue && ensureValue.trim() && !list.includes(ensureValue)) {
      list = [ensureValue, ...list]
    }
    columnOptions.value = list
  } catch {
    columnOptions.value = ensureValue ? [ensureValue] : []
  } finally {
    columnLoading.value = false
  }
}

/** 用户切换所属模块：清空专栏名并重新拉取该模块下的专栏列表 */
const onModuleChange = () => {
  form.columnName = ''
  fetchColumns(form.moduleName)
}

const form = reactive({
  moduleName: '',
  province: '',
  columnName: '',
  title: '',
  summary: '',
  content: '',
  status: 0,
  sortOrder: 0,
  viewCount: 0,
})

const rules = {
  moduleName: [{ required: true, message: '请选择所属模块', trigger: 'change' }],
  columnName: [{ required: true, message: '请选择或输入专栏名', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
}

watch(
  () => [props.visible, props.initialData, props.mode] as const,
  ([visible, initial, mode]) => {
    if (!visible) return
    if (mode === 'edit' && initial) {
      form.moduleName = initial.moduleName
      form.province = initial.province || ''
      form.columnName = initial.columnName
      form.title = initial.title
      form.summary = initial.summary || ''
      form.content = initial.content || ''
      form.status = initial.status ?? 0
      form.sortOrder = initial.sortOrder ?? 0
      form.viewCount = initial.viewCount ?? 0
      yearInput.value = initial.year != null ? String(initial.year) : ''
      publishTimeDate.value = initial.publishTime ? new Date(initial.publishTime) : null
      // 拉取该模块下的专栏名下拉（兜底确保当前专栏名可选）
      fetchColumns(initial.moduleName, initial.columnName)
    } else {
      form.moduleName = ''
      form.province = ''
      form.columnName = ''
      form.title = ''
      form.summary = ''
      form.content = ''
      form.status = 0
      form.sortOrder = 0
      form.viewCount = 0
      yearInput.value = ''
      publishTimeDate.value = null
      columnOptions.value = []
    }
  },
  { immediate: true },
)

const handleSubmit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return
    if (!form.content.trim()) {
      ElMessage.warning('正文内容不能为空')
      return
    }
    // 年份：可空；填了必须是 2000-2100 的整数（与后端校验对齐）
    let year: number | undefined
    if (yearInput.value.trim()) {
      const n = Number(yearInput.value.trim())
      if (!Number.isInteger(n) || n < 2000 || n > 2100) {
        ElMessage.warning('年份必须是 2000-2100 的整数')
        return
      }
      year = n
    }
    emit('submit', {
      moduleName: form.moduleName,
      province: form.province || undefined,
      year,
      columnName: form.columnName,
      title: form.title,
      summary: form.summary || undefined,
      content: form.content,
      status: form.status,
      sortOrder: form.sortOrder,
      viewCount: form.viewCount,
      publishTime: publishTimeDate.value ? publishTimeDate.value.toISOString() : undefined,
    })
  })
}

const handleClose = () => emit('update:visible', false)
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="mode === 'add' ? '新增资讯' : '修改资讯'"
    width="900px"
    top="6vh"
    class="article-form-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="form-body">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <div class="form-row">
          <el-form-item label="所属模块" prop="moduleName">
            <el-select v-model="form.moduleName" placeholder="请选择模块" style="width: 160px" @change="onModuleChange">
              <el-option v-for="item in ARTICLE_MODULE_OPTIONS" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="省份">
            <el-select
              v-model="form.province"
              placeholder="不限省份"
              clearable
              filterable
              style="width: 160px"
            >
              <el-option v-for="item in ARTICLE_PROVINCE_OPTIONS" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="年份">
            <el-input v-model="yearInput" placeholder="如 2026，不分年份留空" clearable style="width: 160px" />
          </el-form-item>
        </div>

        <div class="form-row">
          <el-form-item label="专栏名" prop="columnName">
            <el-select
              v-model="form.columnName"
              placeholder="先选模块，再选/填专栏名"
              filterable
              allow-create
              default-first-option
              clearable
              :loading="columnLoading"
              style="width: 240px"
            >
              <el-option v-for="c in columnOptions" :key="c" :label="c" :value="c" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序权重">
            <el-input-number v-model="form.sortOrder" :min="0" :max="9999" controls-position="right" style="width: 140px" />
            <span class="field-tip">越大越靠前</span>
          </el-form-item>
        </div>

        <div class="form-row">
          <el-form-item label="浏览量">
            <el-input-number v-model="form.viewCount" :min="0" :max="99999999" controls-position="right" style="width: 160px" />
            <span class="field-tip">允许手动设置 / 修改</span>
          </el-form-item>
        </div>

        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" maxlength="255" show-word-limit />
        </el-form-item>

        <el-form-item label="摘要">
          <el-input
            v-model="form.summary"
            type="textarea"
            :rows="3"
            placeholder="列表页展示的摘要，可空"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <div class="form-row">
          <el-form-item label="状态">
            <el-radio-group v-model="form.status">
              <el-radio :value="0">已发布</el-radio>
              <el-radio :value="1">下架</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="发布时间">
            <el-date-picker
              v-model="publishTimeDate"
              type="datetime"
              placeholder="不填则暂不指定"
              style="width: 200px"
            />
          </el-form-item>
        </div>

        <el-form-item label="正文" prop="content">
          <!-- v-if 保证每次打开都携带最新 content 重新挂载编辑器 -->
          <RichTextEditor v-if="visible" v-model="form.content" :height="420" class="w-full" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="cancel-btn" :disabled="formLoading" @click="handleClose">取消</button>
        <button type="button" class="submit-btn" :disabled="formLoading" @click="handleSubmit">
          {{ formLoading ? '保存中…' : '保 存' }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.article-form-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.article-form-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.article-form-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.article-form-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 68vh;
  overflow-y: auto;
}

.article-form-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.form-body :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.form-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.form-row :deep(.el-form-item) {
  flex: 1;
  min-width: 0;
}

.field-tip {
  margin-left: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  padding: 8px 24px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cancel-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.submit-btn {
  padding: 8px 28px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
