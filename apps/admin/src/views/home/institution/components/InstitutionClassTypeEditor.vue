<script setup lang="ts">
/**
 * 主打班型条目编辑器（培训机构专用子表单）
 *
 * 对应后端 InstitutionClassType：{ title, introduction, tag }
 * 后端约束：title 必填 ≤64 字，introduction ≤256 字，tag ≤32 字
 */
import type { InstitutionClassType } from '@/types/home/institution'

const props = defineProps<{
  modelValue: InstitutionClassType[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: InstitutionClassType[]): void
}>()

function addItem() {
  emit('update:modelValue', [
    ...(props.modelValue || []),
    { title: '', introduction: '', tag: '' },
  ])
}

function removeItem(index: number) {
  const next = [...(props.modelValue || [])]
  next.splice(index, 1)
  emit('update:modelValue', next)
}

function updateItem(index: number, patch: Partial<InstitutionClassType>) {
  const next = [...(props.modelValue || [])]
  next[index] = { ...next[index], ...patch }
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="class-type-editor">
    <div v-if="modelValue && modelValue.length" class="class-type-list">
      <div v-for="(item, index) in modelValue" :key="index" class="class-type-item">
        <div class="item-head">
          <span class="item-index">{{ index + 1 }}</span>
          <button type="button" class="item-remove" @click="removeItem(index)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            删除
          </button>
        </div>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item
              label="班型名称"
              :prop="`classTypes.${index}.title`"
              :rules="[{ required: true, message: '请输入班型名称', trigger: 'blur' }]"
            >
              <el-input
                :model-value="item.title"
                placeholder="如：高三冲刺班"
                maxlength="64"
                @update:model-value="(v: string) => updateItem(index, { title: v })"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="班型标签"
              :prop="`classTypes.${index}.tag`"
              :rules="[{ max: 32, message: '标签最长 32 字符', trigger: 'blur' }]"
            >
              <el-input
                :model-value="item.tag"
                placeholder="如：热门"
                maxlength="32"
                @update:model-value="(v: string) => updateItem(index, { tag: v })"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item
          label="班型介绍"
          :prop="`classTypes.${index}.introduction`"
          :rules="[{ max: 256, message: '介绍最长 256 字符', trigger: 'blur' }]"
        >
          <el-input
            :model-value="item.introduction"
            type="textarea"
            :rows="2"
            placeholder="如：全年脱产文化课冲刺，按学科分层教学"
            maxlength="256"
            @update:model-value="(v: string) => updateItem(index, { introduction: v })"
          />
        </el-form-item>
      </div>
    </div>

    <button type="button" class="item-add" @click="addItem">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      添加班型
    </button>
  </div>
</template>

<style scoped>
.class-type-editor {
  width: 100%;
}

.class-type-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.class-type-item {
  padding: 14px 16px 2px;
  background: rgba(249, 115, 22, 0.03);
  border: 1px solid rgba(249, 115, 22, 0.12);
  border-radius: 12px;
}

.item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.item-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
}

.item-remove {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #fff;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.item-remove:hover {
  background: #fef2f2;
  border-color: #fca5a5;
}

.item-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: #fff;
  color: #C2410C;
  border: 1px dashed rgba(249, 115, 22, 0.4);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}
.item-add:hover {
  background: rgba(249, 115, 22, 0.06);
  border-color: #F97316;
  color: #EA580C;
}
</style>
