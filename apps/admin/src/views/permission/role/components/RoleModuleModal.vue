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
    @update:model-value="handleClose"
  >
    <div class="mb-3 text-sm text-gray-500">
      为角色「{{ roleName }}」选择可访问的模块
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
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>