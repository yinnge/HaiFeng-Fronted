<script setup lang="ts">
import { reactive } from 'vue'
import type { MemberQueryDTO } from '@/types/user'

const emit = defineEmits<{
  (e: 'search', params: MemberQueryDTO): void
  (e: 'reset'): void
}>()

const searchForm = reactive<Omit<MemberQueryDTO, 'page' | 'size'>>({
  phone: '',
  inviteCode: '',
  memberType: undefined,
  status: undefined,
  wechatId: '',
})

const handleSearch = () => {
  emit('search', { ...searchForm, page: 1, size: 10 })
}

const handleReset = () => {
  searchForm.phone = ''
  searchForm.inviteCode = ''
  searchForm.memberType = undefined
  searchForm.status = undefined
  searchForm.wechatId = ''
  emit('reset')
}
</script>

<template>
  <div class="bg-white rounded-lg p-5 mb-4">
    <el-form :model="searchForm" inline>
      <el-form-item label="手机号">
        <el-input
          v-model="searchForm.phone"
          placeholder="请输入手机号"
          clearable
          style="width: 160px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="邀请码">
        <el-input
          v-model="searchForm.inviteCode"
          placeholder="请输入邀请码"
          clearable
          style="width: 140px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item label="会员类型">
        <el-select
          v-model="searchForm.memberType"
          placeholder="全部"
          clearable
          style="width: 120px"
        >
          <el-option label="普通用户" value="normal" />
          <el-option label="专业版" value="pro" />
          <el-option label="VIP会员" value="vip" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select
          v-model="searchForm.status"
          placeholder="全部"
          clearable
          style="width: 100px"
        >
          <el-option label="正常" value="active" />
          <el-option label="禁用" value="disabled" />
        </el-select>
      </el-form-item>
      <el-form-item label="微信号">
        <el-input
          v-model="searchForm.wechatId"
          placeholder="精准匹配"
          clearable
          style="width: 140px"
          @keyup.enter="handleSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
