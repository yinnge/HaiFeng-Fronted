<script setup lang="ts">
/**
 * 服务内容条目编辑器（规划师专用子表单）
 *
 * 对应后端 PlannerServiceItem：{ title, content }
 * 后端约束：title 必填 ≤64 字，content 必填 ≤1024 字
 */
import type { PlannerServiceItem } from '@/types/home/planner'

const props = defineProps<{
  modelValue: PlannerServiceItem[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: PlannerServiceItem[]): void
}>()

function addItem() {
  emit('update:modelValue', [
    ...(props.modelValue || []),
    { title: '', content: '' },
  ])
}

function removeItem(index: number) {
  const next = [...(props.modelValue || [])]
  next.splice(index, 1)
  emit('update:modelValue', next)
}

function updateItem(index: number, patch: Partial<PlannerServiceItem>) {
  const next = [...(props.modelValue || [])]
  next[index] = { ...next[index], ...patch }
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="service-editor">
    <div v-if="modelValue && modelValue.length" class="service-list">
      <div v-for="(item, index) in modelValue" :key="index" class="service-item">
        <div class="service-head">
          <span class="service-index">{{ index + 1 }}</span>
          <button type="button" class="service-remove" @click="removeItem(index)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            删除
          </button>
        </div>
        <el-form-item
          label="标题"
          :prop="`services.${index}.title`"
          :rules="[{ required: true, message: '请输入服务标题', trigger: 'blur' }]"
        >
          <el-input
            :model-value="item.title"
            placeholder="如：首次诊断"
            maxlength="64"
            show-word-limit
            @update:model-value="(v: string) => updateItem(index, { title: v })"
          />
        </el-form-item>
        <el-form-item
          label="内容"
          :prop="`services.${index}.content`"
          :rules="[{ required: true, message: '请输入服务内容', trigger: 'blur' }]"
        >
          <el-input
            :model-value="item.content"
            type="textarea"
            :rows="2"
            placeholder="如：成绩位次、学科优势、家庭诉求三维评估，输出目标专业方向清单"
            maxlength="1024"
            @update:model-value="(v: string) => updateItem(index, { content: v })"
          />
        </el-form-item>
      </div>
    </div>

    <button type="button" class="service-add" @click="addItem">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
      添加服务内容
    </button>
  </div>
</template>

<style scoped>
.service-editor {
  width: 100%;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.service-item {
  padding: 14px 16px 2px;
  background: rgba(249, 115, 22, 0.03);
  border: 1px solid rgba(249, 115, 22, 0.12);
  border-radius: 12px;
}

.service-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.service-index {
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

.service-remove {
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
.service-remove:hover {
  background: #fef2f2;
  border-color: #fca5a5;
}

.service-add {
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
.service-add:hover {
  background: rgba(249, 115, 22, 0.06);
  border-color: #F97316;
  color: #EA580C;
}
</style>
