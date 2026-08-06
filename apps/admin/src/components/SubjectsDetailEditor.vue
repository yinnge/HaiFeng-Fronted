<script setup lang="ts">
import { ref, watch } from 'vue'
import JsonbArrayEditor from './JsonbArrayEditor.vue'

export interface SubjectDetailItem {
  majorName: string
  tags: string[]
  coreSubject: string
  supportSubject: string
  positioning: string
  coreCourses: string[]
  abilities: string[]
  certificates: string[]
}

const props = defineProps<{
  modelValue: SubjectDetailItem[]
  label?: string
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [SubjectDetailItem[]] }>()

const clone = (list: SubjectDetailItem[]): SubjectDetailItem[] =>
  (list || []).map((s) => ({
    majorName: s.majorName || '',
    tags: [...(s.tags || [])],
    coreSubject: s.coreSubject || '',
    supportSubject: s.supportSubject || '',
    positioning: s.positioning || '',
    coreCourses: [...(s.coreCourses || [])],
    abilities: [...(s.abilities || [])],
    certificates: [...(s.certificates || [])],
  }))

const items = ref<SubjectDetailItem[]>(clone(props.modelValue))
watch(
  () => props.modelValue,
  (v) => {
    items.value = clone(v)
  }
)

const emitChange = () => emit('update:modelValue', clone(items.value))
const addItem = () => {
  items.value.push({
    majorName: '',
    tags: [],
    coreSubject: '',
    supportSubject: '',
    positioning: '',
    coreCourses: [],
    abilities: [],
    certificates: [],
  })
  emitChange()
}
const removeItem = (i: number) => {
  items.value.splice(i, 1)
  emitChange()
}
const onField = (idx: number, field: 'majorName' | 'coreSubject' | 'supportSubject' | 'positioning', val: string) => {
  items.value[idx][field] = val
  emitChange()
}
const onArray = (idx: number, field: 'tags' | 'coreCourses' | 'abilities' | 'certificates', val: string[]) => {
  items.value[idx][field] = val
  emitChange()
}
</script>

<template>
  <div class="subjects-editor">
    <label v-if="label" class="editor-label">{{ label }}</label>
    <div v-for="(s, idx) in items" :key="idx" class="subject-card">
      <div class="card-head">
        <span class="card-title">专业详情 {{ idx + 1 }}</span>
        <button v-if="!disabled" class="btn-remove" type="button" @click="removeItem(idx)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <el-form label-width="90px">
        <el-form-item label="专业名称">
          <el-input
            :model-value="s.majorName"
            :disabled="disabled"
            placeholder="如：计算机科学与技术"
            @update:model-value="(v: string) => onField(idx, 'majorName', v)"
          />
        </el-form-item>
        <el-form-item label="核心学科">
          <el-input
            :model-value="s.coreSubject"
            :disabled="disabled"
            placeholder="核心学科"
            @update:model-value="(v: string) => onField(idx, 'coreSubject', v)"
          />
        </el-form-item>
        <el-form-item label="支撑学科">
          <el-input
            :model-value="s.supportSubject"
            :disabled="disabled"
            placeholder="支撑学科"
            @update:model-value="(v: string) => onField(idx, 'supportSubject', v)"
          />
        </el-form-item>
        <el-form-item label="专业定位">
          <el-input
            :model-value="s.positioning"
            :disabled="disabled"
            placeholder="专业定位"
            @update:model-value="(v: string) => onField(idx, 'positioning', v)"
          />
        </el-form-item>
      </el-form>
      <JsonbArrayEditor
        :model-value="s.tags"
        label="专业标签"
        :disabled="disabled"
        @update:model-value="(v: string[]) => onArray(idx, 'tags', v)"
      />
      <JsonbArrayEditor
        :model-value="s.coreCourses"
        label="核心课程"
        :disabled="disabled"
        @update:model-value="(v: string[]) => onArray(idx, 'coreCourses', v)"
      />
      <JsonbArrayEditor
        :model-value="s.abilities"
        label="能力要求"
        :disabled="disabled"
        @update:model-value="(v: string[]) => onArray(idx, 'abilities', v)"
      />
      <JsonbArrayEditor
        :model-value="s.certificates"
        label="推荐证书"
        :disabled="disabled"
        @update:model-value="(v: string[]) => onArray(idx, 'certificates', v)"
      />
    </div>
    <button v-if="!disabled" class="btn-add" type="button" @click="addItem">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      添加专业详情
    </button>
    <div v-if="items.length === 0" class="empty-cell">暂无数据</div>
  </div>
</template>

<style scoped>
.subjects-editor {
  margin-bottom: 16px;
}
.editor-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}
.subject-card {
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
