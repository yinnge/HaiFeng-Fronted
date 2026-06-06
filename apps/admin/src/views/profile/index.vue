<!-- apps/admin/src/views/profile/index.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/store'
import AvatarCard from './components/AvatarCard.vue'
import ProfileForm from './components/ProfileForm.vue'

const userStore = useUserStore()

onMounted(() => {
  if (!userStore.profile) {
    userStore.fetchProfile()
  }
})

function handleRefresh() {
  userStore.fetchProfile()
}
</script>

<template>
  <div class="flex gap-5">
    <AvatarCard :profile="userStore.profile" />
    <ProfileForm :profile="userStore.profile" @refresh="handleRefresh" />
  </div>
</template>
