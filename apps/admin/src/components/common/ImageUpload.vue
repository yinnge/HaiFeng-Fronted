<script setup lang="ts">
/**
 * 图片上传组件（管理端通用）
 *
 * - 双模式：「上传到服务器」/「填写图片链接」可切换
 * - 单图（v-model:modelValue = string）与多图（v-model:modelValues = string[]）两种形态
 * - 上传默认走 /api/v1/admin/common/upload（haifeng/images/ 前缀）；业务可用 uploadFn 改走专用前缀
 * - 后端限制：仅 png / jpg / jpeg / webp / svg，单张 ≤ 2MB（前端同款校验，先拦一道）
 *
 * 注意：图片链接格式须为 http(s):// 开头或 / 开头的相对路径，
 * 与后端 InstitutionAddDTO 的 @Pattern 约束保持一致。
 */
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadRequestOptions } from 'element-plus'
import type { AxiosResponse } from 'axios'
import type { R } from '@haifeng/shared'
import { uploadImage, type ImageUploadVO } from '@/api/common/upload'

/** 自定义上传函数；不传则走默认 /common/upload（规划师头像等沿用） */
export type ImageUploadFn = (file: File) => Promise<AxiosResponse<R<ImageUploadVO>>>

const props = withDefaults(
  defineProps<{
    /** 单图模式的值 */
    modelValue?: string
    /** 多图模式的值 */
    modelValues?: string[]
    /** 单图模式：是否允许手动填写链接 */
    allowManual?: boolean
    /** 多图模式：最多几张 */
    max?: number
    /** 占位提示 */
    placeholder?: string
    /** 预览尺寸（px） */
    previewSize?: number
    /** 自定义上传端点（业务专用前缀 / bucket）；不传走通用上传 */
    uploadFn?: ImageUploadFn
  }>(),
  {
    modelValue: '',
    allowManual: true,
    max: 10,
    placeholder: '请上传或填写图片链接',
    previewSize: 72,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'update:modelValues', v: string[]): void
  /**
   * 真实上传成功（仅 upload 接口，手填链接不触发）。
   * 供父级追踪「上传了但可能没被保存」的图片，关闭弹窗时回收孤儿图。
   */
  (e: 'uploaded', url: string): void
}>()

/** 是否多图模式：只有父组件显式传了 model-values 才是多图（不能靠默认值判断） */
const isMulti = computed(() => props.modelValues !== undefined)

const uploading = ref(false)
/** 单图模式当前处于哪个模式 */
const singleMode = ref<'upload' | 'manual'>('upload')
/** 多图模式当前处于哪个模式 */
const multiMode = ref<'upload' | 'manual'>('upload')
/** 多图模式下的手填链接 */
const manualUrl = ref('')

/** 后端白名单，前端同款校验（先拦一道，减少无效请求） */
const ACCEPT = '.png,.jpg,.jpeg,.webp,.svg'
const MAX_SIZE = 2 * 1024 * 1024

const list = computed<string[]>(() => props.modelValues ?? [])

function isValidUrl(url: string): boolean {
  if (!url) return false
  return /^(https?:\/\/|\/)/i.test(url.trim())
}

function emitList(list: string[]) {
  if (isMulti.value) {
    emit('update:modelValues', list)
  } else {
    emit('update:modelValue', list[0] ?? '')
  }
}

function handleUpload(options: UploadRequestOptions) {
  const file = options.file
  const rawName = (file as File)?.name || ''
  const ext = rawName.slice(rawName.lastIndexOf('.')).toLowerCase()
  if (!ACCEPT.includes(ext)) {
    ElMessage.warning('仅支持 png / jpg / jpeg / webp / svg 格式')
    return Promise.reject(new Error('文件类型不支持'))
  }
  if (file.size > MAX_SIZE) {
    ElMessage.warning('图片大小不能超过 2MB')
    return Promise.reject(new Error('图片过大'))
  }

  uploading.value = true
  const doUpload = props.uploadFn ?? uploadImage
  return doUpload(file as File)
    .then((res) => {
      const url = res.data.data?.url
      if (!url) {
        ElMessage.error('上传失败：未返回图片地址')
        return
      }
      // 图片已落到 OSS，先记账供父级在关闭弹窗时回收「传了但没保存」的孤儿图。
      // 必须放在所有 return 之前：多图超出 max 被丢弃的那张同样已上传，也要能被回收。
      emit('uploaded', url)
      if (isMulti.value) {
        if (list.value.length >= props.max) {
          ElMessage.warning(`最多上传 ${props.max} 张`)
          return
        }
        emit('update:modelValues', [...list.value, url])
      } else {
        emit('update:modelValue', url)
      }
      ElMessage.success('上传成功')
    })
    .catch((e: any) => {
      ElMessage.error(e?.response?.data?.msg || e?.message || '图片上传失败')
      throw e
    })
    .finally(() => {
      uploading.value = false
    })
}

