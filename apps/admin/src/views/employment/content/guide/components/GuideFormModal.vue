<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getExamGuideDetail, updateExamGuide } from '@/api/employment/guide'
import { GuideCategoryLabel, GuideTypeOptions } from '@/types/employment/guide'

const props = defineProps<{ visible: boolean; initialData: Record<string, any> }>()
const emit = defineEmits<{ 'update:visible': [val: boolean]; submit: [] }>()

const loading = ref(false)
const formData = ref<Record<string, any>>({})

watch(() => props.visible, (val) => {
  if (val) { formData.value = { ...props.initialData } }
})

const handleSubmit = async () => {
  if (!formData.value.title || !formData.value.content) { ElMessage.warning('请填写标题和内容'); return }
  if (!formData.value.guideCategory) { ElMessage.warning('请选择指南类别'); return }
  if (!formData.value.id) return
  try {
    const res = await updateExamGuide(formData.value.id, { ...formData.value } as any)
    if (res.data.code === 200) { ElMessage.success('修改成功'); emit('update:visible', false); emit('submit') }
    else { ElMessage.error(res.data.msg || '修改失败') }
  } catch { ElMessage.error('修改失败') }
}
</script>

<template>
  <el-dialog :model-value="visible" title="修改备考指南" width="800px" :close-on-click-modal="false" class="detail-dialog" @update:model-value="emit('update:visible', $event)">
    <div v-loading="loading">
      <el-form :model="formData" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="指南类别" required>
              <el-select v-model="formData.guideCategory" placeholder="请选择" style="width: 100%">
                <el-option v-for="(label, key) in GuideCategoryLabel" :key="key" :label="label" :value="key" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="指南类型" required>
              <el-select v-model="formData.guideType" placeholder="请选择" style="width: 100%">
                <el-option v-for="t in GuideTypeOptions" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="标题" required>
          <el-input v-model="formData.title" placeholder="请输入标题" maxlength="300" show-word-limit />
        </el-form-item>
        <el-form-item label="副标题">
          <el-input v-model="formData.subtitle" placeholder="请输入副标题" />
        </el-form-item>
        <el-form-item label="封面">
          <el-input v-model="formData.coverImage" placeholder="封面图片 URL" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="formData.iconClass" placeholder="Font Awesome 类名" />
        </el-form-item>
        <el-form-item label="摘要">
          <el-input v-model="formData.summary" type="textarea" :rows="2" placeholder="请输入摘要" />
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input v-model="formData.content" type="textarea" :rows="10" placeholder="请输入详细内容（支持 HTML）" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="难度">
              <el-select v-model="formData.difficultyLevel" placeholder="请选择" clearable style="width: 100%">
                <el-option label="入门" value="入门" />
                <el-option label="进阶" value="进阶" />
                <el-option label="高阶" value="高阶" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="目标读者">
              <el-input v-model="formData.targetAudience" placeholder="目标读者" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="排序">
              <el-input-number v-model="formData.sortOrder" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="作者名">
              <el-input v-model="formData.authorName" placeholder="作者名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作者头衔">
              <el-input v-model="formData.authorTitle" placeholder="作者头衔" />
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
          <el-checkbox v-model="formData.isRecommended" label="编辑推荐" border style="margin-left: 12px" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="cancel-btn" @click="emit('update:visible', false)">取消</button>
        <button type="button" class="submit-btn" @click="handleSubmit">确定</button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.detail-dialog :deep(.el-dialog) { border-radius: 12px; overflow: hidden; }
.detail-dialog :deep(.el-dialog__header) { border-bottom: 2px solid rgba(249, 115, 22, 0.15); padding: 20px 24px; margin: 0; }
.detail-dialog :deep(.el-dialog__title) { font-size: 16px; font-weight: 600; color: #1f2937; }
.detail-dialog :deep(.el-dialog__body) { padding: 24px; }
.detail-dialog :deep(.el-dialog__footer) { border-top: 1px solid #f3f4f6; padding: 16px 24px; }

.detail-dialog :deep(.el-form-item) { margin-bottom: 18px; }

.detail-dialog :deep(.el-input__wrapper) { border-radius: 8px; transition: all 0.25s ease; }
.detail-dialog :deep(.el-input__wrapper:hover) { box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset; }
.detail-dialog :deep(.el-input__wrapper.is-focus) { box-shadow: 0 0 0 1px #F97316 inset; }

.detail-dialog :deep(.el-textarea__inner) { border-radius: 8px; transition: all 0.25s ease; }
.detail-dialog :deep(.el-textarea__inner:hover) { box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset; }
.detail-dialog :deep(.el-textarea__inner:focus) { box-shadow: 0 0 0 1px #F97316 inset; }

.detail-dialog :deep(.el-select__wrapper) { border-radius: 8px; transition: all 0.25s ease; }
.detail-dialog :deep(.el-select__wrapper:hover) { box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset; }
.detail-dialog :deep(.el-select__wrapper.is-focused) { box-shadow: 0 0 0 1px #F97316 inset; }

.detail-dialog :deep(.el-input-number .el-input__wrapper) { border-radius: 8px; }
.detail-dialog :deep(.el-checkbox__input.is-checked .el-checkbox__inner) { background-color: #F97316; border-color: #F97316; }
.detail-dialog :deep(.el-checkbox__input.is-checked + .el-checkbox__label) { color: #F97316; }

.dialog-footer { display: flex; justify-content: flex-end; gap: 12px; }

.cancel-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}
.cancel-btn:hover { color: #374151; border-color: #9ca3af; background: #f9fafb; }
.cancel-btn:active { background: #f3f4f6; }

.submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
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
.submit-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4); }
.submit-btn:active { transform: translateY(0); }
</style>
