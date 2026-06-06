<!-- apps/admin/src/views/login/components/ForgotPasswordModal.vue -->
<script setup lang="ts">
defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
}>()

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="忘记密码"
    width="400px"
    @update:model-value="handleClose"
  >
    <div class="py-4 text-center">
      <p class="text-gray-600 mb-4">忘记密码请联系管理员：</p>
      <p class="text-xl font-semibold text-[#1e88e5]">13303575004</p>
    </div>
    <template #footer>
      <el-button type="primary" @click="handleClose">我知道了</el-button>
    </template>
  </el-dialog>
</template>
