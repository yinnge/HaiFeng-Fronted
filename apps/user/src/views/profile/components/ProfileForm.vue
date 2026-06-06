<!-- apps/user/src/views/profile/components/ProfileForm.vue -->
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  GenderOptions,
  IdentityOptions,
  ProvinceOptions,
  Identity,
  canEditSchoolByIdentity,
} from '@haifeng/shared'
import type { MemberProfileVO, MemberProfileUpdateDTO } from '@/types/member/profile'
import type { SearchItem } from '@/types/search'
import { updateProfile } from '@/api/member/profile'
import { searchUniversity, searchCity, searchMajor } from '@/api/search'

const props = defineProps<{
  profile: MemberProfileVO | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const loading = ref(false)
const form = ref<MemberProfileUpdateDTO>({
  realName: '',
  email: '',
  gender: '',
  identity: '',
  province: '',
  city: '',
  major: '',
  schoolName: '',
  grade: '',
  educationLevel: '',
})

// 监听 profile 变化，更新表单
watch(
  () => props.profile,
  (val) => {
    if (val) {
      form.value = {
        realName: val.realName || '',
        email: val.email || '',
        gender: val.gender || '',
        identity: val.identity || '',
        province: val.province || '',
        city: val.city || '',
        major: val.major || '',
        schoolName: val.schoolName || '',
        grade: val.grade || '',
        educationLevel: val.educationLevel || '',
      }
    }
  },
  { immediate: true }
)

// 是否显示学校字段
const showSchoolField = computed(() => {
  return canEditSchoolByIdentity(form.value.identity as Identity)
})

// 身份变化时清空学校
watch(
  () => form.value.identity,
  (newVal, oldVal) => {
    if (oldVal && !canEditSchoolByIdentity(newVal as Identity)) {
      form.value.schoolName = ''
    }
  }
)

// 模糊搜索 - 大学
async function handleUniversitySearch(query: string, cb: (items: { value: string }[]) => void) {
  if (!query) {
    cb([])
    return
  }
  try {
    const { data } = await searchUniversity(query)
    cb(data.data.map((item: SearchItem) => ({ value: item.name })))
  } catch {
    cb([])
  }
}

// 模糊搜索 - 城市
async function handleCitySearch(query: string, cb: (items: { value: string }[]) => void) {
  if (!query) {
    cb([])
    return
  }
  try {
    const { data } = await searchCity(query)
    cb(data.data.map((item: SearchItem) => ({ value: item.name })))
  } catch {
    cb([])
  }
}

// 模糊搜索 - 专业
async function handleMajorSearch(query: string, cb: (items: { value: string }[]) => void) {
  if (!query) {
    cb([])
    return
  }
  try {
    const { data } = await searchMajor(query)
    cb(data.data.map((item: SearchItem) => ({ value: item.name })))
  } catch {
    cb([])
  }
}

// 保存
async function handleSave() {
  loading.value = true
  try {
    await updateProfile(form.value)
    ElMessage.success('保存成功')
    emit('refresh')
  } catch (err: any) {
    ElMessage.error(err.message || '保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="rounded-lg bg-white p-6">
    <el-form :model="form" label-width="100px" class="max-w-2xl">
      <el-form-item label="真实姓名">
        <el-input v-model="form.realName" placeholder="请输入真实姓名" maxlength="50" />
      </el-form-item>

      <el-form-item label="邮箱">
        <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="100" />
      </el-form-item>

      <el-form-item label="性别">
        <el-select v-model="form.gender" placeholder="请选择性别" class="w-full">
          <el-option
            v-for="item in GenderOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="身份">
        <el-select v-model="form.identity" placeholder="请选择身份" class="w-full">
          <el-option
            v-for="item in IdentityOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="省份">
        <el-select v-model="form.province" placeholder="请选择省份" filterable class="w-full">
          <el-option
            v-for="item in ProvinceOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="城市">
        <el-autocomplete
          v-model="form.city"
          :fetch-suggestions="handleCitySearch"
          placeholder="请输入城市"
          class="w-full"
          clearable
        />
      </el-form-item>

      <el-form-item label="专业">
        <el-autocomplete
          v-model="form.major"
          :fetch-suggestions="handleMajorSearch"
          placeholder="请输入专业"
          class="w-full"
          clearable
        />
      </el-form-item>

      <el-form-item v-if="showSchoolField" label="学校">
        <el-autocomplete
          v-model="form.schoolName"
          :fetch-suggestions="handleUniversitySearch"
          placeholder="请输入学校"
          class="w-full"
          clearable
        />
      </el-form-item>

      <el-form-item label="年级">
        <el-input v-model="form.grade" placeholder="如：高一、大三、研一" maxlength="20" />
      </el-form-item>

      <el-form-item label="学历层次">
        <el-input v-model="form.educationLevel" placeholder="如：本科、硕士" maxlength="20" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSave">
          保存修改
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
