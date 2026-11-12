<script setup lang="ts">
defineProps<{
  /** 骨架数量（与每页条数一致） */
  count: number
}>()
</script>

<template>
  <div class="cert-skeleton-list" aria-hidden="true">
    <div v-for="n in count" :key="n" class="hf-skeleton cert-skeleton-card">
      <span class="cert-skeleton-card__icon" />
      <span class="cert-skeleton-card__body">
        <span class="cert-skeleton-card__line cert-skeleton-card__line--title" />
        <span class="cert-skeleton-card__line cert-skeleton-card__line--tag" />
        <span class="cert-skeleton-card__line cert-skeleton-card__line--text" />
      </span>
    </div>
  </div>
</template>

<style scoped>
.cert-skeleton-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
@media (max-width: 767px) {
  .cert-skeleton-list {
    grid-template-columns: minmax(0, 1fr);
  }
}
.cert-skeleton-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-height: 220px;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 16px;
}
.cert-skeleton-card__icon {
  display: block;
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 14px;
  background: #e2e8f0;
}
.cert-skeleton-card__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
  padding-top: 6px;
}
.cert-skeleton-card__line {
  display: block;
  height: 14px;
  border-radius: 6px;
  background: #e2e8f0;
}
.cert-skeleton-card__line--title {
  width: 70%;
}
.cert-skeleton-card__line--tag {
  width: 40%;
  height: 18px;
}
.cert-skeleton-card__line--text {
  width: 100%;
}
</style>
