<script setup lang="ts">
import { Send } from 'lucide-vue-next'

defineProps<{
  /** 官方网址（取自 basicInfo 的「官方网站」项）；无有效 URL 时为 null */
  officialUrl: string | null
}>()
</script>

<template>
  <!-- 暖橙报名卡：页面视觉焦点 -->
  <section class="cd-signup">
    <span class="cd-signup__icon">
      <Send :size="22" :stroke-width="1.75" />
    </span>
    <h2 class="cd-signup__title">报名参赛</h2>
    <p class="cd-signup__desc">前往竞赛官方网站了解参赛要求并完成报名</p>

    <!-- 有有效 URL 才渲染链接；否则降级为不可点击的提示，避免坏链 -->
    <a
      v-if="officialUrl"
      class="cd-signup__btn"
      :href="officialUrl"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Send :size="16" :stroke-width="1.75" />
      立即报名参赛
    </a>
    <div v-else class="cd-signup__btn" style="cursor: default; background: rgba(255,255,255,0.55); color: #9a3412;">
      <Send :size="16" :stroke-width="1.75" />
      报名入口整理中
    </div>

    <p v-if="officialUrl" class="cd-signup__hint">{{ officialUrl }}</p>
    <p v-else class="cd-signup__hint">该竞赛暂未登记报名入口，可先查看赛事流程与获奖信息</p>
  </section>
</template>
