<script setup lang="ts">
// apps/user/src/components/gaokao/ProvincePicker.vue
// 省份选择器：触发按钮只显示省份名（居中、无下拉箭头），
// 悬停/点击弹出 6 列网格省份面板（非一列下拉）。
// 选中项：蓝色文字 + 浅蓝背景；悬停浅蓝。
// variant: 'bar' = 吸附条小按钮；'form' = 弹窗内表单输入框样式（更高、中性边框）
import { ref, computed } from 'vue'
import { ProvinceOptions } from '@haifeng/shared'

const props = withDefaults(
  defineProps<{
    modelValue: string
    variant?: 'bar' | 'form'
    placeholder?: string
    /** 面板最前面是否加「全国」格（值为空串）；搜索框场景用 */
    national?: boolean
    /**
     * 禁用（不可切换）：登录用户保存档案后省份锁定时置 true。
     * 禁用态按钮置灰、hover 提示「省份已确认，不可修改」。
     */
    disabled?: boolean
  }>(),
  { variant: 'bar', placeholder: '北京', national: false, disabled: false },
)

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const popoverRef = ref()

const display = computed(() => props.modelValue || props.placeholder)

/** 面板格子：national 时最前面插入「全国」（value=''，选中后 modelValue 为空串） */
const cells = computed(() =>
  props.national ? [{ value: '', label: '全国' }, ...ProvinceOptions] : ProvinceOptions,
)

function pick(val: string) {
  if (props.disabled) return
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
    :width="476"
    :disabled="disabled"
    popper-class="province-popper"
  >
    <template #reference>
      <button
        type="button"
        class="pp-trigger"
        :class="[variant === 'form' ? 'pp-trigger-form' : 'pp-trigger-bar', { 'is-disabled': disabled }]"
        :disabled="disabled"
        :title="disabled ? '省份已确认，不可修改' : `当前省份：${display}`"
      >
        <svg v-if="variant === 'form'" class="pp-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {{ display }}
      </button>
    </template>
    <div class="pp-grid">
      <button
        v-for="p in cells"
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
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 0 0 1px var(--neutral-border-strong) inset;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.pp-trigger-bar:hover {
  background: var(--sem-blue-bg);
  box-shadow: 0 0 0 1.5px rgba(59, 130, 246, 0.45) inset;
  color: var(--sem-blue);
}

/* 弹窗表单输入框样式：高 44px、中性底、图标+省份名整体居中 */
.pp-trigger-form {
  width: 100%;
  max-width: 220px;
  height: 44px;
  padding: 0 14px;
  gap: 6px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 0 0 1px var(--neutral-border-strong) inset;
  font-size: 16px;
  font-weight: 600;
  color: #334155;
}

/* form 变体内的定位图标（与其它选项框前缀图标同款） */
.pp-ico {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
  color: var(--sem-blue);
}

.pp-trigger-form:hover {
  background: var(--sem-blue-bg);
  box-shadow: 0 0 0 1.5px rgba(59, 130, 246, 0.45) inset;
  color: var(--sem-blue);
}

/* ===== 禁用态（省份已锁定）：置灰 + 禁止 hover 反馈 ===== */
.pp-trigger.is-disabled,
.pp-trigger.is-disabled:hover {
  background: #f1f5f9;
  box-shadow: 0 0 0 1px var(--neutral-border) inset;
  color: #94a3b8;
  cursor: not-allowed;
}

/* ===== 6 列省份网格面板 ===== */
.province-popper {
  border-radius: 14px !important;
  padding: 12px !important;
}

.pp-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px 12px; /* 行距不变、列距翻倍 */
}

.pp-cell {
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  background: #fff;
  border: 1px solid var(--neutral-border);
  border-radius: 10px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.pp-cell:hover {
  background: var(--sem-blue-bg);
  border-color: var(--sem-blue-soft);
  color: var(--sem-blue);
}

.pp-cell-active,
.pp-cell-active:hover {
  background: var(--sem-blue-bg);
  border-color: var(--sem-blue);
  color: var(--sem-blue);
  font-weight: 700;
}
</style>