function handleManualConfirm() {
  const url = manualUrl.value.trim()
  if (!url) {
    ElMessage.warning('请填写图片链接')
    return
  }
  if (!isValidUrl(url)) {
    ElMessage.warning('图片链接须以 http(s):// 开头或以 / 开头')
    return
  }
  if (isMulti.value) {
    if (list.value.length >= props.max) {
      ElMessage.warning(`最多上传 ${props.max} 张`)
      return
    }
    emit('update:modelValues', [...list.value, url])
  } else {
    emit('update:modelValue', url)
  }
  manualUrl.value = ''
}

function removeAt(index: number) {
  const next = [...list.value]
  next.splice(index, 1)
  emit('update:modelValues', next)
}

function clearSingle() {
  emit('update:modelValue', '')
}
</script>

<template>
  <!-- 单图模式 -->
  <div v-if="!isMulti" class="iu-single">
    <div class="iu-single-main">
      <div class="iu-preview">
        <el-image
          v-if="modelValue"
          :src="modelValue"
          :preview-src-list="[modelValue]"
          preview-teleported
          fit="cover"
          class="iu-preview-img"
          :style="{ width: `${previewSize}px`, height: `${previewSize}px` }"
        />
        <div v-else class="iu-placeholder" :style="{ width: `${previewSize}px`, height: `${previewSize}px` }">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.5-3.5L6 23" />
          </svg>
          <span>暂无图片</span>
        </div>
        <button v-if="modelValue" type="button" class="iu-clear" title="清除图片" @click="clearSingle">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="iu-ops">
        <el-upload
          v-if="singleMode === 'upload'"
          :show-file-list="false"
          :accept="ACCEPT"
          :http-request="handleUpload"
          :disabled="uploading"
        >
          <button type="button" class="iu-btn iu-btn-primary" :disabled="uploading">
            {{ uploading ? '上传中…' : '上传图片' }}
          </button>
        </el-upload>

        <div v-else class="iu-manual">
          <el-input
            v-model="manualUrl"
            placeholder="粘贴图片地址：https://… 或 /static/…"
            clearable
            @keyup.enter="handleManualConfirm"
          />
          <button type="button" class="iu-btn iu-btn-primary" @click="handleManualConfirm">确定</button>
        </div>

        <div v-if="allowManual" class="iu-seg" role="group" aria-label="图片添加方式">
          <button
            type="button"
            class="iu-seg-btn"
            :class="{ 'is-active': singleMode === 'upload' }"
            @click="singleMode = 'upload'"
          >上传</button>
          <button
            type="button"
            class="iu-seg-btn"
            :class="{ 'is-active': singleMode === 'manual' }"
            @click="singleMode = 'manual'"
          >链接</button>
        </div>
      </div>
    </div>
    <p v-if="placeholder" class="iu-tip">{{ placeholder }}</p>
  </div>

  <!-- 多图模式 -->
  <div v-else class="iu-multi">
    <div class="iu-multi-head">
      <div v-if="allowManual" class="iu-seg" role="group" aria-label="图片添加方式">
        <button
          type="button"
          class="iu-seg-btn"
          :class="{ 'is-active': multiMode === 'upload' }"
          @click="multiMode = 'upload'"
        >上传</button>
        <button
          type="button"
          class="iu-seg-btn"
          :class="{ 'is-active': multiMode === 'manual' }"
          @click="multiMode = 'manual'"
        >链接</button>
      </div>
      <span class="iu-count">已添加 {{ list.length }} / {{ max }} 张</span>
    </div>

    <div v-if="multiMode === 'manual'" class="iu-manual iu-manual-multi">
      <el-input
        v-model="manualUrl"
        placeholder="粘贴图片地址：https://… 或 /static/…，回车或点击添加"
        clearable
        @keyup.enter="handleManualConfirm"
      />
      <button
        type="button"
        class="iu-btn iu-btn-primary"
        :disabled="list.length >= max"
        @click="handleManualConfirm"
      >添加链接</button>
    </div>

    <div class="iu-multi-list">
      <div v-for="(url, index) in list" :key="`${url}-${index}`" class="iu-multi-item">
        <el-image
          :src="url"
          :preview-src-list="list"
          preview-teleported
          fit="cover"
          class="iu-preview-img"
          :style="{ width: `${previewSize}px`, height: `${previewSize}px` }"
        />
        <button type="button" class="iu-clear" title="移除" @click="removeAt(index)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div
        v-if="multiMode === 'upload' && list.length < max"
        class="iu-multi-add"
        :style="{ width: `${previewSize}px`, height: `${previewSize}px` }"
      >
        <el-upload
          :show-file-list="false"
          :accept="ACCEPT"
          :http-request="handleUpload"
          :disabled="uploading"
        >
          <div class="iu-multi-add-inner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>{{ uploading ? '上传中…' : '添加' }}</span>
          </div>
        </el-upload>
      </div>
    </div>
    <p v-if="placeholder" class="iu-tip">{{ placeholder }}</p>
  </div>
