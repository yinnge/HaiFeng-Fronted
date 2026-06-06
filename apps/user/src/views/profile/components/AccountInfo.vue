<!-- apps/user/src/views/profile/components/AccountInfo.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { MemberInfoVO, MemberInfoUpdateDTO, PasswordUpdateDTO } from '@/types/member/info'
import { updateMemberInfo, getWechatId, updateWechatId, updatePassword } from '@/api/member/info'

const props = defineProps<{
  memberInfo: MemberInfoVO | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const loading = ref(false)
const form = ref<MemberInfoUpdateDTO>({
  username: '',
  phone: '',
})

// 微信号相关
const wechatVisible = ref(false)
const wechatId = ref('')
const wechatLoading = ref(false)
const wechatEditing = ref(false)
const newWechatId = ref('')

// 密码相关
const passwordVisible = ref(false)
const passwordForm = ref<PasswordUpdateDTO>({
  oldPassword: '',
  newPassword: '',
})
const passwordLoading = ref(false)

// 监听 memberInfo 变化
watch(
  () => props.memberInfo,
  (val) => {
    if (val) {
      form.value = {
        username: val.username || '',
        phone: val.phone || '',
      }
    }
  },
  { immediate: true }
)

// 保存用户信息
async function handleSave() {
  loading.value = true
  try {
    await updateMemberInfo(form.value)
    ElMessage.success('保存成功')
    emit('refresh')
  } catch (err: any) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    loading.value = false
  }
}

// 查看微信号
async function handleViewWechat() {
  wechatLoading.value = true
  try {
    const { data } = await getWechatId()
    wechatId.value = data.data
    wechatVisible.value = true
    wechatEditing.value = false
  } catch (err: any) {
    ElMessage.error(err.message || '获取失败')
  } finally {
    wechatLoading.value = false
  }
}

// 修改微信号
async function handleSaveWechat() {
  if (!newWechatId.value) {
    ElMessage.warning('请输入微信号')
    return
  }
  wechatLoading.value = true
  try {
    await updateWechatId(newWechatId.value)
    ElMessage.success('微信号修改成功')
    wechatVisible.value = false
    emit('refresh')
  } catch (err: any) {
    ElMessage.error(err.message || '修改失败')
  } finally {
    wechatLoading.value = false
  }
}

// 打开修改密码弹窗
function handleOpenPassword() {
  passwordForm.value = { oldPassword: '', newPassword: '' }
  passwordVisible.value = true
}

// 修改密码
async function handleSavePassword() {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
    ElMessage.warning('请填写完整')
    return
  }
  if (passwordForm.value.newPassword.length < 6 || passwordForm.value.newPassword.length > 20) {
    ElMessage.warning('新密码长度需为6-20位')
    return
  }
  passwordLoading.value = true
  try {
    await updatePassword(passwordForm.value)
    ElMessage.success('密码修改成功')
    passwordVisible.value = false
  } catch (err: any) {
    ElMessage.error(err.message || '修改失败')
  } finally {
    passwordLoading.value = false
  }
}
</script>

<template>
  <div class="rounded-lg bg-white p-6">
    <el-form :model="form" label-width="100px" class="max-w-2xl">
      <el-form-item label="用户名">
        <el-input v-model="form.username" placeholder="请输入用户名" maxlength="50" />
      </el-form-item>

      <el-form-item label="手机号">
        <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" />
      </el-form-item>

      <el-form-item label="微信号">
        <div class="flex items-center gap-2">
          <span v-if="memberInfo?.hasWechat" class="text-gray-500">已绑定</span>
          <span v-else class="text-gray-400">未绑定</span>
          <el-button type="primary" link @click="handleViewWechat">
            查看/修改
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="密码">
        <el-button type="primary" link @click="handleOpenPassword">
          修改密码
        </el-button>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSave">
          保存修改
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 微信号弹窗 -->
    <el-dialog v-model="wechatVisible" title="微信号" width="400px">
      <div v-if="!wechatEditing">
        <p class="mb-4">当前微信号：<strong>{{ wechatId || '未绑定' }}</strong></p>
        <el-button type="primary" @click="wechatEditing = true; newWechatId = wechatId">
          修改微信号
        </el-button>
      </div>
      <div v-else>
        <el-input v-model="newWechatId" placeholder="请输入新微信号" maxlength="50" />
        <div class="mt-4 flex gap-2">
          <el-button type="primary" :loading="wechatLoading" @click="handleSaveWechat">
            保存
          </el-button>
          <el-button @click="wechatEditing = false">取消</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="passwordVisible" title="修改密码" width="400px">
      <el-form :model="passwordForm" label-width="80px">
        <el-form-item label="旧密码">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入旧密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码（6-20位）"
            show-password
            maxlength="20"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordVisible = false">取消</el-button>
        <el-button type="primary" :loading="passwordLoading" @click="handleSavePassword">
          确认修改
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
