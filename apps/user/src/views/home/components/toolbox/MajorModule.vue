<script setup lang="ts">
import { computed } from 'vue'
import type { MajorListVO } from '@/types/major'
import type { PostgradMajorListVO } from '@/types/postgrad-major'
import ToolboxSkeleton from './ToolboxSkeleton.vue'
import type { MajorTab } from './types'
import { formatRate, formatSalary } from './format'

const props = defineProps<{
  undergrad: MajorListVO[]
  postgrad: PostgradMajorListVO[]
  activeTab: MajorTab
  undergradLoading: boolean
  postgradLoading: boolean
  undergradError: boolean
  postgradError: boolean
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', tab: MajorTab): void
  (e: 'retry', tab: MajorTab): void
}>()

const activeCount = computed(() =>
  props.activeTab === 'undergrad' ? props.undergrad.length : props.postgrad.length,
)
const activeLoading = computed(() =>
  props.activeTab === 'undergrad' ? props.undergradLoading : props.postgradLoading,
)
const activeError = computed(() =>
  props.activeTab === 'undergrad' ? props.undergradError : props.postgradError,
)
</script>

<template>
  <section id="toolbox-major" class="tbx-panel">
    <header class="tbx-head">
      <span class="tbx-num">02</span>
      <div class="tbx-head-main">
        <div class="tbx-title-row">
          <h3 class="tbx-title">专业库</h3>
          <div class="tbx-tabs" role="tablist" aria-label="专业类型">
            <button
              type="button"
              class="tbx-tab"
              :class="{ 'is-active': activeTab === 'undergrad' }"
              role="tab"
              :aria-selected="activeTab === 'undergrad'"
              @click="emit('update:activeTab', 'undergrad')"
            >
              本科专业
            </button>
            <button
              type="button"
              class="tbx-tab"
              :class="{ 'is-active': activeTab === 'postgrad' }"
              role="tab"
              :aria-selected="activeTab === 'postgrad'"
              @click="emit('update:activeTab', 'postgrad')"
            >
              考研专业
            </button>
          </div>
        </div>
        <p class="tbx-desc">热门与冷门并行，就业率与薪资水平一次看清</p>
      </div>
      <div class="tbx-head-actions">
        <router-link :to="activeTab === 'undergrad' ? '/major' : '/postgrad-major'" class="tbx-link">
          查看全部专业
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </router-link>
      </div>
    </header>

    <Transition name="tbx-fade" mode="out-in">
      <ToolboxSkeleton v-if="activeLoading && !activeCount" key="skeleton" variant="major" :count="6" />

      <div v-else-if="activeCount" :key="activeTab" class="tbx-grid tbx-grid--major">
        <template v-if="activeTab === 'undergrad'">
          <router-link v-for="item in undergrad" :key="item.id" :to="`/major/${item.id}`" class="tbx-card">
            <div class="tbx-card-top">
              <div class="tbx-card-main">
                <h4 class="tbx-card-title">{{ item.majorName }}</h4>
                <div class="tbx-tags">
                  <span class="tbx-pill tbx-pill--tag">{{ item.majorCategory }}</span>
                  <span class="tbx-pill tbx-pill--type">{{ item.degreeAwarded }}</span>
                </div>
              </div>
              <span class="tbx-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </span>
            </div>
            <div class="tbx-meta">
              <span>就业率 <strong>{{ formatRate(item.employmentRate) }}</strong></span>
              <span>薪资 <strong>{{ formatSalary(item.salaryMin, item.salaryMax) }}</strong></span>
            </div>
          </router-link>
        </template>

        <template v-else>
          <router-link
            v-for="item in postgrad"
            :key="item.id"
            :to="{ path: '/postgrad-major', query: { majorId: item.id } }"
            class="tbx-card"
          >
            <div class="tbx-card-top">
              <div class="tbx-card-main">
                <h4 class="tbx-card-title">{{ item.majorName }}</h4>
                <div class="tbx-tags">
                  <span class="tbx-pill tbx-pill--tag">{{ item.degreeType }}</span>
                  <span class="tbx-pill tbx-pill--type">{{ item.disciplineCategory }}</span>
                </div>
              </div>
              <span class="tbx-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </span>
            </div>
            <div class="tbx-meta">
              <span>热度 <strong>{{ item.popularity || '—' }}</strong></span>
              <span>难度 <strong>{{ item.difficulty || '—' }}</strong></span>
            </div>
            <p v-if="item.brief" class="tbx-brief">{{ item.brief }}</p>
          </router-link>
        </template>
      </div>

      <div v-else key="empty" class="tbx-empty">
        <p>暂无{{ activeTab === 'undergrad' ? '本科' : '考研' }}专业数据</p>
        <button v-if="activeError" type="button" class="tbx-retry" @click="emit('retry', activeTab)">重新加载</button>
      </div>
    </Transition>
  </section>
</template>