</template>

<style scoped>
.iu-single {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.iu-preview {
  position: relative;
  display: inline-flex;
  width: fit-content;
}

.iu-preview-img {
  border-radius: 10px;
  border: 1px solid rgba(249, 115, 22, 0.18);
  background: #f9fafb;
}

.iu-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 1px dashed rgba(249, 115, 22, 0.3);
  border-radius: 10px;
  background: rgba(249, 115, 22, 0.03);
  color: #c2410c;
  font-size: 12px;
}

.iu-clear {
  position: absolute;
  top: -6px;
  right: -6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.iu-clear:hover {
  background: #dc2626;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.35);
}

.iu-single-main {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.iu-ops {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}

.iu-manual {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 200px;
}

.iu-manual :deep(.el-input) {
  flex: 1;
  min-width: 0;
}

/* 上传 / 链接 分段切换：替代原先孤立的「改用图片链接」按钮 */
.iu-ops .iu-seg {
  margin-left: auto;
}

.iu-seg {
  display: inline-flex;
  flex-shrink: 0;
  padding: 3px;
  background: #fff7ed;
  border: 1px solid rgba(249, 115, 22, 0.18);
  border-radius: 999px;
}

.iu-seg-btn {
  padding: 4px 13px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: #9a3412;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

.iu-seg-btn:hover:not(.is-active) {
  background: rgba(249, 115, 22, 0.08);
}

.iu-seg-btn.is-active {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  box-shadow: 0 1px 4px rgba(249, 115, 22, 0.25);
}

.iu-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

.iu-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.iu-btn-primary {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.iu-btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.iu-tip {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.6;
}

.iu-multi {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.iu-multi-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.iu-multi-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.iu-multi-item {
  position: relative;
  display: inline-flex;
}

.iu-multi-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(249, 115, 22, 0.35);
  border-radius: 10px;
  background: rgba(249, 115, 22, 0.03);
  overflow: hidden;
  transition: all 0.2s ease;
}

.iu-multi-add:hover {
  border-color: rgba(249, 115, 22, 0.6);
  background: rgba(249, 115, 22, 0.07);
}

.iu-multi-add :deep(.el-upload) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.iu-multi-add-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 100%;
  color: #c2410c;
  font-size: 12px;
  cursor: pointer;
}

.iu-count {
  padding: 4px 10px;
  border-radius: 999px;
  background: #f9fafb;
  color: #9ca3af;
  font-size: 12px;
  white-space: nowrap;
}
</style>
