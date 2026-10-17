<script setup lang="ts">
// apps/user/src/components/gaokao/ProvincePicker.vue
// 省份选择器：触发按钮只显示省份名（居中、无下拉箭头），
// 悬停/点击弹出 6 列网格省份面板（非一列下拉）。
// 选中项：文字 #C2410C + 浅橙背景；悬停浅橙。
// variant: 'bar' = 吸附条小按钮；'form' = 弹窗内表单输入框样式（更高、橙色边框）
import { ref, computed } from 'vue'
import { ProvinceOptions } from '@haifeng/shared'

const props = withDefaults(
  defineProps<{
    modelValue: string
    variant?: 'bar' | 'form'
    placeholder?: string
  }>(),
  { variant: 'bar', placeholder: '北京' },
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const popoverRef = ref()

const display = computed(() => props.modelValue || props.placeholder)

function pick(val: string) {
  emit('update:modelValue', val)
  // 选完收起面板
  popoverRef.value?.hide()
}
</script>

<template>
  <el-popover
    ref="popoverRef"
    placement="bottom-start"
    trigger="hover"
    :hide-after="120"
    :width="440"
    popper-class="province-popper"
  >
    <template #reference>
      <button
        type="button"
        class="pp-trigger"
        :class="variant === 'form' ? 'pp-trigger-form' : 'pp-trigger-bar'"
        :title="`当前省份：${display}`"
      >
        {{ display }}
      </button>
    </template>
    <div class="pp-grid">
      <button
        v-for="p in ProvinceOptions"
        :key="p.value"
        type="button"
        class="pp-cell"
        :class="{ 'pp-cell-active': p.value === modelValue }"
        @click="pick(p.value)"
      >
        {{ p.label }}
      </button>
    </div>
  </el-popover>
</template>

<style>
/* 非 scoped：popper 面板传送至 body，scoped 样式不生效 */

/* ===== 触发按钮 ===== */
.pp-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

/* 吸附条小按钮：与 chip 同档，文字居中、无箭头 */
.pp-trigger-bar {
  min-width: 76px;
  height: 34px;
  padding: 0 14px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 0 0 1.5px #f97316 inset;
  font-size: 14px;
  font-weight: 600;
  color: #c2410c;
}

.pp-trigger-bar:hover {
  box-shadow: 0 0 0 1.5px #ea580c inset;
  background: #fff7ed;
}

/* 弹窗表单输入框样式：高 44px、橙色系、文字居中 */
.pp-trigger-form {
  width: 100%;
  max-width: 220px;
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  background: #fff7ed;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.45) inset;
  font-size: 14px;
  font-weight: 600;
  color: #9a3412;
}

.pp-trigger-form:hover {
  box-shadow: 0 0 0 1.5px #f97316 inset;
}

/* ===== 6 列省份网格面板 ===== */
.province-popper {
  border-radius: 14px !important;
  padding: 12px !important;
}

.pp-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}

.pp-cell {
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  background: #fff;
  border: 1px solid rgba(249, 115, 22, 0.18);
  border-radius: 10px;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.pp-cell:hover {
  background: #fff7ed;
  border-color: #fb923c;
  color: #ea580c;
}

/* 选中：文字 #C2410C + 浅橙背景 + 橙边 */
.pp-cell-active,
.pp-cell-active:hover {
  background: #ffedd5;
  border-color: #f97316;
  color: #c2410c;
  font-weight: 700;
}
</style>
