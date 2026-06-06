<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getUserDetail, getUserWechat } from '@/api/user'
import { MemberTypeLabel, MemberTypeTag } from '@haifeng/shared'
import type { MemberDetailVO, MemberListVO } from '@/types/user'

const props = defineProps<{
  visible: boolean
  user: MemberListVO | null
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
}>()

const loading = ref(false)
const detail = ref<MemberDetailVO | null>(null)
const wechatPlaintext = ref<string | null>(null)
const loadingWechat = ref(false)

watch(
  () => props.visible,
  async (val) => {
    if (val && props.user) {
      wechatPlaintext.value = null
      loading.value = true
      try {
        const res = await getUserDetail(props.user.id)
        if (res.data.code === 200) {
          detail.value = res.data.data
        }
      } catch (error) {
        console.error('获取用户详情失败:', error)
      } finally {
        loading.value = false
      }
    }
  }
)

const handleViewWechat = async () => {
  if (!detail.value) return
  loadingWechat.value = true
  try {
    const res = await getUserWechat(detail.value.id)
    if (res.data.code === 200) {
      wechatPlaintext.value = res.data.data
    } else {
      ElMessage.error(res.data.msg || '获取微信号失败')
    }
  } catch (error) {
    console.error('获取微信明文失败:', error)
    ElMessage.error('获取微信号失败')
  } finally {
    loadingWechat.value = false
  }
}

const handleClose = () => {
  emit('update:visible', false)
  detail.value = null
  wechatPlaintext.value = null
}

const formatMoney = (val: number) => val?.toFixed(2) || '0.00'
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="用户详情"
    width="700px"
    @close="handleClose"
  >
    <div v-loading="loading">
      <el-descriptions :column="2" border v-if="detail">
        <el-descriptions-item label="用户 ID">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ detail.username }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detail.phone }}</el-descriptions-item>
        <el-descriptions-item label="邀请码">{{ detail.inviteCode }}</el-descriptions-item>
        <el-descriptions-item label="会员类型">
          <el-tag :type="MemberTypeTag[detail.memberType as keyof typeof MemberTypeTag]" size="small">
            {{ MemberTypeLabel[detail.memberType as keyof typeof MemberTypeLabel] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="到期时间">{{ detail.expireAt || '未开通' }}</el-descriptions-item>
        <el-descriptions-item label="微信号">
          <span>{{ wechatPlaintext || detail.wechatId || '-' }}</span>
          <el-button
            v-if="detail.wechatId && !wechatPlaintext"
            type="primary"
            link
            size="small"
            :loading="loadingWechat"
            @click="handleViewWechat"
          >
            查看明文
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detail.status === 'active' ? 'success' : 'danger'" size="small">
            {{ detail.status === 'active' ? '正常' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="推荐人">
          {{ detail.referrerUsername || '-' }}
          <span v-if="detail.referrerId" class="text-gray-400 ml-1">(ID: {{ detail.referrerId }})</span>
        </el-descriptions-item>
        <el-descriptions-item label="佣金余额">¥{{ formatMoney(detail.commissionBalance) }}</el-descriptions-item>
        <el-descriptions-item label="累计佣金">¥{{ formatMoney(detail.commissionTotalEarned) }}</el-descriptions-item>
        <el-descriptions-item label="已提现">¥{{ formatMoney(detail.commissionTotalPaid) }}</el-descriptions-item>
        <el-descriptions-item label="最后登录">{{ detail.lastLoginAt }}</el-descriptions-item>
        <el-descriptions-item label="登录 IP">{{ detail.lastLoginIp }}</el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ detail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detail.updatedAt }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>
