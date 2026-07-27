<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/store'

const userStore = useUserStore()

onMounted(async () => {
  if (userStore.isLoggedIn() && !userStore.userInfo) {
    await userStore.fetchUserInfo()
  }
})
</script>

<template>
  <router-view />
</template>

<style>
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
