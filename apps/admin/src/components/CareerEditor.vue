<script setup lang="ts">
import { ref, watch } from 'vue'
import JsonbObjectEditor, { type ColumnDef } from './JsonbObjectEditor.vue'

export interface CareerStage {
  stageTitle: string
  workYears: string
  position: string
  coreGoal: string
  salaryRange: string
}
export interface CareerPath {
  pathTitle: string
  pathDesc: string
  stages: CareerStage[]
}

const props = defineProps<{
  modelValue: CareerPath[]
  label?: string
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [CareerPath[]] }>()

const clone = (list: CareerPath[]): CareerPath[] =>
  (list || []).map((c) => ({
    pathTitle: c.pathTitle || '',
    pathDesc: c.pathDesc || '',
    stages: (c.stages || []).map((s) => ({ ...s })),
  }))

const items = ref<CareerPath[]>(clone(props.modelValue))
watch(
  () => props.modelValue,
  (v) => {
    items.value = clone(v)
  }
)

const stageColumns: ColumnDef[] = [
  { key: 'stageTitle', label: '阶段小标题', width: '20%' },
  { key: 'workYears', label: '工作年限', width: '15%' },
  { key: 'position', label: '职位', width: '20%' },
  { key: 'coreGoal', label: '核心目标', width: '25%' },
  { key: 'salaryRange', label: '薪资范围', width: '20%' },
]

const emitChange = () => emit('update:modelValue', clone(items.value))
const addItem = () => {
  items.value.push({ pathTitle: '', pathDesc: '', stages: [] })
  emitChange()
}
const removeItem = (i: number) => {
  items.value.splice(i, 1)
  emitChange()
}
const onField = (idx: number, field: 'pathTitle' | 'pathDesc', val: string) => {
  items.value[idx][field] = val
  emitChange()
}
const onStages = (idx: number, val: any[]) => {
  items.value[idx].stages = val as CareerStage[]
  emitChange()
}
</script>

<template>
  <div class="career-editor">
    <label v-if="label" class="editor-label">{{ label }}</label>
    <div v-for="(c, idx) in items" :key="idx" class="career-card">
      <div class="card-head">
        <span class="card-title">职业路径 {{ idx + 1 }}</span>
        <button v-if="!disabled" class="btn-remove" type="button" @click="removeItem(idx)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <el-form label-width="90px">
        <el-form-item label="路径标题">
          <el-input
            :model-value="c.pathTitle"
            :disabled="disabled"
            placeholder="如：技术研发路径"
            @update:model-value="(v: string) => onField(idx, 'pathTitle', v)"
          />
        </el-form-item>
        <el-form-item label="路径描述">
          <el-input
            :model-value="c.pathDesc"
            type="textarea"
            :rows="2"
            :disabled="disabled"
            placeholder="路径简介"
            @update:model-value="(v: string) => onField(idx, 'pathDesc', v)"
          />
        </el-form-item>
      </el-form>
      <JsonbObjectEditor
        :model-value="c.stages"
        :columns="stageColumns"
        label="阶段列表"
        :disabled="disabled"
        @update:model-value="(v: any[]) => onStages(idx, v)"
      />
    </div>
    <button v-if="!disabled" class="btn-add" type="button" @click="addItem">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      添加职业路径
    </button>
    <div v-if="items.length === 0" class="empty-cell">暂无数据</div>
  </div>
</template>

<style scoped>
.career-editor {
  margin-bottom: 16px;
}
.editor-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}
.career-card {
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  background: rgba(255, 247, 237, 0.25);
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.card-title {
  font-size: 13px;
  font-weight: 600;
  color: #f97316;
}
.btn-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-remove:hover {
  background: rgba(239, 68, 68, 0.15);
}
.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px dashed rgba(249, 115, 22, 0.4);
  border-radius: 6px;
  background: rgba(249, 115, 22, 0.04);
  color: #f97316;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-add:hover {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.08);
}
.empty-cell {
  text-align: center;
  color: #9ca3af;
  padding: 16px 0;
  font-size: 13px;
}
</style>
