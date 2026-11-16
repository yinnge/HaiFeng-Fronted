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
    :title="title()"
    width="520px"
    :close-on-click-modal="false"
    destroy-on-close
    append-to-body
    @update:model-value="onVisibleChange"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="86px">
      <el-form-item label="留言" prop="message">
        <el-input
          v-model="form.message"
          type="textarea"
          :rows="5"
          maxlength="1000"
          show-word-limit
          placeholder="请描述您想咨询的问题，老师会尽快回复您"
        />
      </el-form-item>
      <el-form-item label="微信号" prop="wechat">
        <el-input v-model="form.wechat" maxlength="64" placeholder="选填，方便老师添加您" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" maxlength="20" placeholder="必填，老师会电话联系您" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="close">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">提交留言</el-button>
    </template>
  </el-dialog>
</template>
