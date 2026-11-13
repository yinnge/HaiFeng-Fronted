<script setup lang="ts">
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'
import type { EnterpriseListVO } from '@/types/enterprise'
import { HERO_BG_URL, natureTag, typeTag } from '../utils'
// 图标映射复用列表页同一实现（关键词 → 性质兜底），两页视觉一致
import { getEnterpriseIcon } from '../../components/utils'

const props = defineProps<{
  /** 企业信息（接口失败时可能为 null，模板内做占位） */
  enterprise: EnterpriseListVO | null
  /** 在招岗位总数 */
  totalCount: number
  /** 校招岗位数 */
  campusCount: number
  /** 实习岗位数 */
  internCount: number
  /** 是否已收藏该企业 */
  favorited?: boolean
}>()
const emit = defineEmits<{
  (e: 'toggle-fav', id: string): void
}>()

const nature = computed(() => natureTag(props.enterprise?.enterpriseNature))
const type = computed(() => typeTag(props.enterprise?.enterpriseType))

/**
 * 企业图标：与列表页卡片用同一套映射（关键词优先 → 性质兜底），保证两页视觉一致。
 * DB 里 logo_url 100% 为空，logo 实际永远走不到 lucide 图标分支。
 */
const iconStyle = computed(() =>
  getEnterpriseIcon(props.enterprise?.enterpriseName, props.enterprise?.enterpriseNature),
)

/**
 * Hero 元数据行：只放「城市 · 规模」两个速览项。
 * 主营业务较长，完整展示留给右侧「企业信息」块（避免同一信息在两处重复）。
 */
const metaItems = computed(() => {
  const e = props.enterprise
  if (!e) return []
  return [
    { key: 'city', text: e.cityName },
    { key: 'scale', text: e.enterpriseScale },
  ].filter((i) => Boolean(i.text && i.text.trim()))
})
</script>

<template>
  <section class="pos-hero" :style="{ '--hero-bg-url': `url(${HERO_BG_URL})` }">
    <div class="pos-hero__main">
      <span
        class="pos-hero__logo"
        :style="{ backgroundColor: iconStyle.bg, color: iconStyle.fg }"
      >
        <img
          v-if="enterprise?.logoUrl"
          :src="enterprise.logoUrl"
          :alt="enterprise.enterpriseName"
          class="pos-hero__logo-img"
        />
        <component v-else :is="iconStyle.icon" :size="26" :stroke-width="1.75" />
      </span>

      <div class="pos-hero__text">
        <div class="pos-hero__name-row">
          <h1 class="pos-hero__name" :title="enterprise?.enterpriseName">
            {{ enterprise?.enterpriseName || '企业信息' }}
          </h1>
          <!-- 收藏药丸：与列表页同一 targetType=enterprise -->
          <button
            type="button"
            class="pos-fav-pill"
            :class="{ 'is-on': favorited }"
            :aria-pressed="favorited"
            :aria-label="favorited ? '取消收藏该企业' : '收藏该企业'"
            @click="enterprise && emit('toggle-fav', String(enterprise.id))"
          >
            <Star :size="13" :stroke-width="1.9" :fill="favorited ? 'currentColor' : 'none'" />
            {{ favorited ? '已收藏' : '收藏' }}
          </button>
        </div>

        <div class="pos-hero__tags">
          <span
            v-if="nature.text"
            class="hf-tag"
            :style="{ color: nature.fg, backgroundColor: nature.bg, '--tag-ring': nature.ring }"
          >{{ nature.text }}</span>
          <span
            v-if="type.text"
            class="hf-tag"
            :style="{ color: type.fg, backgroundColor: type.bg, '--tag-ring': type.ring }"
          >{{ type.text }}</span>
        </div>

        <div v-if="metaItems.length" class="pos-hero__meta">
          <span v-for="item in metaItems" :key="item.key" class="pos-hero__meta-item">
            {{ item.text }}
          </span>
        </div>
      </div>
    </div>

    <div class="pos-hero__stats">
      <div class="pos-hero__stat">
        <span class="pos-hero__stat-value">{{ totalCount }}</span>
        <span class="pos-hero__stat-label">在招岗位</span>
      </div>
      <div class="pos-hero__stat">
        <span class="pos-hero__stat-value">{{ campusCount }}</span>
        <span class="pos-hero__stat-label">校招岗位</span>
      </div>
      <div class="pos-hero__stat">
        <span class="pos-hero__stat-value">{{ internCount }}</span>
        <span class="pos-hero__stat-label">实习岗位</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 不挂 hf-card：避免其 background:#fff 与多层 Hero 背景互相覆盖 */
.pos-hero {
  --hero-bg-pos: center 58%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: clamp(176px, 14vw, 208px);
  padding: 24px 28px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.02), 0 4px 20px -2px rgba(15, 23, 42, 0.04);
  background-color: #eff6ff;
  background-image:
    linear-gradient(90deg, #f8fbff 0%, rgba(248, 251, 255, 0.94) 36%, rgba(248, 251, 255, 0) 72%),
    var(--hero-bg-url);
  background-position: center, var(--hero-bg-pos);
  background-size: auto, cover;
  background-repeat: no-repeat, no-repeat;
}
@media (max-width: 767px) {
  .pos-hero {
    --hero-bg-pos: 75% 58%;
  }
}
.pos-hero__main {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  min-width: 0;
  flex: 1;
}
.pos-hero__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  flex: none;
  border-radius: 16px;
  overflow: hidden;
}
.pos-hero__logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pos-hero__text {
  min-width: 0;
}
.pos-hero__name-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  min-width: 0;
}
.pos-hero__name {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
/* ===== 收藏药丸：琥珀底，收藏态加深 + 内凹 ===== */
.pos-fav-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 28px;
  padding: 0 12px;
  flex: none;
  border: 1px solid rgba(180, 83, 9, 0.28);
  border-radius: 999px;
  background: #fffbeb;
  color: #b45309;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}
.pos-fav-pill:hover {
  background: #fef3c7;
  border-color: rgba(180, 83, 9, 0.45);
  color: #92400e;
}
.pos-fav-pill:active {
  transform: translateY(1px);
}
.pos-fav-pill:focus-visible {
  outline: 2px solid rgba(245, 158, 11, 0.5);
  outline-offset: 2px;
}
.pos-fav-pill.is-on {
  color: #ffffff;
  border-color: transparent;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  box-shadow: inset 0 2px 4px rgba(120, 53, 15, 0.2);
}
.pos-fav-pill.is-on:hover {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #ffffff;
}
.pos-hero__tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.pos-hero__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.5;
  color: #475569;
}
.pos-hero__meta-item {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
.pos-hero__stats {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 10px;
  flex: none;
}
.pos-hero__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 84px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.05);
}
.pos-hero__stat-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  color: #0f172a;
  font-variant-numeric: tabular-nums;
}
.pos-hero__stat-label {
  font-size: 12px;
  line-height: 1.4;
  color: #64748b;
}
@media (max-width: 1023px) {
  .pos-hero {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  .pos-hero__stats {
    justify-content: space-between;
  }
  .pos-hero__stat {
    flex: 1;
  }
}
@media (max-width: 767px) {
  .pos-hero {
    padding: 18px;
  }
  .pos-hero__name {
    font-size: 21px;
  }
  .pos-hero__stat {
    min-width: 0;
    padding: 10px 8px;
  }
  .pos-hero__stat-value {
    font-size: 20px;
  }
}
</style>
