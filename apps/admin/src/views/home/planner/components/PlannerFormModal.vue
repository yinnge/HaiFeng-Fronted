<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PlannerAddDTO } from '@/types/home/planner'

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'edit'
  formLoading: boolean
  initialData?: PlannerAddDTO | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'submit', data: PlannerAddDTO): void
}>()

const formData = ref<PlannerAddDTO>({
  name: '',
  position: '',
  region: '',
  avatar: '',
  specialty: '',
  douyinName: '',
  douyinUrl: '',
  personalDescription: '',
  experienceJob: '',
  achievements: [],
  expertiseAreas: [],
  sortOrder: 0,
})

watch(
  () => [props.visible, props.initialData, props.mode] as const,
  ([visible, initial, mode]) => {
    if (visible) {
      if (mode === 'edit' && initial) {
        formData.value = {
          name: initial.name || '',
          position: initial.position || '',
          region: initial.region || '',
          avatar: initial.avatar || '',
          specialty: initial.specialty || '',
          douyinName: initial.douyinName || '',
          douyinUrl: initial.douyinUrl || '',
          personalDescription: initial.personalDescription || '',
          experienceJob: initial.experienceJob || '',
          achievements: initial.achievements ? [...initial.achievements] : [],
          expertiseAreas: initial.expertiseAreas ? [...initial.expertiseAreas] : [],
          sortOrder: initial.sortOrder ?? 0,
        }
      } else {
        formData.value = {
          name: '', position: '', region: '', avatar: '', specialty: '',
          douyinName: '', douyinUrl: '', personalDescription: '', experienceJob: '',
          achievements: [], expertiseAreas: [], sortOrder: 0,
        }
      }
    }
  },
  { immediate: true },
)

const addArrayItem = (key: 'achievements' | 'expertiseAreas') => {
  if (!formData.value[key]) formData.value[key] = []
  formData.value[key]!.push('')
}

const removeArrayItem = (key: 'achievements' | 'expertiseAreas', index: number) => {
  if (formData.value[key]) formData.value[key]!.splice(index, 1)
}

const handleSubmit = () => {
  emit('submit', { ...formData.value })
}

const handleClose = () => {
  emit('update:visible', false)
}

const dialogTitle = () => (props.mode === 'add' ? '新增规划师' : '修改规划师')
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle()"
    width="750px"
    class="form-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="formLoading" class="form-content">
      <el-form :model="formData" label-width="100px" class="planner-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" required>
              <el-input v-model="formData.name" placeholder="请输入姓名" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位">
              <el-input v-model="formData.position" placeholder="请输入职位" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="地区">
              <el-input v-model="formData.region" placeholder="请输入地区" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序值">
              <el-input-number v-model="formData.sortOrder" :min="0" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="头像 URL">
          <el-input v-model="formData.avatar" placeholder="请输入头像链接" maxlength="200" />
        </el-form-item>
        <el-form-item label="专长">
          <el-input v-model="formData.specialty" placeholder="请输入专长" maxlength="100" />
        </el-form-item>
        <el-form-item label="抖音名称">
          <el-input v-model="formData.douyinName" placeholder="请输入抖音名称" maxlength="100" />
        </el-form-item>
        <el-form-item label="抖音链接">
          <el-input v-model="formData.douyinUrl" placeholder="请输入抖音链接" maxlength="200" />
        </el-form-item>
        <el-form-item label="个人简介">
          <el-input v-model="formData.personalDescription" type="textarea" :rows="3" placeholder="请输入个人简介" />
        </el-form-item>
        <el-form-item label="工作经历">
          <el-input v-model="formData.experienceJob" type="textarea" :rows="3" placeholder="请输入工作经历" />
        </el-form-item>
        <el-form-item label="成就">
          <div class="array-field">
            <div v-for="(_, index) in formData.achievements" :key="index" class="array-row">
              <el-input v-model="formData.achievements![index]" placeholder="请输入成就" />
              <button type="button" class="remove-array-btn" @click="removeArrayItem('achievements', index)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <button type="button" class="add-array-btn" @click="addArrayItem('achievements')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              添加成就
            </button>
          </div>
        </el-form-item>
        <el-form-item label="擅长领域">
          <div class="array-field">
            <div v-for="(_, index) in formData.expertiseAreas" :key="index" class="array-row">
              <el-input v-model="formData.expertiseAreas![index]" placeholder="请输入擅长领域" />
              <button type="button" class="remove-array-btn" @click="removeArrayItem('expertiseAreas', index)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <button type="button" class="add-array-btn" @click="addArrayItem('expertiseAreas')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              添加擅长领域
            </button>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="cancel-btn" @click="handleClose">取消</button>
        <button type="button" class="submit-btn" @click="handleSubmit">
          {{ mode === 'add' ? '确认新增' : '保存修改' }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.form-dialog :deep(.el-dialog) { border-radius: 12px; overflow: hidden; }
.form-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px; margin: 0;
}
.form-dialog :deep(.el-dialog__title) { font-size: 16px; font-weight: 600; color: #1f2937; }
.form-dialog :deep(.el-dialog__body) { padding: 24px; }
.form-dialog :deep(.el-dialog__footer) { border-top: 1px solid #f3f4f6; padding: 16px 24px; }

.planner-form :deep(.el-form-item__label) { font-weight: 500; color: #374151; }
.planner-form :deep(.el-input__wrapper),
.planner-form :deep(.el-textarea__inner),
.planner-form :deep(.el-input-number .el-input__wrapper) {
  border-radius: 8px; transition: all 0.25s ease;
}
.planner-form :deep(.el-input__wrapper:hover),
.planner-form :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}
.planner-form :deep(.el-input__wrapper.is-focus),
.planner-form :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

/* 动态数组字段 */
.array-field { width: 100%; }
.array-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 8px;
}
.array-row .el-input { flex: 1; }
.remove-array-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; flex-shrink: 0;
  background: none; color: #ef4444;
  border: 1px solid #fecaca; border-radius: 8px;
  cursor: pointer; transition: all 0.2s ease;
}
.remove-array-btn:hover { background: #fef2f2; border-color: #fca5a5; }
.add-array-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C; border: 1px dashed rgba(249, 115, 22, 0.25);
  border-radius: 8px; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all 0.2s ease;
}
.add-array-btn:hover { background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.18)); border-color: #F97316; }

.dialog-footer { display: flex; justify-content: flex-end; gap: 12px; }
.cancel-btn {
  display: inline-flex; align-items: center;
  padding: 8px 24px; background: #fff; color: #6b7280;
  border: 1px solid #d1d5db; border-radius: 20px;
  font-size: 14px; font-weight: 500; cursor: pointer;
  transition: all 0.25s ease;
}
.cancel-btn:hover { color: #374151; border-color: #9ca3af; background: #f9fafb; }
.cancel-btn:active { background: #f3f4f6; }
.submit-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 24px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff; border: none; border-radius: 20px;
  font-size: 14px; font-weight: 600; cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.submit-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4); }
.submit-btn:active { transform: translateY(0); }
</style>
