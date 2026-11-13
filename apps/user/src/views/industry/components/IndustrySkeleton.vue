<script setup lang="ts">
defineProps<{
  /** 骨架数量（与每页条数一致） */
  count: number
}>()
</script>

<template>
  <div class="ind-skeleton-list" aria-hidden="true">
    <div v-for="n in count" :key="n" class="hf-skeleton ind-skeleton-card">
      <span class="ind-skeleton-card__icon" />
      <span class="ind-skeleton-card__body">
        <span class="ind-skeleton-card__line ind-skeleton-card__line--title" />
        <span class="ind-skeleton-card__line ind-skeleton-card__line--tag" />
        <span class="ind-skeleton-card__line ind-skeleton-card__line--desc" />
      </span>
    </div>
  </div>
</template>

<style scoped>
.ind-skeleton-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
@media (max-width: 1023px) {
  .ind-skeleton-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 767px) {
  .ind-skeleton-list {
    grid-template-columns: minmax(0, 1fr);
  }
}
.ind-skeleton-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  height: 200px;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 16px;
}
.ind-skeleton-card__icon {
  display: block;
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 14px;
  background: #e2e8f0;
}
.ind-skeleton-card__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
  padding-top: 6px;
}
.ind-skeleton-card__line {
  display: block;
  height: 14px;
  border-radius: 6px;
  background: #e2e8f0;
}
.ind-skeleton-card__line--title {
  width: 70%;
}
.ind-skeleton-card__line--tag {
  width: 45%;
  height: 18px;
}
.ind-skeleton-card__line--desc {
  width: 90%;
}
</style>
