<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { upgradeUser } from '@/api/user'
import { MemberTypeLabel } from '@haifeng/shared'
import type { MemberListVO, MemberUpgradeDTO } from '@/types/user'

const props = defineProps<{
  visible: boolean
  user: MemberListVO | null
  proPrice: number
  vipPrice: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'success'): void
}>()

const loading = ref(false)
const form = ref<MemberUpgradeDTO>({
  targetType: 'pro',
  durationMonths: 12,
  amount: undefined,
  remark: '',
})
const amountMode = ref<'auto' | 'manual'>('auto')

const durationOptions = [1, 3, 6, 12, 24, 36]

const autoAmount = computed(() => {
  const yearPrice = form.value.targetType === 'pro' ? props.proPrice : props.vipPrice
  return ((yearPrice / 12) * form.value.durationMonths).toFixed(2)
})

watch(
  () => props.visible,
  (val) => {
    if (val) {
      form.value = {
        targetType: 'pro',
        durationMonths: 12,
        amount: undefined,
        remark: '',
      }
      amountMode.value = 'auto'
    }
  }
)

const handleSubmit = async () => {
  if (!props.user) return

  loading.value = true
  try {
    const data: MemberUpgradeDTO = {
      targetType: form.value.targetType,
      durationMonths: form.value.durationMonths,
      remark: form.value.remark || undefined,
    }
    if (amountMode.value === 'manual' && form.value.amount !== undefined) {
      data.amount = form.value.amount
    }

    const res = await upgradeUser(props.user.id, data)
    if (res.data.code === 200) {
      ElMessage.success('升级成功')
      emit('success')
      handleClose()
    } else {
      ElMessage.error(res.data.msg || '升级失败')
    }
  } catch (error) {
    console.error('会员升级失败:', error)
    ElMessage.error('升级失败')
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="会员升级"
    width="500px"
    @close="handleClose"
  >
    <div v-if="user">
      <div class="mb-4 p-3 bg-gray-50 rounded">
        <p>当前会员: <el-tag size="small">{{ MemberTypeLabel[user.memberType as keyof typeof MemberTypeLabel] }}</el-tag></p>
      </div>

      <el-form :model="form" label-width="100px">
        <el-form-item label="目标类型" required>
          <el-select v-model="form.targetType" style="width: 200px">
            <el-option label="专业版 (Pro)" value="pro" />
            <el-option label="VIP会员" value="vip" />
          </el-select>
        </el-form-item>
        <el-form-item label="开通时长" required>
          <el-select v-model="form.durationMonths" style="width: 200px">
            <el-option
              v-for="m in durationOptions"
              :key="m"
              :label="`${m} 个月`"
              :value="m"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="金额">
          <el-radio-group v-model="amountMode" class="mb-2">
            <el-radio value="auto">自动计算</el-radio>
            <el-radio value="manual">手动输入</el-radio>
          </el-radio-group>
          <div class="flex items-center">
            <el-input-number
              v-if="amountMode === 'manual'"
              v-model="form.amount"
              :min="0"
              :precision="2"
              style="width: 160px"
            />
            <span v-else class="text-lg font-medium">¥{{ autoAmount }}</span>
            <span class="ml-2 text-gray-400">元</span>
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="2"
            placeholder="如：后台手动开通、优惠活动等"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确认升级</el-button>
    </template>
  </el-dialog>
</template>
