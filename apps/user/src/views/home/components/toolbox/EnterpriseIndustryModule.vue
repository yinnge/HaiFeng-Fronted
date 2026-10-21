<script setup lang="ts">
import { computed } from 'vue'
import type { EnterpriseListVO } from '@/types/enterprise'
import type { IndustryListVO } from '@/types/industry'
import ToolboxSkeleton from './ToolboxSkeleton.vue'
import type { EnterpriseTab } from './types'
import { formatGrowth } from './format'

const props = defineProps<{
  enterprises: EnterpriseListVO[]
  industries: IndustryListVO[]
  activeTab: EnterpriseTab
  enterpriseLoading: boolean
  industryLoading: boolean
  enterpriseError: boolean
  industryError: boolean
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', tab: EnterpriseTab): void
  (e: 'retry', tab: EnterpriseTab): void
}>()

const activeCount = computed(() =>
  props.activeTab === 'enterprise' ? props.enterprises.length : props.industries.length,
)
const activeLoading = computed(() =>
  props.activeTab === 'enterprise' ? props.enterpriseLoading : props.industryLoading,
)
const activeError = computed(() =>
  props.activeTab === 'enterprise' ? props.enterpriseError : props.industryError,
)
</script>

<template>
  <section id="toolbox-enterprise" class="tbx-panel">
    <header class="tbx-head">
      <span class="tbx-num">05</span>
      <div class="tbx-head-main">
        <div class="tbx-title-row">
          <h3 class="tbx-title">企业与行业</h3>
          <div class="tbx-tabs" role="tablist" aria-label="企业与行业">
            <button
              type="button"
              class="tbx-tab"
              :class="{ 'is-active': activeTab === 'enterprise' }"
              role="tab"
              :aria-selected="activeTab === 'enterprise'"
              @click="emit('update:activeTab', 'enterprise')"
            >
              企业
            </button>
            <button
              type="button"
              class="tbx-tab"
              :class="{ 'is-active': activeTab === 'industry' }"
              role="tab"
              :aria-selected="activeTab === 'industry'"
              @click="emit('update:activeTab', 'industry')"
            >
              行业
            </button>
          </div>
        </div>
        <p class="tbx-desc">行业趋势与龙头企业，规模与人才需求一览</p>
      </div>
    </header>

    <Transition name="tbx-fade" mode="out-in">
      <ToolboxSkeleton v-if="activeLoading && !activeCount" key="skeleton" variant="stack" :count="2" />

      <div v-else-if="activeCount" :key="activeTab" class="tbx-stack">
        <template v-if="activeTab === 'enterprise'">
          <router-link
            v-for="item in enterprises"
            :key="item.id"
            :to="{
              path: `/enterprise/${item.id}/positions`,
              query: {
                name: item.enterpriseName,
                nature: item.enterpriseNature,
                city: item.cityName,
                logoUrl: item.logoUrl || '',
                region: item.region || '',
                scale: item.enterpriseScale || '',
                mainBusiness: item.mainBusiness || '',
              },
            }"
            class="tbx-card"
          >
            <div class="tbx-card-top">
              <div class="tbx-card-main">
                <h4 class="tbx-card-title">{{ item.enterpriseName }}</h4>
                <div class="tbx-tags">
                  <span class="tbx-pill tbx-pill--tag">{{ item.enterpriseNature }}</span>
                  <span v-if="item.enterpriseType" class="tbx-pill tbx-pill--type">{{ item.enterpriseType }}</span>
                </div>
              </div>
              <span class="tbx-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </span>
            </div>
            <div class="tbx-meta">
              <span>城市 <strong>{{ item.cityName || '—' }}</strong></span>
              <span>规模 <strong>{{ item.enterpriseScale || '—' }}</strong></span>
            </div>
            <p v-if="item.mainBusiness" class="tbx-brief">{{ item.mainBusiness }}</p>
          </router-link>
        </template>

        <template v-else>
          <router-link v-for="item in industries" :key="item.id" :to="`/industry/${item.id}`" class="tbx-card">
            <div class="tbx-card-top">
              <div class="tbx-card-main">
                <h4 class="tbx-card-title">{{ item.industryName }}</h4>
                <div class="tbx-tags">
                  <span class="tbx-pill tbx-pill--tag">{{ item.category }}</span>
                </div>
              </div>
              <span class="tbx-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </span>
            </div>
            <div class="tbx-meta">
              <span>年增长 <strong>{{ formatGrowth(item.annualGrowthRate) }}</strong></span>
              <span>市场规模 <strong>{{ item.marketScale || '—' }}</strong></span>
            </div>
            <p v-if="item.talentGap" class="tbx-brief">人才缺口：{{ item.talentGap }}</p>
          </router-link>
        </template>
      </div>

      <div v-else key="empty" class="tbx-empty">
        <p>暂无{{ activeTab === 'enterprise' ? '企业' : '行业' }}数据</p>
        <button v-if="activeError" type="button" class="tbx-retry" @click="emit('retry', activeTab)">重新加载</button>
      </div>
    </Transition>

    <div class="tbx-actions">
      <router-link to="/enterprise" class="tbx-more-btn">
        查看全部企业
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </router-link>
      <router-link to="/industry" class="tbx-more-btn">
        查看全部行业
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </router-link>
    </div>
  </section>
</template>
