<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getEnterpriseDetail,
  addEnterprise,
  updateEnterprise,
} from '@/api/company'
import type {
  EnterpriseDetailVO,
  EnterpriseAddDTO,
  EnterpriseUpdateDTO,
} from '@/types/company'

const props = defineProps<{
  visible: boolean
  mode: 'detail' | 'add' | 'edit'
  currentId: string | null
  natureOptions: string[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const formLoading = ref(false)
const detailData = ref<EnterpriseDetailVO | null>(null)

const formData = ref<EnterpriseAddDTO>({
  cityName: '',
  enterpriseName: '',
  enterpriseNature: '',
  enterpriseType: '',
  logoUrl: '',
  officialWebsite: '',
  region: '',
  enterpriseScale: '',
  mainBusiness: '',
  enterpriseIntro: '',
  recruitmentStatus: '招聘中',
})

const dialogTitle = (() => {
  if (props.mode === 'add') return '新增企业'
  if (props.mode === 'edit') return '修改企业'
  return '企业详情'
})()

watch(
  () => props.visible,
  async (val) => {
    if (val) {
      formLoading.value = true
      detailData.value = null

      if (props.mode === 'add') {
        formData.value = {
          cityName: '',
          enterpriseName: '',
          enterpriseNature: '',
          enterpriseType: '',
          logoUrl: '',
          officialWebsite: '',
          region: '',
          enterpriseScale: '',
          mainBusiness: '',
          enterpriseIntro: '',
          recruitmentStatus: '招聘中',
        }
        formLoading.value = false
      } else if (props.mode === 'edit' && props.currentId) {
        try {
          const res = await getEnterpriseDetail(props.currentId)
          if (res.data.code === 200) {
            const d = res.data.data
            formData.value = {
              cityName: d.cityName || '',
              enterpriseName: d.enterpriseName,
              enterpriseNature: d.enterpriseNature,
              enterpriseType: d.enterpriseType || '',
              logoUrl: d.logoUrl || '',
              officialWebsite: d.officialWebsite || '',
              region: d.region || '',
              enterpriseScale: d.enterpriseScale || '',
              mainBusiness: d.mainBusiness || '',
              enterpriseIntro: d.enterpriseIntro || '',
              recruitmentStatus: d.recruitmentStatus,
            }
          }
        } catch { ElMessage.error('获取详情失败') }
        finally { formLoading.value = false }
      } else if (props.mode === 'detail' && props.currentId) {
        try {
          const res = await getEnterpriseDetail(props.currentId)
          if (res.data.code === 200) detailData.value = res.data.data
        } catch { ElMessage.error('获取详情失败') }
        finally { formLoading.value = false }
      }
    }
  }
)

const statusTag = (val: boolean) => (val ? 'info' : 'success')
const statusLabel = (val: boolean) => (val ? '禁用' : '启用')

const handleSubmit = async () => {
  if (!formData.value.enterpriseName) {
    ElMessage.warning('请填写企业名称')
    return
  }
  if (!formData.value.enterpriseNature) {
    ElMessage.warning('请选择企业性质')
    return
  }

  formLoading.value = true
  try {
    const data: Record<string, any> = {
      enterpriseName: formData.value.enterpriseName,
      enterpriseNature: formData.value.enterpriseNature,
    }
    if (formData.value.cityName) data.cityName = formData.value.cityName
    if (formData.value.enterpriseType) data.enterpriseType = formData.value.enterpriseType
    if (formData.value.logoUrl) data.logoUrl = formData.value.logoUrl
    if (formData.value.officialWebsite) data.officialWebsite = formData.value.officialWebsite
    if (formData.value.region) data.region = formData.value.region
    if (formData.value.enterpriseScale) data.enterpriseScale = formData.value.enterpriseScale
    if (formData.value.mainBusiness) data.mainBusiness = formData.value.mainBusiness
    if (formData.value.enterpriseIntro) data.enterpriseIntro = formData.value.enterpriseIntro
    if (formData.value.recruitmentStatus) data.recruitmentStatus = formData.value.recruitmentStatus

    let res: any
    if (props.mode === 'add') {
      res = await addEnterprise(data as EnterpriseAddDTO)
    } else if (props.mode === 'edit' && props.currentId) {
      res = await updateEnterprise(props.currentId, data as EnterpriseUpdateDTO)
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
    width="900px"
    class="detail-dialog"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="dialog-content">
      <!-- 详情模式 -->
      <template v-if="mode === 'detail' && detailData">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="企业名称">{{ detailData.enterpriseName }}</el-descriptions-item>
          <el-descriptions-item label="城市名称">{{ detailData.cityName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="企业性质">{{ detailData.enterpriseNature }}</el-descriptions-item>
          <el-descriptions-item label="企业类型">{{ detailData.enterpriseType || '-' }}</el-descriptions-item>
          <el-descriptions-item label="招聘状态">
            <span :class="['tag-pill', detailData.recruitmentStatus === '招聘中' ? 'tag-green' : 'tag-gray']">
              {{ detailData.recruitmentStatus }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <span :class="['status-pill', detailData.isDeleted ? 'status-off' : 'status-on']">
              {{ statusLabel(detailData.isDeleted) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="总部地区">{{ detailData.region || '-' }}</el-descriptions-item>
          <el-descriptions-item label="企业规模">{{ detailData.enterpriseScale || '-' }}</el-descriptions-item>
          <el-descriptions-item label="Logo地址">
            <a v-if="detailData.logoUrl" :href="detailData.logoUrl" target="_blank" class="link-orange">
              {{ detailData.logoUrl }}
            </a>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="官网">
            <a v-if="detailData.officialWebsite" :href="detailData.officialWebsite" target="_blank" class="link-orange">
              {{ detailData.officialWebsite }}
            </a>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="主营业务" :span="2">{{ detailData.mainBusiness || '-' }}</el-descriptions-item>
          <el-descriptions-item label="企业简介" :span="2">{{ detailData.enterpriseIntro || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detailData.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detailData.updatedAt }}</el-descriptions-item>
        </el-descriptions>

        <!-- 关联岗位子表格 -->
        <div class="positions-section">
          <h3 class="positions-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            关联岗位
          </h3>
          <div v-if="detailData.positions?.length" class="positions-table">
            <el-table :data="detailData.positions" stripe size="small">
              <el-table-column prop="positionName" label="岗位名称" min-width="140" show-overflow-tooltip />
              <el-table-column prop="recruitmentType" label="招聘类型" width="90" />
              <el-table-column prop="province" label="省份" width="80" />
              <el-table-column prop="city" label="城市" width="80" />
              <el-table-column prop="workLocation" label="工作地点" width="140" show-overflow-tooltip />
              <el-table-column prop="educationRequirement" label="学历要求" width="90" />
              <el-table-column prop="majorRequirement" label="专业要求" width="120" show-overflow-tooltip />
              <el-table-column prop="workExperience" label="工作经验" width="90" />
              <el-table-column label="薪资(k/月)" width="120">
                <template #default="{ row }">
                  {{ row.salaryMin ?? '-' }} - {{ row.salaryMax ?? '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="positionStatus" label="岗位状态" width="90" />
              <el-table-column prop="deadline" label="截止日期" width="100" />
            </el-table>
          </div>
          <div v-else class="positions-empty">暂无关联岗位</div>
        </div>
      </template>

      <!-- 新增/修改模式 -->
      <template v-if="mode !== 'detail'">
        <el-form :model="formData" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="企业名称" required>
                <el-input v-model="formData.enterpriseName" placeholder="请输入企业名称" maxlength="200" show-word-limit />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="企业性质" required>
                <el-select v-model="formData.enterpriseNature" placeholder="请选择" style="width: 100%">
                  <el-option v-for="item in natureOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="城市名称">
                <el-input v-model="formData.cityName" placeholder="请输入城市名称" maxlength="50" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="企业类型">
                <el-input v-model="formData.enterpriseType" placeholder="请输入企业类型" maxlength="50" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Logo地址">
                <el-input v-model="formData.logoUrl" placeholder="请输入Logo图片URL" maxlength="500" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="官网">
                <el-input v-model="formData.officialWebsite" placeholder="请输入企业官网" maxlength="500" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="总部地区">
                <el-input v-model="formData.region" placeholder="如: 广东省深圳市" maxlength="100" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="企业规模">
                <el-input v-model="formData.enterpriseScale" placeholder="如: 10000人以上" maxlength="50" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="招聘状态">
                <el-select v-model="formData.recruitmentStatus" placeholder="请选择招聘状态" style="width: 100%">
                  <el-option label="招聘中" value="招聘中" />
                  <el-option label="已结束" value="已结束" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="主营业务">
                <el-input v-model="formData.mainBusiness" placeholder="请输入主营业务" maxlength="500" show-word-limit />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="企业简介">
            <el-input v-model="formData.enterpriseIntro" type="textarea" :rows="4" placeholder="请输入企业简介" />
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
  max-height: 70vh;
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

.positions-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(249, 115, 22, 0.1);
}

.positions-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 12px 0;
}

.positions-title svg {
  width: 18px;
  height: 18px;
  color: #F97316;
}

.positions-table {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(249, 115, 22, 0.1);
}

.positions-table :deep(.el-table th.el-table__cell) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5) !important;
  color: #1f2937;
  font-weight: 600;
  font-size: 12px;
  border-bottom: 2px solid #F97316;
}

.positions-table :deep(.el-table td.el-table__cell) {
  border-bottom-color: rgba(249, 115, 22, 0.06);
}

.positions-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: rgba(255, 247, 237, 0.3);
}

.positions-table :deep(.el-table .el-table__body tr:hover > td.el-table__cell) {
  background: rgba(249, 115, 22, 0.05) !important;
}

.positions-empty {
  padding: 32px;
  text-align: center;
  color: #9ca3af;
  background: rgba(255, 247, 237, 0.3);
  border-radius: 8px;
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

.tag-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.tag-green {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.12));
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.tag-gray {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.link-orange {
  color: #F97316;
  text-decoration: none;
  word-break: break-all;
  font-size: 13px;
}

.link-orange:hover {
  text-decoration: underline;
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
