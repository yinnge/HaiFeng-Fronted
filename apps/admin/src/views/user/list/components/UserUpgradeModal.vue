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
    class="upgrade-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="user" class="upgrade-content">
      <!-- 当前会员信息 -->
      <div class="current-info">
        <span class="info-label">当前会员</span>
        <span class="info-value">{{ MemberTypeLabel[user.memberType as keyof typeof MemberTypeLabel] }}</span>
      </div>

      <el-form :model="form" label-width="100px">
        <el-form-item label="目标类型" required>
          <el-select v-model="form.targetType" class="form-select">
            <el-option label="专业版 (Pro)" value="pro" />
            <el-option label="VIP会员" value="vip" />
          </el-select>
        </el-form-item>
        <el-form-item label="开通时长" required>
          <el-select v-model="form.durationMonths" class="form-select">
            <el-option
              v-for="m in durationOptions"
              :key="m"
              :label="`${m} 个月`"
              :value="m"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="金额">
          <div class="amount-section">
            <div class="amount-mode-toggle">
              <button
                type="button"
                :class="['mode-btn', amountMode === 'auto' ? 'mode-btn-active' : '']"
                @click="amountMode = 'auto'"
              >
                自动计算
              </button>
              <button
                type="button"
                :class="['mode-btn', amountMode === 'manual' ? 'mode-btn-active' : '']"
                @click="amountMode = 'manual'"
              >
                手动输入
              </button>
            </div>
            <div class="amount-display">
              <el-input-number
                v-if="amountMode === 'manual'"
                v-model="form.amount"
                :min="0"
                :precision="2"
                class="amount-input"
              />
              <span v-else class="auto-amount">¥{{ autoAmount }}</span>
              <span class="amount-unit">元</span>
            </div>
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
      <div class="dialog-footer">
        <button type="button" class="cancel-btn" @click="handleClose">取消</button>
        <button type="button" class="submit-btn" :disabled="loading" @click="handleSubmit">
          <svg v-if="!loading" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span v-if="loading" class="loading-spinner"></span>
          确认升级
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.upgrade-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.upgrade-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.upgrade-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.upgrade-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.upgrade-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.upgrade-content :deep(.el-input__wrapper),
.upgrade-content :deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.25s ease;
}

.upgrade-content :deep(.el-input__wrapper:hover),
.upgrade-content :deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.upgrade-content :deep(.el-input__wrapper.is-focus),
.upgrade-content :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.upgrade-content :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

.form-select {
  width: 200px;
}

.form-select :deep(.el-select__wrapper) {
  border-radius: 8px;
}

.form-select :deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.3) inset;
}

.form-select :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #F97316 inset;
}

.current-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(249, 115, 22, 0.04);
  border: 1px solid rgba(249, 115, 22, 0.1);
  border-radius: 8px;
  margin-bottom: 24px;
}

.info-label {
  font-size: 13px;
  color: #6b7280;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #F97316;
}

.amount-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.amount-mode-toggle {
  display: flex;
  gap: 8px;
}

.mode-btn {
  padding: 6px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fff;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-btn:hover {
  border-color: rgba(249, 115, 22, 0.3);
  color: #F97316;
}

.mode-btn-active {
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border-color: transparent;
}

.mode-btn-active:hover {
  color: #fff;
}

.amount-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount-input {
  width: 160px;
}

.amount-input :deep(.el-input__wrapper) {
  border-radius: 8px;
}

.auto-amount {
  font-size: 22px;
  font-weight: 700;
  color: #F97316;
}

.amount-unit {
  font-size: 13px;
  color: #9ca3af;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 20px;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.cancel-btn:hover {
  color: #374151;
  border-color: #9ca3af;
  background: #f9fafb;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 24px;
  background: linear-gradient(135deg, #F97316, #FB923C);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
