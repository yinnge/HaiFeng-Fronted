<script setup lang="ts">
import { computed } from 'vue'
import type { AnnouncementListVO } from '@/types/home'
import NoticeRow from './NoticeRow.vue'

const props = defineProps<{
  announcements: AnnouncementListVO[]
  loading?: boolean
}>()

defineEmits<{
  select: [id: string]
  'view-all': []
}>()

const items = computed(() => props.announcements.slice(0, 4))
const featured = computed(() => items.value[0] ?? null)
const rest = computed(() => items.value.slice(1))
</script>

<template>
  <aside class="notice-panel">
    <div class="notice-panel__header">
      <h3 class="notice-panel__title">规划院公告</h3>
      <button type="button" class="notice-panel__more" @click="$emit('view-all')">
        查看全部
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 4l6 6-6 6" />
        </svg>
      </button>
    </div>

    <div v-if="loading" class="notice-skeleton" aria-hidden="true">
      <div class="notice-skeleton__featured"></div>
      <div v-for="n in 3" :key="n" class="notice-skeleton__row"></div>
    </div>

    <template v-else>
      <div class="notice-panel__body">
        <NoticeRow
          v-if="featured"
          :item="featured"
          :is-new="true"
          featured
          @select="$emit('select', $event)"
        />

        <ul v-if="rest.length" class="notice-list">
          <li v-for="(item, index) in rest" :key="item.id" class="notice-list__item">
            <NoticeRow :item="item" :is-new="index === 0" @select="$emit('select', $event)" />
          </li>
        </ul>

        <div v-if="!items.length" class="notice-empty">
          <span class="notice-empty__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 6h16v12H4z" />
              <path d="M8 10h8M8 14h5" />
            </svg>
          </span>
          <span class="notice-empty__title">暂无公告</span>
          <span class="notice-empty__sub">可以先从院校库或专业库开始探索</span>
        </div>

        <div class="notice-panel__source">
          <span class="notice-panel__source-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
            </svg>
          </span>
          <span class="notice-panel__source-text">
            <span class="notice-panel__source-title">公告实时同步</span>
            <span class="notice-panel__source-sub">教育考试院 · 阳光高考 · 高校研招网</span>
          </span>
        </div>
      </div>

      <div class="notice-quick">
        <router-link to="/university" class="notice-quick__card">
          <span class="notice-quick__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 21h18" />
              <path d="M5 21V8l7-5 7 5v13" />
              <path d="M9 21v-5h6v5" />
              <path d="M9 11h.01M15 11h.01" />
            </svg>
          </span>
          <span class="notice-quick__text">
            <span class="notice-quick__label">院校库</span>
            <span class="notice-quick__sub">地区与类型</span>
          </span>
          <span class="notice-quick__arrow" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 10h12M11 5l5 5-5 5" />
            </svg>
          </span>
        </router-link>

        <router-link to="/major" class="notice-quick__card">
          <span class="notice-quick__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
              <path d="M4 5.5v15" />
              <path d="M8 7h8M8 11h6" />
            </svg>
          </span>
          <span class="notice-quick__text">
            <span class="notice-quick__label">专业库</span>
            <span class="notice-quick__sub">门类与方向</span>
          </span>
          <span class="notice-quick__arrow" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 10h12M11 5l5 5-5 5" />
            </svg>
          </span>
        </router-link>
      </div>

      <div v-if="items.length" class="notice-panel__footer">
        <span class="notice-panel__sync">
          <span class="notice-panel__dot" aria-hidden="true"></span>
          每日 09:00 更新
        </span>
        <button type="button" class="notice-panel__footer-link" @click="$emit('view-all')">
          共 {{ announcements.length }} 条
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 10h12M11 5l5 5-5 5" />
          </svg>
        </button>
      </div>
    </template>
  </aside>
</template>

<style scoped>
.notice-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  background: #ffffff;
  border-radius: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.02),
    0 4px 20px -2px rgba(15, 23, 42, 0.04);
  overflow: hidden;
}

.notice-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-shrink: 0;
  height: 56px;
  padding: 0 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}

