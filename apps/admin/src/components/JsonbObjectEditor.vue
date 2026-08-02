<script setup lang="ts">
import { ref, watch } from 'vue'

export interface ColumnDef {
  key: string
  label: string
  type?: 'text' | 'number'
  width?: string
}

const props = defineProps<{
  modelValue: Record<string, any>[]
  columns: ColumnDef[]
  label?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>[]]
}>()

const items = ref<Record<string, any>[]>(
  (props.modelValue || []).map(item => ({ ...item }))
)

watch(() => props.modelValue, (val) => {
  items.value = (val || []).map(item => ({ ...item }))
}, { deep: true })

const createEmptyItem = (): Record<string, any> => {
  const item: Record<string, any> = {}
  props.columns.forEach(col => {
    item[col.key] = col.type === 'number' ? 0 : ''
  })
  return item
}

const addItem = () => {
  items.value.push(createEmptyItem())
  emit('update:modelValue', items.value.map(i => ({ ...i })))
}

const removeItem = (index: number) => {
  items.value.splice(index, 1)
  emit('update:modelValue', items.value.map(i => ({ ...i })))
}

const updateItem = (index: number, key: string, value: any) => {
  items.value[index][key] = value
  emit('update:modelValue', items.value.map(i => ({ ...i })))
}
</script>

<template>
  <div class="jsonb-object-editor">
    <label v-if="label" class="editor-label">{{ label }}</label>
    <div class="table-wrapper">
      <table class="editor-table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key" :style="{ width: col.width || 'auto' }">
              {{ col.label }}
            </th>
            <th class="action-col" v-if="!disabled"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, rowIndex) in items" :key="rowIndex">
            <td v-for="col in columns" :key="col.key">
              <el-input
                v-if="col.type !== 'number'"
                :model-value="item[col.key]"
                size="small"
                :disabled="disabled"
                @update:model-value="(val: string) => updateItem(rowIndex, col.key, val)"
              />
              <el-input-number
                v-else
                :model-value="item[col.key]"
                size="small"
                :disabled="disabled"
                :min="0"
                controls-position="right"
                style="width: 100%"
                @update:model-value="(val: number | undefined) => updateItem(rowIndex, col.key, val ?? 0)"
              />
            </td>
            <td class="action-col" v-if="!disabled">
              <button class="btn-remove" type="button" @click="removeItem(rowIndex)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td :colspan="columns.length + 1" class="empty-cell">暂无数据</td>
          </tr>
        </tbody>
      </table>
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
      添加{{ label || '一行' }}
    </button>
  </div>
</template>

<style scoped>
.jsonb-object-editor {
  margin-bottom: 16px;
}
.editor-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}
.table-wrapper {
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-radius: 8px;
  overflow: hidden;
}
.editor-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.editor-table th {
  background: linear-gradient(180deg, #fff7ed, #ffedd5);
  color: #1f2937;
  font-weight: 600;
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid rgba(249, 115, 22, 0.15);
}
.editor-table td {
  padding: 6px 10px;
  border-bottom: 1px solid rgba(249, 115, 22, 0.08);
}
.editor-table tr:last-child td {
  border-bottom: none;
}
.editor-table tr:hover td {
  background: rgba(249, 115, 22, 0.02);
}
.action-col {
  width: 40px;
  text-align: center;
}
.empty-cell {
  text-align: center;
  color: #9ca3af;
  padding: 16px 0 !important;
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
  margin: 0 auto;
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
