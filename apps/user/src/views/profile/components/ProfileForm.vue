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

const showSchoolField = computed(() => {
  return canEditSchoolByIdentity(form.value.identity as Identity)
})

watch(
  () => form.value.identity,
  (newVal, oldVal) => {
    if (oldVal && !canEditSchoolByIdentity(newVal as Identity)) {
      form.value.schoolName = ''
    }
  }
)

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
  <div class="profile-form">
    <!-- 基本信息 -->
    <div class="form-section">
      <h3 class="section-title">
        <svg class="section-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
        </svg>
        基本信息
      </h3>
      <div class="form-grid">
        <el-form-item label="姓名">
          <el-input v-model="form.realName" placeholder="请输入姓名" maxlength="50" />
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
      </div>
    </div>

    <!-- 教育背景 -->
    <div class="section-divider"></div>
    <div class="form-section">
      <h3 class="section-title">
        <svg class="section-icon" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
        教育背景
      </h3>
      <div class="form-grid">
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
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="form-actions">
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        class="save-btn"
        @click="handleSave"
      >
        <svg v-if="!loading" class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
          <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
        </svg>
        保存修改
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.profile-form {
  padding: 0.5rem 0;
}

.form-section {
  margin-bottom: 2rem;
  padding-top: 1.25rem;
}

.form-section:last-of-type {
  margin-bottom: 1.5rem;
}

.section-title {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  border-radius: 6px;
  margin-bottom: 1rem;
  color: white;
}

.section-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: white;
}

.section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #f5a54a 30%, #e8722a 70%, transparent);
  margin: 0.5rem 0 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.5rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  font-weight: 500;
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(232, 114, 42, 0.25);
  transition: all 0.2s ease;
}

.save-btn:hover {
  background: linear-gradient(135deg, #e8722a, #d4661a);
  box-shadow: 0 6px 16px rgba(232, 114, 42, 0.35);
  transform: translateY(-1px);
}

.save-btn:active {
  transform: translateY(0);
}

.btn-icon {
  width: 1.125rem;
  height: 1.125rem;
}

/* Element Plus 表单项样式覆盖 */
:deep(.el-form-item__label) {
  color: #374151;
  font-weight: 500;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover) {
  box-shadow: 0 0 0 1px #d1d5db inset;
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #e8722a inset;
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #e8722a inset;
}
</style>
