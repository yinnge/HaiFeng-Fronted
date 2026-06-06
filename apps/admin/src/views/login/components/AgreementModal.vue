<!-- apps/admin/src/views/login/components/AgreementModal.vue -->
<script setup lang="ts">
defineProps<{
  visible: boolean
  type: 'user' | 'privacy'
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
    :title="type === 'user' ? '用户协议' : '隐私政策'"
    width="560px"
    @update:model-value="handleClose"
  >
    <div class="max-h-80 overflow-y-auto text-sm text-gray-600 leading-relaxed">
      <template v-if="type === 'user'">
        <h4 class="font-semibold text-gray-800 mb-2">1. 服务条款</h4>
        <p class="mb-4">
          欢迎使用海枫未来规划院服务。本协议是您与海枫未来规划院之间关于使用本平台服务的协议。
        </p>

        <h4 class="font-semibold text-gray-800 mb-2">2. 账号注册</h4>
        <p class="mb-4">
          您在注册账号时需要提供真实、准确的手机号码。您应妥善保管账号密码，因密码保管不善导致的损失由您自行承担。
        </p>

        <h4 class="font-semibold text-gray-800 mb-2">3. 服务说明</h4>
        <p class="mb-4">
          本平台提供的高考志愿填报、升学规划等服务仅供参考，最终决策请结合实际情况。
        </p>
      </template>

      <template v-else>
        <h4 class="font-semibold text-gray-800 mb-2">1. 信息收集</h4>
        <p class="mb-4">
          为提供志愿填报服务，我们需要收集您的手机号和微信号。我们承诺：
        </p>
        <ul class="list-disc list-inside mb-4 ml-2">
          <li>仅用于本平台服务</li>
          <li>不会泄露给第三方</li>
          <li>严格遵守数据保护法规</li>
        </ul>

        <h4 class="font-semibold text-gray-800 mb-2">2. 信息保护</h4>
        <p class="mb-4">
          我们采用业界标准的安全技术保护您的个人信息，防止未经授权的访问、使用或泄露。
        </p>

        <h4 class="font-semibold text-gray-800 mb-2">3. 免责声明</h4>
        <p>
          本平台所收集的信息仅用于提供服务，不承担因信息使用产生的法律责任。
        </p>
      </template>
    </div>
    <template #footer>
      <el-button type="primary" @click="handleClose">我已阅读并同意</el-button>
    </template>
  </el-dialog>
</template>
