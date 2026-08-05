<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getChannelDetail,
  addChannel,
  updateChannel,
} from '@/api/special/channel'
import type {
  ChannelDetailVO,
  ChannelAddDTO,
} from '@/types/special/channel'

const props = defineProps<{
  visible: boolean
  mode: 'detail' | 'add' | 'edit'
  currentId: string | null
  displayTypeOptions: { label: string; value: string }[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const formLoading = ref(false)
const detailData = ref<ChannelDetailVO | null>(null)

const formData = ref<ChannelAddDTO>({
  channelCode: '',
  channelName: '',
  subtitle: '',
  parentCode: '',
  filterLabel: '',
  displayType: 'UNIVERSITY_LIST',
  content: '',
  sortOrder: 0,
})

const dialogTitle = (() => {
  if (props.mode === 'add') return '新增通道'
  if (props.mode === 'edit') return '修改通道'
  return '通道详情'
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
          subtitle: '',
          parentCode: '',
          filterLabel: '',
          displayType: 'UNIVERSITY_LIST',
          content: '',
          sortOrder: 0,
        }
        formLoading.value = false
      } else if (props.mode === 'edit' && props.currentId) {
        try {
          const res = await getChannelDetail(props.currentId)
          if (res.data.code === 200) {
            const d = res.data.data
            formData.value = {
              channelCode: d.channelCode,
              channelName: d.channelName,
              subtitle: d.subtitle || '',
              parentCode: d.parentCode || '',
              filterLabel: d.filterLabel || '',
              displayType: d.displayType,
              content: d.content || '',
              sortOrder: d.sortOrder,
            }
          }
        } catch (e: any) {
          ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败')
        } finally {
          formLoading.value = false
        }
      } else if (props.mode === 'detail' && props.currentId) {
        try {
          const res = await getChannelDetail(props.currentId)
          if (res.data.code === 200) {
            detailData.value = res.data.data
          }
        } catch (e: any) {
          ElMessage.error(e?.response?.data?.msg || e?.message || '获取详情失败')
        } finally {
          formLoading.value = false
        }
      }
    }
  }
)

const displayTypeLabel = (type: string) => {
  const opt = props.displayTypeOptions.find((o) => o.value === type)
  return opt ? opt.label : type
}

const handleSubmit = async () => {
  if (!formData.value.channelCode || !formData.value.channelName) {
    ElMessage.warning('请填写通道代码和名称')
    return
  }

  formLoading.value = true
  try {
    let res: any
    if (props.mode === 'add') {
      res = await addChannel(formData.value)
    } else if (props.mode === 'edit' && props.currentId) {
      res = await updateChannel(props.currentId, formData.value)
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
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '操作失败')
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
    width="700px"
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
          <el-descriptions-item label="副标题">{{ detailData.subtitle || '-' }}</el-descriptions-item>
          <el-descriptions-item label="父级通道">{{ detailData.parentCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="筛选标签">{{ detailData.filterLabel || '-' }}</el-descriptions-item>
          <el-descriptions-item label="展示类型">
            <span class="type-pill">{{ displayTypeLabel(detailData.displayType) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <span :class="['status-pill', detailData.isActive ? 'status-on' : 'status-off']">
              {{ detailData.isActive ? '启用' : '禁用' }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="排序值">{{ detailData.sortOrder }}</el-descriptions-item>
          <el-descriptions-item label="内容">
            <div class="content-preview max-h-60 overflow-y-auto" v-html="detailData.content || '-'"></div>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
        </el-descriptions>
      </template>

      <!-- 新增/修改模式 -->
      <template v-if="mode !== 'detail'">
        <el-form :model="formData" label-width="100px">
          <el-form-item label="通道代码" required>
            <el-input v-model="formData.channelCode" placeholder="请输入通道代码" maxlength="30" show-word-limit />
          </el-form-item>
          <el-form-item label="通道名称" required>
            <el-input v-model="formData.channelName" placeholder="请输入通道名称" maxlength="50" show-word-limit />
          </el-form-item>
          <el-form-item label="副标题">
            <el-input v-model="formData.subtitle" placeholder="请输入副标题" maxlength="200" show-word-limit />
          </el-form-item>
          <el-form-item label="父级通道">
            <el-input v-model="formData.parentCode" placeholder="父级通道代码" maxlength="30" />
          </el-form-item>
          <el-form-item label="筛选标签">
            <el-input v-model="formData.filterLabel" placeholder="筛选按钮文字" maxlength="30" />
          </el-form-item>
          <el-form-item label="展示类型" required>
            <el-select v-model="formData.displayType" placeholder="请选择" style="width: 200px">
              <el-option
                v-for="opt in displayTypeOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="富文本内容">
            <el-input
              v-model="formData.content"
              type="textarea"
              :rows="6"
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
        <button type="button" class="exit-btn" @click="handleClose">
          {{ mode === 'detail' ? '关闭' : '取消' }}
        </button>
        <button v-if="mode !== 'detail'" type="button" class="save-btn" :disabled="formLoading" @click="handleSubmit">
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

.type-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C;
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
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

.content-preview {
  line-height: 1.6;
  color: #374151;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.exit-btn {
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

.exit-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.save-btn {
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

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.save-btn:disabled {
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
