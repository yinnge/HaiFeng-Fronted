<script setup lang="ts">
/** 与正式布局同构的纯色骨架，避免出现孤立空阴影卡 */
</script>

<template>
  <div>
    <div class="hf-skeleton pgd-skeleton-hero" />
    <div class="pg-grid">
      <div class="pg-left">
        <div v-for="n in 4" :key="n" class="hf-skeleton pgd-skeleton-block" />
      </div>
      <div class="pg-right">
        <div class="hf-skeleton pgd-skeleton-block" />
        <div class="hf-skeleton pgd-skeleton-block--short" />
      </div>
    </div>
  </div>
</template>
