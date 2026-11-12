<script setup lang="ts">
/** 与正式布局同构的纯色骨架，避免出现孤立空阴影卡 */
</script>

<template>
  <div>
    <div class="hf-skeleton ct-skeleton-hero" />
    <div class="hf-skeleton ct-skeleton-stat" />
    <div class="ct-grid">
      <div class="ct-left">
        <div v-for="n in 5" :key="n" class="hf-skeleton ct-skeleton-block" />
      </div>
      <div class="ct-right">
        <div class="hf-skeleton ct-skeleton-block" />
        <div class="hf-skeleton ct-skeleton-block--short" />
        <div class="hf-skeleton ct-skeleton-block--short" />
      </div>
    </div>
  </div>
</template>
