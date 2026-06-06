<!-- apps/admin/src/components/ExitConfirmModal.vue -->
<script setup lang="ts">
defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'cancel'): void
  (e: 'discard'): void
  (e: 'save'): void
}>()

const handleClose = () => {
  emit('update:visible', false)
  emit('cancel')
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title=""
    width="420px"
    :show-close="false"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <div class="text-center py-4">
      <div class="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-2xl">⚠️</span>
      </div>
      <h3 class="text-lg font-medium text-gray-800 mb-2">确认退出？</h3>
      <p class="text-sm text-gray-500">您有未保存的修改，确定要退出吗？</p>
    </div>
    <template #footer>
      <div class="flex justify-center gap-3">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="danger" @click="emit('discard')">不保存退出</el-button>
        <el-button type="primary" @click="emit('save')">保存并退出</el-button>
      </div>
    </template>
  </el-dialog>
</template>
