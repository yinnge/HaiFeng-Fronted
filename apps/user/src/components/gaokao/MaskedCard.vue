<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/store/modules/user'

defineProps<{
  show: boolean
}>()

const userStore = useUserStore()
const isNormal = computed(() => userStore.userInfo?.memberType === 'normal')
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <div class="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl">
          <div class="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 text-3xl">
            🔒
          </div>
          <h3 class="text-lg font-bold text-gray-800 mb-2">升级会员</h3>
          <p class="text-sm text-gray-500 mb-6">
            {{ isNormal ? '普通用户仅可查看前10条数据，升级后查看完整信息' : '开通会员查看完整数据' }}
          </p>
          <button
            class="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
            @click="$emit('close')"
          >
            知道了
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
