<!-- apps/admin/src/views/login/components/TotpModal.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  visible: boolean
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', code: string): void
}>()

const totpCode = ref('')

watch(() => props.visible, (val) => {
  if (!val) totpCode.value = ''
})

const handleConfirm = () => {
  if (totpCode.value.length === 6) {
    emit('confirm', totpCode.value)
  }
}

const handleClose = () => {
  totpCode.value = ''
  emit('update:visible', false)
}

const handleBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) handleClose()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="totp-modal">
      <div
        v-if="visible"
        class="totp-overlay"
        @click="handleBackdropClick"
      >
        <div class="totp-dialog">
          <!-- 流光边框 -->
          <div class="totp-beam totp-beam-1" />
          <div class="totp-beam totp-beam-2" />

          <!-- 内部高光 -->
          <div class="totp-highlight" />

          <!-- 标题区 -->
          <div class="totp-header">
            <div class="totp-header-icon">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="totp-title">二次验证</h3>
            <p class="totp-subtitle">请输入您的身份验证器 App 中显示的 6 位动态验证码</p>
          </div>

          <!-- 输入区 -->
          <div class="totp-body">
            <div class="totp-input-wrapper">
              <input
                v-model="totpCode"
                type="text"
                inputmode="numeric"
                maxlength="6"
                placeholder="请输入 6 位验证码"
                class="totp-input"
                autofocus
                @keyup.enter="handleConfirm"
              />
            </div>
          </div>

          <!-- 按钮区 -->
          <div class="totp-footer">
            <button type="button" class="totp-btn totp-btn-cancel" @click="handleClose">
              取消
            </button>
            <button
              type="button"
              class="totp-btn totp-btn-confirm"
              :disabled="loading || totpCode.length !== 6"
              @click="handleConfirm"
            >
              <span v-if="loading" class="totp-spinner" />
              <span>确认</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 遮罩层 */
.totp-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

/* 弹框主体 */
.totp-dialog {
  position: relative;
  width: 400px;
  max-width: 90vw;
  border-radius: 16px;
  padding: 32px;
  overflow: hidden;
  background: linear-gradient(
    165deg,
    rgba(255, 255, 255, 0.97) 0%,
    rgba(254, 252, 250, 0.95) 30%,
    rgba(253, 248, 242, 0.93) 60%,
    rgba(252, 245, 235, 0.95) 100%
  );
  backdrop-filter: blur(20px);
  box-shadow:
    0 25px 50px -15px rgba(191, 138, 48, 0.3),
    0 15px 30px -10px rgba(232, 114, 42, 0.15),
    inset 0 2px 6px rgba(255, 255, 255, 0.9),
    inset 0 -1px 4px rgba(191, 138, 48, 0.05);
  border: 1px solid rgba(212, 168, 90, 0.35);
}

/* 流光边框 - 复用登录卡片的双层金色效果 */
.totp-beam {
  position: absolute;
  inset: -1px;
  border-radius: 16px;
  pointer-events: none;
  z-index: 1;
}

.totp-beam-1 {
  background: conic-gradient(
    from 0deg,
    transparent 0%,
    #fbbf24 10%,
    #fde68a 15%,
    transparent 20%
  );
  animation: totp-spin 5s linear infinite;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  padding: 2px;
  opacity: 0.7;
}

.totp-beam-2 {
  background: conic-gradient(
    from 180deg,
    transparent 0%,
    #f59e0b 10%,
    #fbbf24 15%,
    transparent 20%
  );
  animation: totp-spin 5s linear infinite;
  animation-delay: -2.5s;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  padding: 2px;
  opacity: 0.5;
}

@keyframes totp-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 内部高光 */
.totp-highlight {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  background:
    linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 0%, transparent 35%),
    linear-gradient(to right, rgba(255, 255, 255, 0.2) 0%, transparent 15%);
}

/* 标题区 */
.totp-header {
  position: relative;
  z-index: 10;
  text-align: center;
  margin-bottom: 24px;
}

.totp-header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, rgba(191, 138, 48, 0.1), rgba(251, 191, 36, 0.08));
  border: 1px solid rgba(191, 138, 48, 0.2);
  color: #bf8a30;
}

.totp-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #9a7a2e, #bf8a30, #d4a85a, #fbbf24, #d4a85a);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: title-gradient 4s ease infinite;
}

@keyframes title-gradient {
  0%, 100% { background-position: 0% center; }
  50% { background-position: 100% center; }
}

.totp-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* 输入区 */
.totp-body {
  position: relative;
  z-index: 10;
  margin-bottom: 24px;
}

.totp-input-wrapper {
  position: relative;
}

.totp-input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: 0.3em;
  text-align: center;
  color: #374151;
  background: #f8f6f3;
  border: 1.5px solid rgba(191, 138, 48, 0.2);
  border-radius: 10px;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.totp-input::placeholder {
  letter-spacing: 0.05em;
  font-weight: 400;
  color: #9ca3af;
}

.totp-input:focus {
  border-color: #bf8a30;
  box-shadow: 0 0 0 3px rgba(191, 138, 48, 0.12);
}

/* 按钮区 */
.totp-footer {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.totp-btn {
  height: 40px;
  padding: 0 20px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.totp-btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.totp-btn-cancel:hover {
  background: #e5e7eb;
}

.totp-btn-confirm {
  color: white;
  background: linear-gradient(
    135deg,
    #d4a85a 0%,
    #bf8a30 30%,
    #a67c28 50%,
    #bf8a30 70%,
    #d4a85a 100%
  );
  background-size: 200% auto;
  box-shadow: 0 4px 12px rgba(191, 138, 48, 0.35);
}

.totp-btn-confirm:hover:not(:disabled) {
  background-position: right center;
  box-shadow: 0 6px 16px rgba(191, 138, 48, 0.45);
  transform: translateY(-1px);
}

.totp-btn-confirm:active:not(:disabled) {
  transform: translateY(0);
}

.totp-btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.totp-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 弹框过渡动画 */
.totp-modal-enter-active,
.totp-modal-leave-active {
  transition: opacity 0.25s ease;
}

.totp-modal-enter-active .totp-dialog,
.totp-modal-leave-active .totp-dialog {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.totp-modal-enter-from,
.totp-modal-leave-to {
  opacity: 0;
}

.totp-modal-enter-from .totp-dialog {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

.totp-modal-leave-to .totp-dialog {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>
