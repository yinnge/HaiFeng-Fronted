<script setup lang="ts">
/**
 * 可排序标签编辑器（管理端通用）
 *
 * 用于「列表标签 / 详情标签 / 机构优势」这类字符串数组字段：
 * - 支持添加（回车 / 逗号分隔）、删除
 * - 支持上下移动调整顺序
 * - 单个标签长度上限由 maxLength 控制（默认 30，与后端 tags 约束一致）
 */
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    /** 单个标签最大长度 */
    maxLength?: number
    /** 最多几个标签 */
    max?: number
    /** 输入框占位 */
    placeholder?: string
  }>(),
  {
    maxLength: 30,
    max: 10,
    placeholder: '输入标签后回车添加',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: string[]): void
}>()

const draft = ref('')

const list = computed(() => props.modelValue ?? [])

function commit(raw: string) {
  const value = raw.trim()
  if (!value) return
  if (value.length > props.maxLength) {
    ElMessage.warning(`标签最长 ${props.maxLength} 个字符`)
    return
  }
  if (list.value.length >= props.max) {
    ElMessage.warning(`最多添加 ${props.max} 个标签`)
    return
  }
  if (list.value.includes(value)) {
    ElMessage.warning('标签已存在')
    return
  }
  emit('update:modelValue', [...list.value, value])
  draft.value = ''
}

function handleInput(raw: string) {
  // 支持逗号 / 顿号 / 空格分隔批量粘贴
  if (/[,，、]/.test(raw)) {
    raw.split(/[,，、]/).forEach((part) => commit(part))
    draft.value = ''
    return
  }
  draft.value = raw
}

function removeAt(index: number) {
  const next = [...list.value]
  next.splice(index, 1)
  emit('update:modelValue', next)
}

function moveUp(index: number) {
  if (index === 0) return
  const next = [...list.value]
  ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
  emit('update:modelValue', next)
}

function moveDown(index: number) {
  if (index === list.value.length - 1) return
  const next = [...list.value]
  ;[next[index + 1], next[index]] = [next[index], next[index + 1]]
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="tag-editor">
    <div class="tag-list">
      <span v-for="(tag, index) in list" :key="`${tag}-${index}`" class="tag-chip">
        <span class="tag-text">{{ tag }}</span>
        <button type="button" class="tag-move" title="上移" :disabled="index === 0" @click="moveUp(index)">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
        <button type="button" class="tag-move" title="下移" :disabled="index === list.length - 1" @click="moveDown(index)">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <button type="button" class="tag-remove" title="删除" @click="removeAt(index)">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </span>

      <span v-if="list.length === 0" class="tag-empty">暂无标签</span>
    </div>

    <el-input
      :model-value="draft"
      :placeholder="placeholder"
      maxlength="200"
      clearable
      class="tag-input"
      @update:model-value="handleInput"
      @keyup.enter="commit(draft)"
    />
  </div>
</template>

<style scoped>
.tag-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-height: 28px;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px 3px 10px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  color: #C2410C;
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.tag-text {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-move,
.tag-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #c2410c;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-move:hover:not(:disabled) {
  background: rgba(249, 115, 22, 0.22);
}

.tag-move:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.tag-remove:hover {
  background: #ef4444;
  color: #fff;
}

.tag-empty {
  font-size: 13px;
  color: #9ca3af;
}

.tag-input {
  max-width: 320px;
}
</style>
