<!-- apps/user/src/views/profile/components/AvatarSelector.vue -->
<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { updateAvatar, uploadAvatar } from '@/api/member/info'

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
  /** 历史上传的自定义头像 URL；当前用内置头像时也会传入，供用户切回 */
  customAvatar?: string
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

const ALLOWED_TYPES = ['image/png', 'image/jpeg']
const MAX_FILE_SIZE = 2 * 1024 * 1024

const selectedAvatar = ref(props.currentAvatar || '')
const pendingFile = ref<File | null>(null)
const previewUrl = ref('')
const uploading = ref(false)
const submitting = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})

function releasePreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
}

// 每次打开都从最新资料重置，避免上一次未提交的本地预览残留
watch(
  () => props.visible,
  (visible) => {
    if (!visible) return
    releasePreview()
    pendingFile.value = null
    selectedAvatar.value = props.currentAvatar || ''
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
)

function openFilePicker() {
  if (uploading.value || submitting.value) return
  fileInputRef.value?.click()
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // 允许重复选择同一个文件
  if (!file) return
  if (!ALLOWED_TYPES.includes(file.type)) {
    ElMessage.warning('头像仅支持 JPG / PNG 格式')
    return
  }
  if (file.size > MAX_FILE_SIZE) {
    ElMessage.warning('头像大小不能超过 2MB')
    return
  }

  releasePreview()
  pendingFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  selectedAvatar.value = ''
}

function selectPreset(url: string) {
  if (pendingFile.value) {
    releasePreview()
    pendingFile.value = null
  }
  selectedAvatar.value = url
}

async function handleConfirm() {
  if (uploading.value || submitting.value) return

  // 新上传的文件：后端校验像素、写入 OSS 并直接把当前头像改为新 URL
  if (pendingFile.value) {
    uploading.value = true
    try {
      await uploadAvatar(pendingFile.value)
      ElMessage.success('头像上传成功')
      pendingFile.value = null
      releasePreview()
      emit('updated')
      isVisible.value = false
    } catch (err: any) {
      ElMessage.error(err.message || '上传失败')
    } finally {
      uploading.value = false
    }
    return
  }

  // 内置静态头像 / 切回历史上传头像：只改头像 URL，不删除 OSS 上的自定义头像
  if (!selectedAvatar.value) {
    ElMessage.warning('请选择或上传一个头像')
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

onBeforeUnmount(releasePreview)
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
      <!-- 上传自定义头像 -->
      <div
        class="avatar-option upload-option"
        :class="{ active: !!pendingFile }"
        @click="openFilePicker"
      >
        <img v-if="previewUrl" :src="previewUrl" alt="头像预览" />
        <div v-else class="upload-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>上传头像</span>
        </div>
        <div v-if="pendingFile" class="upload-check">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <!-- 历史上传的自定义头像：即使当前用内置头像也保留，可随时切回 -->
      <div
        v-if="customAvatar"
        class="avatar-option"
        :class="{ active: !pendingFile && selectedAvatar === customAvatar }"
        @click="selectPreset(customAvatar)"
      >
        <img :src="customAvatar" alt="我的头像" />
        <span class="my-badge">我的头像</span>
        <div v-if="!pendingFile && selectedAvatar === customAvatar" class="check-overlay">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <!-- 内置静态头像 -->
      <div
        v-for="item in avatarList"
        :key="item.id"
        class="avatar-option"
        :class="{ active: !pendingFile && selectedAvatar === item.url }"
        @click="selectPreset(item.url)"
      >
        <img :src="item.url" alt="头像" />
        <div v-if="!pendingFile && selectedAvatar === item.url" class="check-overlay">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
    </div>

    <p class="avatar-hint">
      自定义头像支持 JPG / PNG、不超过 2MB、边长 64～2048px；切换到内置头像不会删除已上传的头像，可随时切回。
    </p>

    <input
      ref="fileInputRef"
      type="file"
      accept="image/png,image/jpeg"
      class="avatar-file-input"
      @change="handleFileChange"
    />

    <template #footer>
      <el-button :disabled="uploading || submitting" @click="isVisible = false">取消</el-button>
      <el-button type="primary" :loading="uploading || submitting" @click="handleConfirm">
        {{ pendingFile ? '上传并应用' : '确认修改' }}
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

.upload-option {
  border-style: dashed;
  border-color: rgba(249, 115, 22, 0.45);
  background: rgba(249, 115, 22, 0.05);
}

.upload-option.active {
  border-style: solid;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 100%;
  color: #c2410c;
  font-size: 12px;
}

.upload-placeholder svg {
  width: 22px;
  height: 22px;
}

.upload-check {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #F97316;
  color: #fff;
}

.upload-check svg {
  width: 12px;
  height: 12px;
}

.my-badge {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
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

.avatar-hint {
  margin: 4px 0 0;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.6;
}

.avatar-file-input {
  display: none;
}
</style>
