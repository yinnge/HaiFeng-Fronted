<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getChannelUnivDetail,
  addChannelUniv,
  updateChannelUniv,
} from '@/api/special/channel-univ'
import type {
  ChannelUnivDetailVO,
  ChannelUnivAddDTO,
  ChannelUnivUpdateDTO,
} from '@/types/special/channel-univ'

const props = defineProps<{
  visible: boolean
  mode: 'detail' | 'add' | 'edit'
  currentId: string | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const formLoading = ref(false)
const detailData = ref<ChannelUnivDetailVO | null>(null)

const formData = ref<ChannelUnivAddDTO>({
  channelCode: '',
  channelName: '',
  universityId: '',
  universityName: '',
  year: undefined,
  regionTag: '',
  signupStart: '',
  signupEnd: '',
  officialUrl: '',
  brochureTitle: '',
  brochureContent: '',
  sortOrder: 0,
})

const dialogTitle = (() => {
  if (props.mode === 'add') return '新增关联'
  if (props.mode === 'edit') return '修改关联'
  return '关联详情'
})()

watch(
  () => props.visible,
  async (val) => {
    if (val) {
      formLoading.value = true
      detailData.value = null

      if (props.mode === 'add') {
        formData.value = {
          channelCode: '',
          channelName: '',
          universityId: '',
          universityName: '',
          year: undefined,
          regionTag: '',
          signupStart: '',
          signupEnd: '',
          officialUrl: '',
          brochureTitle: '',
          brochureContent: '',
          sortOrder: 0,
        }
        formLoading.value = false
      } else if (props.mode === 'edit' && props.currentId) {
        try {
          const res = await getChannelUnivDetail(props.currentId)
          if (res.data.code === 200) {
            const d = res.data.data
            formData.value = {
              channelCode: d.channelCode,
              channelName: d.channelName,
              universityId: d.universityId,
              universityName: d.universityName,
              year: d.year ?? undefined,
              regionTag: d.regionTag || '',
              signupStart: d.signupStart || '',
              signupEnd: d.signupEnd || '',
              officialUrl: d.officialUrl || '',
              brochureTitle: d.brochureTitle || '',
              brochureContent: d.brochureContent || '',
              sortOrder: d.sortOrder,
            }
          }
        } catch {
          ElMessage.error('获取详情失败')
        } finally {
          formLoading.value = false
        }
      } else if (props.mode === 'detail' && props.currentId) {
        try {
          const res = await getChannelUnivDetail(props.currentId)
          if (res.data.code === 200) {
            detailData.value = res.data.data
          }
        } catch {
          ElMessage.error('获取详情失败')
        } finally {
          formLoading.value = false
        }
      }
    }
  }
)

const handleSubmit = async () => {
  if (!formData.value.channelCode || !formData.value.channelName || !formData.value.universityId || !formData.value.universityName) {
    ElMessage.warning('请填写通道代码、名称和大学信息')
    return
  }

  formLoading.value = true
  try {
    let res: any
    if (props.mode === 'add') {
      res = await addChannelUniv(formData.value)
    } else if (props.mode === 'edit' && props.currentId) {
      res = await updateChannelUniv(props.currentId, formData.value as ChannelUnivUpdateDTO)
    } else {
      return
    }

    if (res.data.code === 200) {
      ElMessage.success(props.mode === 'add' ? '新增成功' : '修改成功')
      emit('update:visible', false)
      emit('success')
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    formLoading.value = false
  }
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="750px"
    class="detail-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="dialog-content">
      <!-- 详情模式 -->
      <template v-if="mode === 'detail' && detailData">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="通道代码">{{ detailData.channelCode }}</el-descriptions-item>
          <el-descriptions-item label="通道名称">{{ detailData.channelName }}</el-descriptions-item>
          <el-descriptions-item label="大学ID">{{ detailData.universityId }}</el-descriptions-item>
          <el-descriptions-item label="大学名称">{{ detailData.universityName }}</el-descriptions-item>
          <el-descriptions-item label="年份">{{ detailData.year || '-' }}</el-descriptions-item>
          <el-descriptions-item label="地区标签">
            <span v-if="detailData.regionTag" :class="['tag-pill', detailData.regionTag === '香港' ? 'tag-orange' : 'tag-purple']">
              {{ detailData.regionTag }}
            </span>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="报名开始">{{ detailData.signupStart || '-' }}</el-descriptions-item>
          <el-descriptions-item label="报名结束">{{ detailData.signupEnd || '-' }}</el-descriptions-item>
          <el-descriptions-item label="官网URL">
            <a v-if="detailData.officialUrl" :href="detailData.officialUrl" target="_blank" class="link-orange">
              {{ detailData.officialUrl }}
            </a>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="简章标题">{{ detailData.brochureTitle || '-' }}</el-descriptions-item>
          <el-descriptions-item label="简章正文">
            <div class="content-preview max-h-40 overflow-y-auto" v-html="detailData.brochureContent || '-'"></div>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <span :class="['status-pill', detailData.isActive ? 'status-on' : 'status-off']">
              {{ detailData.isActive ? '启用' : '禁用' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="排序值">{{ detailData.sortOrder }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
        </el-descriptions>
      </template>

      <!-- 新增/修改模式 -->
      <template v-if="mode !== 'detail'">
        <el-form :model="formData" label-width="110px">
          <el-form-item label="通道代码" required>
            <el-input v-model="formData.channelCode" placeholder="请输入通道代码" maxlength="30" show-word-limit />
          </el-form-item>
          <el-form-item label="通道名称" required>
            <el-input v-model="formData.channelName" placeholder="请输入通道名称" maxlength="50" show-word-limit />
          </el-form-item>
          <el-form-item label="大学ID" required>
            <el-input v-model="formData.universityId" placeholder="请输入大学ID" />
          </el-form-item>
          <el-form-item label="大学名称" required>
            <el-input v-model="formData.universityName" placeholder="请输入大学名称" maxlength="50" show-word-limit />
          </el-form-item>
          <el-form-item label="招生年份">
            <el-input-number v-model="formData.year" :min="2000" :max="2099" controls-position="right" style="width: 130px" />
          </el-form-item>
          <el-form-item label="地区标签">
            <el-select v-model="formData.regionTag" placeholder="请选择" clearable style="width: 200px">
              <el-option label="香港" value="香港" />
              <el-option label="澳门" value="澳门" />
            </el-select>
          </el-form-item>
          <el-form-item label="报名开始">
            <el-date-picker
              v-model="formData.signupStart"
              type="datetime"
              placeholder="选择日期时间"
              value-format="YYYY-MM-DDTHH:mm:ss+08:00"
              style="width: 260px"
            />
          </el-form-item>
          <el-form-item label="报名截止">
            <el-date-picker
              v-model="formData.signupEnd"
              type="datetime"
              placeholder="选择日期时间"
              value-format="YYYY-MM-DDTHH:mm:ss+08:00"
              style="width: 260px"
            />
          </el-form-item>
          <el-form-item label="官网URL">
            <el-input v-model="formData.officialUrl" placeholder="https://" maxlength="500" />
          </el-form-item>
          <el-form-item label="简章标题">
            <el-input v-model="formData.brochureTitle" placeholder="请输入招生简章标题" maxlength="200" show-word-limit />
          </el-form-item>
          <el-form-item label="简章正文">
            <el-input
              v-model="formData.brochureContent"
              type="textarea"
              :rows="4"
              placeholder="支持 HTML"
            />
          </el-form-item>
          <el-form-item label="排序值">
            <el-input-number v-model="formData.sortOrder" :min="0" style="width: 120px" />
          </el-form-item>
        </el-form>
      </template>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="cancel-btn" @click="handleClose">
          {{ mode === 'detail' ? '关闭' : '取消' }}
        </button>
        <button v-if="mode !== 'detail'" type="button" class="submit-btn" :disabled="formLoading" @click="handleSubmit">
          <span v-if="formLoading" class="loading-spinner"></span>
          确定
        </button>
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

.dialog-content :deep(.el-input__wrapper),
.dialog-content :deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.dialog-content :deep(.el-input__wrapper:hover),
.dialog-content :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.dialog-content :deep(.el-input__wrapper.is-focus),
.dialog-content :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.dialog-content :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.dialog-content :deep(.el-select__wrapper) {
  border-radius: 8px;
}

.dialog-content :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.dialog-content :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.dialog-content :deep(.el-input-number .el-input__wrapper) {
  border-radius: 8px;
}

.dialog-content :deep(.el-date-editor) {
  border-radius: 8px;
}

.dialog-content :deep(.el-date-editor:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.dialog-content :deep(.el-date-editor.is-focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.tag-orange {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C;
  border: 1px solid rgba(249, 115, 22, 0.2);
}

.tag-purple {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(167, 139, 250, 0.12));
  color: #7c3aed;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-on {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.12));
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-off {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.link-orange {
  color: #F97316;
  text-decoration: none;
  word-break: break-all;
}

.link-orange:hover {
  text-decoration: underline;
}

.content-preview {
  line-height: 1.6;
  color: #374151;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

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

.cancel-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

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

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
