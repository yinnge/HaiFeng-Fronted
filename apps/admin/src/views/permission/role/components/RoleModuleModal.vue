<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getModuleTree } from '@/api/permission/module'
import { bindRoleModules, getRoleDetail } from '@/api/permission/role'
import type { ModuleTreeVO } from '@/types/permission/module'

const props = defineProps<{
  visible: boolean
  roleId?: string
  roleName?: string
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const loading = ref(false)
const treeData = ref<ModuleTreeVO[]>([])
const defaultCheckedKeys = ref<string[]>([])
const treeRef = ref()

const fetchModuleTree = async () => {
  loading.value = true
  try {
    const [treeRes, roleRes] = await Promise.all([
      getModuleTree(),
      props.roleId ? getRoleDetail(props.roleId) : Promise.resolve(null),
    ])
    if (treeRes.data.code === 200) {
      treeData.value = treeRes.data.data
    }
    if (roleRes?.data.code === 200) {
      defaultCheckedKeys.value = roleRes.data.data.moduleIds || []
    }
  } catch {
    ElMessage.error('获取模块树失败')
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (!props.roleId) return
  const checkedIds = treeRef.value?.getCheckedKeys() || []
  loading.value = true
  try {
    const res = await bindRoleModules(props.roleId, { moduleIds: checkedIds })
    if (res.data.code === 200) {
      ElMessage.success('权限分配成功')
      emit('update:visible', false)
      emit('success')
    } else {
      ElMessage.error(res.data.msg || '分配失败')
    }
  } catch {
    ElMessage.error('分配权限失败')
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  emit('update:visible', false)
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      defaultCheckedKeys.value = []
      fetchModuleTree()
    }
  }
)
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="分配模块权限"
    width="500px"
    :close-on-click-modal="false"
    class="module-dialog"
    @update:model-value="handleClose"
  >
    <div class="module-subtitle">
      为角色「<span class="role-highlight">{{ roleName }}</span>」选择可访问的模块
    </div>
    <el-tree
      ref="treeRef"
      :data="treeData"
      :props="{ label: 'moduleName', children: 'children' }"
      show-checkbox
      node-key="id"
      :default-checked-keys="defaultCheckedKeys"
      :default-expand-all="false"
      highlight-current
      v-loading="loading"
    />
    <template #footer>
      <div class="dialog-footer">
        <button type="button" class="cancel-btn" @click="handleClose">取消</button>
        <button type="button" class="save-btn" :disabled="loading" @click="handleSave">
          <svg v-if="!loading" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          <span v-if="loading" class="loading-spinner"></span>
          保存
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.module-dialog :deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

.module-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid rgba(249, 115, 22, 0.15);
  padding: 20px 24px;
  margin: 0;
}

.module-dialog :deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.module-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.module-dialog :deep(.el-dialog__footer) {
  border-top: 1px solid #f3f4f6;
  padding: 16px 24px;
}

.module-dialog :deep(.el-tree) {
  --el-tree-node-hover-bg-color: rgba(249, 115, 22, 0.05);
}

.module-dialog :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: rgba(249, 115, 22, 0.08);
  color: #C2410C;
}

.module-dialog :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #F97316;
  border-color: #F97316;
}

.module-dialog :deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #F97316;
}

.module-subtitle {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 16px;
  padding: 10px 14px;
  background: rgba(249, 115, 22, 0.04);
  border-radius: 8px;
  border: 1px solid rgba(249, 115, 22, 0.1);
}

.role-highlight {
  color: #F97316;
  font-weight: 600;
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

.save-btn {
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

.save-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
}

.save-btn:disabled {
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
