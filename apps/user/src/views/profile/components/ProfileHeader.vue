<!-- apps/user/src/views/profile/components/ProfileHeader.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { Edit } from '@element-plus/icons-vue'
import { MemberTypeLabel, MemberTypeTag } from '@haifeng/shared'
import type { MemberInfoVO } from '@/types/member/info'
import type { MemberProfileVO } from '@/types/member/profile'

const props = defineProps<{
  memberInfo: MemberInfoVO | null
  profile: MemberProfileVO | null
}>()

const emit = defineEmits<{
  (e: 'update-avatar'): void
}>()

const memberTypeLabel = computed(() => {
  if (!props.memberInfo) return ''
  return MemberTypeLabel[props.memberInfo.memberType] || '普通用户'
})

const memberTypeTagType = computed(() => {
  if (!props.memberInfo) return 'info'
  return MemberTypeTag[props.memberInfo.memberType] || 'info'
})

const expireAtFormatted = computed(() => {
  if (!props.memberInfo?.expireAt) return ''
  const date = new Date(props.memberInfo.expireAt)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
})

function handleAvatarClick() {
  emit('update-avatar')
}
</script>

<template>
  <div class="flex items-center gap-6 rounded-lg bg-white p-6 shadow-sm">
    <!-- 头像区域 -->
    <div class="relative cursor-pointer" @click="handleAvatarClick">
      <el-avatar
        :size="80"
        :src="memberInfo?.avatar || ''"
        class="border-2 border-gray-200"
      >
        <span class="text-2xl">{{ memberInfo?.username?.charAt(0) || '?' }}</span>
      </el-avatar>
      <div class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity hover:opacity-100">
        <el-icon class="text-white"><Edit /></el-icon>
      </div>
    </div>

    <!-- 用户信息 -->
    <div class="flex-1">
      <div class="flex items-center gap-2">
        <span class="text-xl font-semibold text-gray-800">
          {{ memberInfo?.username || '用户' }}
        </span>
        <el-tag :type="memberTypeTagType" size="small">
          {{ memberTypeLabel }}
        </el-tag>
      </div>
      <div class="mt-1 text-sm text-gray-500">
        {{ memberInfo?.phone || '' }}
      </div>
      <div v-if="expireAtFormatted" class="mt-1 text-xs text-gray-400">
        会员到期：{{ expireAtFormatted }}
      </div>
    </div>

    <!-- 统计区域 -->
    <div class="flex gap-8">
      <div class="text-center">
        <div class="text-2xl font-bold text-orange-500">
          {{ profile?.favoriteCount || 0 }}
        </div>
        <div class="text-sm text-gray-500">收藏</div>
      </div>
    </div>
  </div>
</template>
