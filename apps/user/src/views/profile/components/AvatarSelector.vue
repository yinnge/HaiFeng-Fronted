<!-- apps/user/src/views/profile/components/AvatarSelector.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { updateAvatar } from '@/api/member/info'

import avatar1 from '@/assets/images/avatars/avatar-1.svg'
import avatar2 from '@/assets/images/avatars/avatar-2.svg'
import avatar3 from '@/assets/images/avatars/avatar-3.svg'
import avatar4 from '@/assets/images/avatars/avatar-4.svg'
import avatar5 from '@/assets/images/avatars/avatar-5.svg'
import avatar6 from '@/assets/images/avatars/avatar-6.svg'
import avatar7 from '@/assets/images/avatars/avatar-7.svg'
import avatar8 from '@/assets/images/avatars/avatar-8.svg'

const props = defineProps<{
  visible: boolean
  currentAvatar?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'updated'): void
}>()

const avatarList = [
  { id: 1, url: avatar1 },
  { id: 2, url: avatar2 },
  { id: 3, url: avatar3 },
  { id: 4, url: avatar4 },
  { id: 5, url: avatar5 },
  { id: 6, url: avatar6 },
  { id: 7, url: avatar7 },
  { id: 8, url: avatar8 },
]

const selectedAvatar = ref(props.currentAvatar || '')
const submitting = ref(false)

const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

function handleSelect(url: string) {
  selectedAvatar.value = url
}

async function handleConfirm() {
  if (!selectedAvatar.value) {
    ElMessage.warning('请选择一个头像')
    return
  }
  submitting.value = true
  try {
    await updateAvatar(selectedAvatar.value)
    ElMessage.success('头像修改成功')
    emit('updated')
    isVisible.value = false
  } catch (err: any) {
    ElMessage.error(err.message || '修改失败')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <ElDialog
    v-model="isVisible"
    title="选择头像"
    width="480px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="avatar-grid">
      <div
        v-for="item in avatarList"
        :key="item.id"
        class="avatar-option"
        :class="{ active: selectedAvatar === item.url }"
        @click="handleSelect(item.url)"
      >
        <img :src="item.url" alt="头像" />
        <div v-if="selectedAvatar === item.url" class="check-overlay">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="isVisible = false">取消</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="handleConfirm"
      >
        确认修改
      </el-button>
    </template>
  </ElDialog>
</template>

<style scoped>
.avatar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 12px 0;
}

.avatar-option {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  aspect-ratio: 1;
  border: 3px solid transparent;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.avatar-option:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.2);
}

.avatar-option.active {
  border-color: #F97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.3);
}

.avatar-option img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.check-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(249, 115, 22, 0.7);
  color: white;
}

.check-overlay svg {
  width: 28px;
  height: 28px;
}
</style>