.notice-panel__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.05rem;
  font-weight: 800;
  color: #1f2937;
  line-height: 1.3;
}

.notice-panel__title::before {
  content: '';
  width: 4px;
  height: 1.1rem;
  flex-shrink: 0;
  border-radius: 2px;
  background: linear-gradient(180deg, #f97316, #fb923c);
}

.notice-panel__more {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  flex-shrink: 0;
  padding: 0;
  font-size: 0.75rem;
  color: #94a3b8;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.notice-panel__more:hover {
  color: #ea580c;
}

.notice-panel__more svg {
  width: 0.8rem;
  height: 0.8rem;
}

.notice-panel__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.25rem 0.25rem;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.notice-list__item {
  display: flex;
  min-height: 0;
}

.notice-panel__source {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: auto;
  padding: 0.65rem 0.75rem;
  border-radius: 0.75rem;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}

.notice-panel__source-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  border-radius: 50%;
  background: #ffffff;
  color: #94a3b8;
}

.notice-panel__source-icon svg {
  width: 0.9rem;
  height: 0.9rem;
}

.notice-panel__source-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.notice-panel__source-title {
  font-size: 0.72rem;
  font-weight: 600;
  color: #475569;
  line-height: 1.4;
}

.notice-panel__source-sub {
  font-size: 0.66rem;
  color: #94a3b8;
  line-height: 1.4;
}

.notice-quick {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  padding: 0.5rem 1.25rem 1rem;
}

.notice-quick__card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  padding: 0.65rem 0.7rem;
  border-radius: 0.75rem;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.notice-quick__card:hover {
  transform: translateY(-1px);
  background: #ffffff;
  border-color: rgba(249, 115, 22, 0.18);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

.notice-quick__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #64748b;
}

.notice-quick__icon svg {
  width: 1rem;
  height: 1rem;
}

.notice-quick__text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.notice-quick__label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #334155;
  line-height: 1.35;
}

.notice-quick__sub {
  font-size: 0.66rem;
  color: #94a3b8;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notice-quick__arrow {
  width: 0.9rem;
  height: 0.9rem;
  margin-left: auto;
  flex-shrink: 0;
  color: #cbd5e1;
  transition: color 0.2s ease, transform 0.2s ease;
}

.notice-quick__arrow svg {
  width: 100%;
  height: 100%;
}

.notice-quick__card:hover .notice-quick__arrow {
  color: #ea580c;
  transform: translateX(2px);
}

.notice-panel__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-shrink: 0;
  margin: 0 1.25rem 1rem;
  padding: 0.55rem 0.75rem;
  border-radius: 0.625rem;
  background: #f8fafc;
  font-size: 0.68rem;
  color: #64748b;
}

.notice-panel__sync {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 500;
}

.notice-panel__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
}

.notice-panel__footer-link {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0;
  border: none;
  background: none;
  font-size: 0.68rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: color 0.2s ease;
}

.notice-panel__footer-link:hover {
  color: #ea580c;
}

.notice-panel__footer-link svg {
  width: 0.75rem;
  height: 0.75rem;
}

.notice-empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-height: 5rem;
  text-align: center;
}

.notice-empty__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #f8fafc;
  color: #94a3b8;
}

.notice-empty__icon svg {
  width: 1.1rem;
  height: 1.1rem;
}

.notice-empty__title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
}

.notice-empty__sub {
  font-size: 0.7rem;
  color: #94a3b8;
}

.notice-skeleton {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
}

.notice-skeleton__featured {
  height: 5.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%);
  background-size: 400% 100%;
  animation: notice-shimmer 1.4s ease infinite;
}

.notice-skeleton__row {
  height: 2.4rem;
  border-radius: 0.625rem;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%);
  background-size: 400% 100%;
  animation: notice-shimmer 1.4s ease infinite;
}

@keyframes notice-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

@media (max-width: 1024px) {
  .notice-panel {
    height: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .notice-skeleton__featured,
  .notice-skeleton__row {
    animation: none;
  }

  .notice-quick__card,
  .notice-quick__arrow {
    transition: none;
  }

  .notice-quick__card:hover {
    transform: none;
  }
}
</style>
