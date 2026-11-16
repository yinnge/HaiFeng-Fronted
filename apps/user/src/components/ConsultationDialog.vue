<!-- apps/user/src/components/ConsultationDialog.vue -->
<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  submitInstitutionConsultation,
  submitPlannerConsultation,
} from '@/api/home'
import { useUserStore } from '@/store'
import type { ConsultationBizType } from '@/types/consultation'

const props = defineProps<{
  visible: boolean
  bizType: ConsultationBizType
  bizId: string
  bizName?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success', id: string): void
}>()

const userStore = useUserStore()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const form = reactive({
  message: '',
  wechat: '',
  phone: '',
})

const rules: FormRules = {
  message: [
    { required: true, message: '请输入留言内容', trigger: 'blur' },
    { max: 1000, message: '留言最长1000字', trigger: 'blur' },
  ],
  wechat: [{ max: 64, message: '微信号最长64字符', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
}

const title = () => {
  const target = props.bizName || (props.bizType === 'planner' ? '规划师' : '机构')
  return `给${target}留言`
}

watch(
  () => props.visible,
  (visible) => {
    if (!visible) return
    form.message = ''
    form.wechat = ''
    form.phone = userStore.userInfo?.phone || ''
    formRef.value?.clearValidate()
  },
)

function close() {
  emit('update:visible', false)
}

function onVisibleChange(value: boolean) {
  emit('update:visible', value)
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const payload = {
      message: form.message.trim(),
      wechat: form.wechat.trim() || undefined,
      phone: form.phone.trim(),
    }
    const api = props.bizType === 'planner'
      ? submitPlannerConsultation
      : submitInstitutionConsultation
    const res = await api(props.bizId, payload)
    ElMessage.success('留言已提交，老师会尽快联系您')
    emit('success', String(res.data.data ?? ''))
    close()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '提交失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    width="min(520px, 94vw)"
    class="hf-consult-dialog"
    :show-close="false"
    :close-on-click-modal="false"
    align-center
    destroy-on-close
    append-to-body
    @update:model-value="onVisibleChange"
  >
    <div class="hc-wrap">
      <button class="hc-close" type="button" aria-label="关闭" @click="close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>

      <header class="hc-head">
        <span class="hc-head-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.7 9.7 0 0 1-3.3-.6L3 21l1.7-4.6A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z" />
            <path d="M8.5 11.5h7M8.5 8h4" />
          </svg>
        </span>
        <div class="hc-head-text">
          <span class="hc-eyebrow">咨询留言 · 一对一回复</span>
          <h3 class="hc-title">{{ title() }}</h3>
          <p class="hc-sub">留下想咨询的问题和联系方式，老师会尽快与您联系</p>
        </div>
      </header>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="hc-form">
        <el-form-item label="想咨询的问题" prop="message">
          <el-input
            v-model="form.message"
            type="textarea"
            :rows="5"
            resize="none"
            maxlength="1000"
            show-word-limit
            placeholder="例如：目前成绩、目标院校/专业、想了解的训练形式……"
          />
        </el-form-item>
        <div class="hc-row">
          <el-form-item label="微信号" prop="wechat">
            <el-input v-model="form.wechat" maxlength="64" placeholder="选填，方便老师添加您" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" maxlength="20" placeholder="必填，老师会电话联系您" />
          </el-form-item>
        </div>
        <p class="hc-privacy">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
          联系方式仅用于本次咨询回复，不会公开展示
        </p>
      </el-form>

      <footer class="hc-foot">
        <button type="button" class="hc-btn hc-btn-ghost" @click="close">取消</button>
        <button type="button" class="hc-btn hc-btn-primary" :disabled="submitting" @click="submit">
          {{ submitting ? '提交中…' : '提交留言' }}
        </button>
      </footer>
    </div>
  </el-dialog>
</template>

<style>
/* 弹窗 teleport 到 body，scoped 的 :deep() 失效；统一用全局唯一类名前缀 */
.el-dialog.hf-consult-dialog {
  padding: 0 !important;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 24px 60px -24px rgba(15, 23, 42, 0.28);
}
.el-dialog.hf-consult-dialog .el-dialog__header {
  display: none;
}
.el-dialog.hf-consult-dialog .el-dialog__body {
  padding: 0;
}

.hf-consult-dialog .hc-wrap {
  position: relative;
  font-family: var(--hf-font-sans, inherit);
  color: #0f172a;
  background: #fff;
}
.hf-consult-dialog .hc-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.9);
  color: #64748b;
  cursor: pointer;
  transition: color 0.25s ease, background 0.25s ease, transform 0.3s ease;
}
.hf-consult-dialog .hc-close:hover {
  color: #1d4ed8;
  background: #eff6ff;
  transform: rotate(90deg);
}
.hf-consult-dialog .hc-close svg {
  width: 0.9rem;
  height: 0.9rem;
}

.hf-consult-dialog .hc-head {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 1.5rem 1.75rem 1.25rem;
  border-bottom: 1px solid #e8edf3;
  background: linear-gradient(135deg, #eff6ff 0%, #fff 78%);
}
.hf-consult-dialog .hc-head-icon {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.8rem;
  background: #2563eb;
  color: #fff;
  box-shadow: 0 8px 18px -10px rgba(37, 99, 235, 0.8);
}
.hf-consult-dialog .hc-head-icon svg {
  width: 1.3rem;
  height: 1.3rem;
}
.hf-consult-dialog .hc-head-text {
  min-width: 0;
  padding-right: 2rem;
}
.hf-consult-dialog .hc-eyebrow {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #2563eb;
}
.hf-consult-dialog .hc-title {
  margin-top: 0.28rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
}
.hf-consult-dialog .hc-sub {
  margin-top: 0.3rem;
  font-size: 0.78rem;
  line-height: 1.7;
  color: #64748b;
}

.hf-consult-dialog .hc-form {
  padding: 1.4rem 1.75rem 0;
}
.hf-consult-dialog .hc-form .el-form-item {
  margin-bottom: 1rem;
}
.hf-consult-dialog .hc-form .el-form-item__label {
  margin-bottom: 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  line-height: 1.4;
}
.hf-consult-dialog .hc-form .el-input__wrapper,
.hf-consult-dialog .hc-form .el-textarea__inner {
  border-radius: 0.65rem;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
  transition: box-shadow 0.2s ease;
}
.hf-consult-dialog .hc-form .el-input__wrapper:hover,
.hf-consult-dialog .hc-form .el-textarea__inner:hover {
  box-shadow: 0 0 0 1px #93c5fd inset;
}
.hf-consult-dialog .hc-form .el-input__wrapper.is-focus,
.hf-consult-dialog .hc-form .el-textarea__inner:focus {
  box-shadow: 0 0 0 1px #2563eb inset;
}
.hf-consult-dialog .hc-form .el-textarea__inner {
  min-height: 7.5rem;
  padding: 0.7rem 0.8rem;
  line-height: 1.7;
}
.hf-consult-dialog .hc-form .el-input__count {
  font-size: 0.7rem;
  color: #94a3b8;
}
.hf-consult-dialog .hc-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}
.hf-consult-dialog .hc-privacy {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0 0 0.25rem;
  font-size: 0.72rem;
  color: #94a3b8;
}
.hf-consult-dialog .hc-privacy svg {
  flex: none;
  width: 0.85rem;
  height: 0.85rem;
}

.hf-consult-dialog .hc-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 1.1rem 1.75rem 1.5rem;
}
.hf-consult-dialog .hc-btn {
  padding: 0.55rem 1.4rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}
.hf-consult-dialog .hc-btn-ghost {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
}
.hf-consult-dialog .hc-btn-ghost:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}
.hf-consult-dialog .hc-btn-primary {
  border: 1px solid transparent;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  box-shadow: 0 8px 18px -8px rgba(37, 99, 235, 0.7);
}
.hf-consult-dialog .hc-btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 22px -8px rgba(37, 99, 235, 0.75);
}
.hf-consult-dialog .hc-btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 560px) {
  .hf-consult-dialog .hc-head,
  .hf-consult-dialog .hc-form {
    padding-left: 1.15rem;
    padding-right: 1.15rem;
  }
  .hf-consult-dialog .hc-foot {
    padding-left: 1.15rem;
    padding-right: 1.15rem;
  }
  .hf-consult-dialog .hc-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
