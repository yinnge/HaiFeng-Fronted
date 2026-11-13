<script setup lang="ts">
defineProps<{
  /** 骨架数量（与每页条数一致） */
  count: number
}>()
</script>

<template>
  <div class="ent-skeleton-list" aria-hidden="true">
    <div v-for="n in count" :key="n" class="hf-skeleton ent-skeleton-card">
      <span class="ent-skeleton-card__icon" />
      <span class="ent-skeleton-card__body">
        <span class="ent-skeleton-card__line ent-skeleton-card__line--title" />
        <span class="ent-skeleton-card__line ent-skeleton-card__line--tag" />
        <span class="ent-skeleton-card__line ent-skeleton-card__line--text" />
      </span>
    </div>
  </div>
</template>

<style scoped>
.ent-skeleton-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
@media (max-width: 1439px) {
  .ent-skeleton-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 1023px) {
  .ent-skeleton-list {
    grid-template-columns: minmax(0, 1fr);
  }
}
.ent-skeleton-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-height: 210px;
  padding: 20px;
  box-sizing: border-box;
  border-radius: 16px;
}
.ent-skeleton-card__icon {
  display: block;
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 14px;
  background: #e2e8f0;
}
.ent-skeleton-card__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
  padding-top: 6px;
}
.ent-skeleton-card__line {
  display: block;
  height: 14px;
  border-radius: 6px;
  background: #e2e8f0;
}
.ent-skeleton-card__line--title {
  width: 70%;
}
.ent-skeleton-card__line--tag {
  width: 40%;
  height: 18px;
}
.ent-skeleton-card__line--text {
  width: 100%;
}
</style>
