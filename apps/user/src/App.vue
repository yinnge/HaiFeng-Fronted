<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/store'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const route = useRoute()
const userStore = useUserStore()

const useDefaultLayout = computed(() => route.meta.layout !== 'blank')

onMounted(async () => {
  if (userStore.isLoggedIn() && !userStore.userInfo) {
    await userStore.fetchUserInfo()
  }
})
</script>

<template>
  <DefaultLayout v-if="useDefaultLayout">
    <router-view />
  </DefaultLayout>
  <router-view v-else />
</template>

<style>
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
