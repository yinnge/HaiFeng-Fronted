<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getNoticeDetail, updateNotice, addNotice } from '@/api/employment/notice'
import type { NoticeDetailVO, NoticeUpdateDTO, NoticeAddDTO } from '@/types/employment/notice'
import { NoticeCategoryLabel, NoticeTypeOptions } from '@/types/employment/notice'

const sourceOptions = ['官方网站', '微信公众号', '人社局官网', '教育局官网', '考试院官网', '政务服务平台', '媒体新闻', '其他']
const provinceOptions = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆', '香港', '澳门', '台湾']

const props = defineProps<{
  visible: boolean
  mode: 'detail' | 'edit' | 'add'
  currentId: string | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'saved'): void
}>()

const formLoading = ref(false)
const detailData = ref<NoticeDetailVO | null>(null)
const formData = ref<Record<string, any>>({})

const formRef = ref<FormInstance>()

// 必填校验（与后端 NoticeAddDTO @NotBlank 字段对齐）
const rules: FormRules = {
  noticeCategory: [{ required: true, message: '请选择公告类别', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
}

const categoryLabel = (cat: string) => NoticeCategoryLabel[cat] || cat

watch(() => props.visible, async (val) => {
  if (val && props.mode === 'add') {
    formData.value = {
      noticeCategory: '', noticeType: '', title: '', summary: '', content: '',
      province: '', city: '', tags: [], year: '', source: '', sourceUrl: '',
      publishDate: '', publishUnit: '', regStartDate: undefined, regEndDate: undefined,
      examTime: undefined, recruitmentCount: undefined,
      isTop: false, isImportant: false, sortOrder: 0,
    }
    nextTick(() => { formRef.value?.clearValidate() })
    return
  }
  if (val && props.currentId) {
    formLoading.value = true
    detailData.value = null
    try {
      const res = await getNoticeDetail(props.currentId)
      if (res.data.code === 200) {
        detailData.value = res.data.data
        if (props.mode === 'edit') {
          const d = res.data.data
          formData.value = {
            noticeCategory: d.noticeCategory,
            noticeType: d.noticeType,
            title: d.title,
            summary: d.summary || '',
            content: d.content,
            province: d.province || '',
            city: d.city || '',
            tags: d.tags || [],
            year: d.year || '',
            source: d.source || '',
            sourceUrl: d.sourceUrl || '',
            publishDate: d.publishDate,
            publishUnit: d.publishUnit || '',
            regStartDate: d.regStartDate || undefined,
            regEndDate: d.regEndDate || undefined,
            examTime: d.examTime || undefined,
            recruitmentCount: d.recruitmentCount || undefined,
            isTop: d.isTop,
            isImportant: d.isImportant,
            sortOrder: d.sortOrder,
          }
          nextTick(() => { formRef.value?.clearValidate() })
        }
      } else {
        ElMessage.error(res.data.msg || '获取详情失败')
      }
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败')
    } finally {
      formLoading.value = false
    }
  }
})

const handleClose = () => { emit('update:visible', false) }

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  if (props.mode !== 'add' && !props.currentId) return
  try {
    const res = props.mode === 'add' ? await addNotice({ ...formData.value } as NoticeAddDTO) : await updateNotice(props.currentId!, { ...formData.value } as NoticeUpdateDTO)
    if (res.data.code === 200) {
      ElMessage.success(props.mode === 'add' ? '新增成功' : '修改成功')
      emit('update:visible', false)
      emit('saved')
    } else {
      ElMessage.error(res.data.msg || (props.mode === 'add' ? '新增失败' : '修改失败'))
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || (props.mode === 'add' ? '新增失败' : '修改失败'))
  }
}

const dialogTitle = () => props.mode === 'detail' ? '公告详情' : props.mode === 'edit' ? '修改公告' : '新增公告'
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle()"
    width="800px"
    class="detail-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="dialog-content">
      <template v-if="mode === 'detail' && detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="标题" :span="2">{{ detailData.title }}</el-descriptions-item>
          <el-descriptions-item label="公告类别">{{ categoryLabel(detailData.noticeCategory) }}</el-descriptions-item>
          <el-descriptions-item label="公告类型">{{ detailData.noticeType }}</el-descriptions-item>
          <el-descriptions-item label="省份">{{ detailData.province || '-' }}</el-descriptions-item>
          <el-descriptions-item label="城市">{{ detailData.city || '-' }}</el-descriptions-item>
          <el-descriptions-item label="年份">{{ detailData.year || '-' }}</el-descriptions-item>
          <el-descriptions-item label="来源">{{ detailData.source || '-' }}</el-descriptions-item>
          <el-descriptions-item label="发布单位">{{ detailData.publishUnit || '-' }}</el-descriptions-item>
          <el-descriptions-item label="来源链接">
            <el-link v-if="detailData.sourceUrl" :href="detailData.sourceUrl" type="primary" target="_blank">查看原文</el-link>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="发布日期">{{ detailData.publishDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="报名开始">{{ detailData.regStartDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="报名结束">{{ detailData.regEndDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="考试时间">{{ detailData.examTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="招录人数">{{ detailData.recruitmentCount ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="置顶">
            <span v-if="detailData.isTop" class="pill pill-warning">置顶</span>
            <span v-else>无</span>
          </el-descriptions-item>
          <el-descriptions-item label="重要">
            <span v-if="detailData.isImportant" class="pill pill-danger">重要</span>
            <span v-else>无</span>
          </el-descriptions-item>
          <el-descriptions-item label="阅读量">{{ detailData.viewCount }}</el-descriptions-item>
          <el-descriptions-item label="排序">{{ detailData.sortOrder }}</el-descriptions-item>
          <el-descriptions-item label="标签" :span="2">
            <span v-for="tag in detailData.tags" :key="tag" class="pill pill-tag" style="margin-right: 4px">{{ tag }}</span>
            <span v-if="!detailData.tags || detailData.tags.length === 0">-</span>
          </el-descriptions-item>
          <el-descriptions-item label="摘要" :span="2">{{ detailData.summary || '-' }}</el-descriptions-item>
          <el-descriptions-item label="内容" :span="2">
            <div class="max-h-80 overflow-y-auto border rounded p-2" v-html="detailData.content" />
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
        </el-descriptions>
      </template>

      <template v-if="mode !== 'detail'">
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="公告类别" prop="noticeCategory" required>
                <el-select v-model="formData.noticeCategory" placeholder="请选择" style="width: 100%">
                  <el-option v-for="(label, key) in NoticeCategoryLabel" :key="key" :label="label" :value="key" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="公告类型" required>
                <el-select v-model="formData.noticeType" placeholder="请选择" style="width: 100%">
                  <el-option v-for="t in NoticeTypeOptions" :key="t" :label="t" :value="t" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="标题" prop="title" required>
            <el-input v-model="formData.title" placeholder="请输入标题" maxlength="500" show-word-limit />
          </el-form-item>
          <el-form-item label="摘要">
            <el-input v-model="formData.summary" type="textarea" :rows="2" placeholder="请输入摘要" />
          </el-form-item>
          <el-form-item label="内容" prop="content" required>
            <el-input v-model="formData.content" type="textarea" :rows="10" placeholder="请输入公告内容（支持 HTML）" />
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="省份">
                <el-select v-model="formData.province" placeholder="请选择" clearable filterable allow-create default-first-option style="width: 100%">
                  <el-option v-for="item in provinceOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="城市">
                <el-input v-model="formData.city" placeholder="城市" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="年份">
                <el-input v-model="formData.year" placeholder="年份" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="来源">
                <el-select v-model="formData.source" placeholder="来源名称" clearable filterable allow-create default-first-option style="width: 100%">
                  <el-option v-for="item in sourceOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="原文链接">
                <el-input v-model="formData.sourceUrl" placeholder="原文 URL" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="发布单位">
                <el-input v-model="formData.publishUnit" placeholder="发布单位" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发布日期">
                <el-date-picker v-model="formData.publishDate" type="datetime" placeholder="选择日期" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="报名开始">
                <el-date-picker v-model="formData.regStartDate" type="datetime" placeholder="报名开始" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="报名结束">
                <el-date-picker v-model="formData.regEndDate" type="datetime" placeholder="报名结束" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="考试时间">
                <el-date-picker v-model="formData.examTime" type="datetime" placeholder="考试时间" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="招录人数">
                <el-input-number v-model="formData.recruitmentCount" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="排序">
                <el-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="标签">
            <el-select v-model="formData.tags" multiple filterable allow-create default-first-option placeholder="输入标签后回车" style="width: 100%">
              <el-option v-for="tag in formData.tags" :key="tag" :label="tag" :value="tag" />
            </el-select>
          </el-form-item>
          <el-form-item label="展示控制">
            <el-checkbox v-model="formData.isTop" label="置顶" border />
            <el-checkbox v-model="formData.isImportant" label="重要" border style="margin-left: 12px" />
          </el-form-item>
        </el-form>
      </template>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="close-btn" @click="handleClose">
          {{ mode === 'detail' ? '关闭' : '取消' }}
        </button>
        <button v-if="mode !== 'detail'" type="button" class="submit-btn" @click="handleSubmit">确定</button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.detail-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.detail-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.detail-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.detail-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 65vh;
  overflow-y: auto;
}

.detail-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.dialog-content :deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: rgba(249, 115, 22, 0.05);
}

.dialog-content :deep(.el-descriptions__label) {
  font-weight: 600;
  color: #374151;
  background: rgba(249, 115, 22, 0.06) !important;
}

.dialog-content :deep(.el-descriptions__content) {
  color: #1f2937;
}

.dialog-content :deep(.el-descriptions__cell) {
  border-color: rgba(249, 115, 22, 0.1);
}

.dialog-content :deep(.el-descriptions__body) {
  border-radius: 8px;
  overflow: hidden;
}

.dialog-content :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.dialog-content :deep(.el-input__wrapper),
.dialog-content :deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.dialog-content :deep(.el-input__wrapper:hover),
.dialog-content :deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.dialog-content :deep(.el-input__wrapper.is-focus),
.dialog-content :deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.dialog-content :deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.dialog-content :deep(.el-textarea__inner:hover) {
  border-color: #F97316;
}

.dialog-content :deep(.el-textarea__inner:focus) {
  border-color: #F97316;
  box-shadow: 0 0 0 1px #F97316 inset;
}

.dialog-content :deep(.el-checkbox.is-checked) {
  --el-checkbox-text-color: #F97316;
  --el-checkbox-input-border-color-hover: #F97316;
}

.dialog-content :deep(.el-date-editor) {
  border-radius: 8px;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.pill-warning {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(251, 191, 36, 0.12));
  color: #d97706;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.pill-danger {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(248, 113, 113, 0.12));
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.pill-tag {
  background: rgba(249, 115, 22, 0.08);
  color: #ea580c;
  border: 1px solid rgba(249, 115, 22, 0.2);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.close-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
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

.close-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 24px;
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
</style>
