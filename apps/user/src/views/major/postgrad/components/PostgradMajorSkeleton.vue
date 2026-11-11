<script setup lang="ts">
defineProps<{ count: number }>()
</script>

<template>
  <!-- 纯色块骨架，无 shimmer、无 filter；数量等于当前页容量，避免布局跳动 -->
  <div class="pg-card-grid">
    <div v-for="n in count" :key="n" class="hf-skeleton skeleton-card" />
  </div>
</template>

<style scoped>
.skeleton-card {
  height: 218px;
}
</style>
