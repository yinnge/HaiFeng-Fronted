<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, MapPin, Users } from 'lucide-vue-next'
import type { EnterpriseListVO } from '@/types/enterprise'
import { getEnterpriseIcon, natureTag, normalizeBusiness, typeTag } from './utils'

const props = defineProps<{
  item: EnterpriseListVO
  /** 是否已收藏（灰星 / 黄星切换） */
  favorited?: boolean
}>()
const emit = defineEmits<{
  (e: 'open', id: string): void
  (e: 'toggle-fav', id: string): void
}>()

const iconStyle = computed(() =>
  getEnterpriseIcon(props.item.enterpriseName, props.item.enterpriseNature),
)
const nature = computed(() => natureTag(props.item.enterpriseNature))
const type = computed(() => typeTag(props.item.enterpriseType))
const business = computed(() => normalizeBusiness(props.item.mainBusiness))

/**
 * 地区（region）：实测 2373 条中 2306 条是「省份 + 城市」的完整写法（如 广东省深圳市），
 * 604 条恰好等于「城市 + 市」（如 北京 / 北京市），与已展示的城市名完全重复。
 * 故只在提供增量信息（省份）时显示，避免同一张卡出现「北京 / 北京市」两次。
 */
const regionText = computed(() => {
  const region = (props.item.region ?? '').trim()
  const city = (props.item.cityName ?? '').trim()
  if (!region) return ''
  if (region === city || region === `${city}市`) return ''
  return region
})
</script>

<template>
  <!-- 整卡由父层推 /enterprise/:id/positions；根元素用 div[role=button]（内部要放收藏按钮，button 不可嵌套） -->
  <div
    class="hf-card ent-card is-clickable"
    role="button"
    tabindex="0"
    :aria-label="`查看 ${item.enterpriseName} 的岗位`"
    @click="emit('open', String(item.id))"
    @keydown.enter="emit('open', String(item.id))"
    @keydown.space.prevent="emit('open', String(item.id))"
  >
    <span class="ent-head">
      <span
        class="ent-head__icon"
        :style="{ backgroundColor: iconStyle.bg, color: iconStyle.fg }"
      >
        <component :is="iconStyle.icon" :size="24" :stroke-width="1.75" />
      </span>
      <span class="ent-head__text">
        <span class="ent-head__name" :title="item.enterpriseName">{{ item.enterpriseName }}</span>
        <span class="ent-tags">
          <span
            v-if="nature.text"
            class="hf-tag"
            :style="{ color: nature.fg, backgroundColor: nature.bg, '--tag-ring': nature.ring }"
          >{{ nature.text }}</span>
          <span
            v-if="type.text"
            class="hf-tag ent-tag--type"
            :style="{ color: type.fg, backgroundColor: type.bg, '--tag-ring': type.ring }"
            :title="type.text"
          >{{ type.text }}</span>
        </span>
      </span>
      <!-- 右上角收藏星标（放大版）：@click.stop 避免触发整卡跳转 -->
      <button
        type="button"
        class="ent-fav-star"
        :class="{ 'is-on': favorited }"
        :aria-label="favorited ? `取消收藏 ${item.enterpriseName}` : `收藏 ${item.enterpriseName}`"
        :title="favorited ? '取消收藏' : '收藏'"
        @click.stop="emit('toggle-fav', String(item.id))"
        @keydown.stop
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
        </svg>
      </button>
    </span>

    <span class="ent-meta">
      <span v-if="item.cityName" class="ent-meta__item">
        <MapPin :size="14" :stroke-width="1.75" class="ent-meta__icon" />
        <span class="ent-meta__text" :title="item.cityName">{{ item.cityName }}</span>
      </span>
      <span v-if="item.enterpriseScale" class="ent-meta__item">
        <Users :size="14" :stroke-width="1.75" class="ent-meta__icon" />
        <span class="ent-meta__text" :title="item.enterpriseScale">{{ item.enterpriseScale }}</span>
      </span>
    </span>

    <span class="ent-business" :title="item.mainBusiness || ''">{{ business }}</span>

    <span class="ent-footer">
      <span class="ent-footer__region" :title="regionText">{{ regionText }}</span>
      <span class="ent-footer__action">
        查看岗位
        <ArrowRight :size="14" :stroke-width="1.75" class="ent-footer__arrow" />
      </span>
    </span>
  </div>
</template>

<style scoped>
.ent-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
}
.ent-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  min-width: 0;
}
.ent-head__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  flex: none;
  border-radius: 14px;
}
.ent-head__text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}
.ent-head__name {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  color: #0f172a;
}
.ent-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}
/* 企业类型取值较长（如「上市公司（A股+港股）」），单行截断避免撑破卡片。
   需覆盖 hf-tag 的 display:inline-flex —— flex 容器下 text-overflow 不生效，
   故改为 inline-block；选择器提一级（.ent-tags .ent-tag--type）以确保特异度
   高于页面级的 .page-enterprise-list .hf-tag，不依赖样式表顺序。 */
.ent-tags .ent-tag--type {
  display: inline-block;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
}
.ent-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 14px;
  font-size: 13px;
  color: #64748b;
}
.ent-meta__item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.ent-meta__icon {
  flex: none;
  color: #64748b;
}
.ent-meta__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ent-business {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  min-height: 46px;
  margin: 10px 0 14px;
  font-size: 14px;
  line-height: 1.65;
  color: #475569;
  overflow-wrap: anywhere;
}
.ent-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f8fafc;
}
.ent-footer__region {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  line-height: 1.4;
  color: #64748b;
}
/* 地区为空时（与城市名重复）不占位，让「查看岗位」自然靠右 */
.ent-footer__region:empty {
  flex: 0 0 auto;
  width: 0;
}
.ent-footer__action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex: none;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: #c2410c;
  transition: color 0.2s ease;
}
.ent-footer__arrow {
  color: #334155;
  transition: transform 0.2s ease, color 0.2s ease;
}
.ent-card:hover .ent-footer__action {
  color: #9a3412;
}
.ent-card:hover .ent-footer__arrow {
  transform: translateX(2px);
  color: #ea580c;
}

/* ===== 右上角收藏星标（放大版） ===== */
.ent-fav-star {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: #cbd5e1;
  border: none;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}
.ent-fav-star svg {
  width: 20px;
  height: 20px;
}
.ent-fav-star:hover {
  color: #d97706;
  background: #fffbeb;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.3);
}
.ent-fav-star.is-on {
  color: #f59e0b;
  background: #fffbeb;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.35);
}
.ent-fav-star.is-on svg {
  fill: currentColor;
}
.ent-fav-star:active {
  transform: translateY(1px);
}
.ent-fav-star:focus-visible {
  outline: 2px solid rgba(245, 158, 11, 0.5);
  outline-offset: 2px;
}
</style>
