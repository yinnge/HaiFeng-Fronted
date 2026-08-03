<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string[]
  label?: string
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const items = ref<string[]>([...(props.modelValue || [])])

watch(() => props.modelValue, (val) => {
  items.value = [...(val || [])]
})

const addItem = () => {
  items.value.push('')
  emit('update:modelValue', [...items.value])
}

const removeItem = (index: number) => {
  items.value.splice(index, 1)
  emit('update:modelValue', [...items.value])
}

const updateItem = (index: number, value: string) => {
  items.value[index] = value
  emit('update:modelValue', [...items.value])
}
</script>

<template>
  <div class="jsonb-array-editor">
    <label v-if="label" class="editor-label">{{ label }}</label>
    <div class="items-list">
      <div v-for="(item, index) in items" :key="index" class="item-row">
        <el-input
          :model-value="item"
          :placeholder="placeholder || '请输入'"
          :disabled="disabled"
          size="small"
          @update:model-value="(val: string) => updateItem(index, val)"
        />
        <button
          v-if="!disabled"
          class="btn-remove"
          type="button"
          @click="removeItem(index)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
    <button
      v-if="!disabled"
      class="btn-add"
      type="button"
      @click="addItem"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      添加{{ label || '一项' }}
    </button>
  </div>
</template>

<style scoped>
.jsonb-array-editor {
  margin-bottom: 16px;
}
.editor-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}
.items-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.item-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.item-row .el-input {
  flex: 1;
}
.btn-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.btn-remove:hover {
  background: rgba(239, 68, 68, 0.15);
}
.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  margin-top: 6px;
  border: 1px dashed rgba(249, 115, 22, 0.4);
  border-radius: 6px;
  background: rgba(249, 115, 22, 0.04);
  color: #F97316;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-add:hover {
  border-color: #F97316;
  background: rgba(249, 115, 22, 0.08);
}
</style>
