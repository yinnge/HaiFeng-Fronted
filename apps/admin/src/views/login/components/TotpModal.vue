<!-- apps/admin/src/views/login/components/TotpModal.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  visible: boolean
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', code: string): void
}>()

const totpCode = ref('')

const handleConfirm = () => {
  if (totpCode.value.length === 6) {
    emit('confirm', totpCode.value)
  }
}

const handleClose = () => {
  totpCode.value = ''
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="二次验证"
    width="400px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <div class="py-4">
      <p class="text-gray-600 text-sm mb-4">
        请输入您的身份验证器 App 中显示的 6 位动态验证码
      </p>
      <el-input
        v-model="totpCode"
        placeholder="请输入 6 位验证码"
        maxlength="6"
        size="large"
        class="text-center"
        @keyup.enter="handleConfirm"
      />
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button
        type="primary"
        :loading="loading"
        :disabled="totpCode.length !== 6"
        @click="handleConfirm"
      >
        确认
      </el-button>
    </template>
  </el-dialog>
</template>
