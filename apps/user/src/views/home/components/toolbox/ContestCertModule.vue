<script setup lang="ts">
import { computed } from 'vue'
import type { CertificateListVO, CompetitionListVO } from '@/types/certificate'
import ToolboxSkeleton from './ToolboxSkeleton.vue'
import type { ContestTab } from './types'
import { formatFee } from './format'

const props = defineProps<{
  competitions: CompetitionListVO[]
  certificates: CertificateListVO[]
  activeTab: ContestTab
  competitionLoading: boolean
  certificateLoading: boolean
  competitionError: boolean
  certificateError: boolean
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', tab: ContestTab): void
  (e: 'retry', tab: ContestTab): void
}>()

const activeCount = computed(() =>
  props.activeTab === 'contest' ? props.competitions.length : props.certificates.length,
)
const activeLoading = computed(() =>
  props.activeTab === 'contest' ? props.competitionLoading : props.certificateLoading,
)
const activeError = computed(() =>
  props.activeTab === 'contest' ? props.competitionError : props.certificateError,
)
</script>

<template>
  <section id="toolbox-contest" class="tbx-panel">
    <header class="tbx-head">
      <span class="tbx-num">04</span>
      <div class="tbx-head-main">
        <div class="tbx-title-row">
          <h3 class="tbx-title">竞赛与证书</h3>
          <div class="tbx-tabs" role="tablist" aria-label="竞赛与证书">
            <button
              type="button"
              class="tbx-tab"
              :class="{ 'is-active': activeTab === 'contest' }"
              role="tab"
              :aria-selected="activeTab === 'contest'"
              @click="emit('update:activeTab', 'contest')"
            >
              竞赛
            </button>
            <button
              type="button"
              class="tbx-tab"
              :class="{ 'is-active': activeTab === 'certificate' }"
              role="tab"
              :aria-selected="activeTab === 'certificate'"
              @click="emit('update:activeTab', 'certificate')"
            >
              证书
            </button>
          </div>
        </div>
        <p class="tbx-desc">国家级、省级赛事信息与证书考取一览</p>
      </div>
    </header>

    <Transition name="tbx-fade" mode="out-in">
      <ToolboxSkeleton v-if="activeLoading && !activeCount" key="skeleton" variant="stack" :count="2" />

      <div v-else-if="activeCount" :key="activeTab" class="tbx-stack">
        <template v-if="activeTab === 'contest'">
          <router-link v-for="item in competitions" :key="item.id" :to="`/competition/${item.id}`" class="tbx-card">
            <div class="tbx-card-top">
              <div class="tbx-card-main">
                <h4 class="tbx-card-title">{{ item.compName }}</h4>
                <div class="tbx-tags">
                  <span class="tbx-pill tbx-pill--tag">{{ item.compLevel }}</span>
                </div>
              </div>
              <span class="tbx-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </span>
            </div>
            <div class="tbx-meta">
              <span>报名时间</span>
              <strong>{{ item.registrationTime || '—' }}</strong>
            </div>
          </router-link>
        </template>

        <template v-else>
          <router-link
            v-for="item in certificates"
            :key="item.id"
            :to="{ path: '/certificate', query: { certId: item.id } }"
            class="tbx-card"
          >
            <div class="tbx-card-top">
              <div class="tbx-card-main">
                <h4 class="tbx-card-title">{{ item.certName }}</h4>
                <div class="tbx-tags">
                  <span class="tbx-pill tbx-pill--tag">{{ item.category }}</span>
                  <span class="tbx-pill tbx-pill--type">{{ item.certLevel }}</span>
                </div>
              </div>
              <span class="tbx-arrow" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </span>
            </div>
            <div class="tbx-meta">
              <span>考试 <strong>{{ item.examTime || '—' }}</strong></span>
              <span>费用 <strong>{{ formatFee(item.examFee) }}</strong></span>
            </div>
          </router-link>
        </template>
      </div>

      <div v-else key="empty" class="tbx-empty">
        <p>暂无{{ activeTab === 'contest' ? '竞赛' : '证书' }}数据</p>
        <button v-if="activeError" type="button" class="tbx-retry" @click="emit('retry', activeTab)">重新加载</button>
      </div>
    </Transition>

    <div class="tbx-actions">
      <router-link to="/competition" class="tbx-more-btn">
        查看全部竞赛
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </router-link>
      <router-link to="/certificate" class="tbx-more-btn">
        查看全部证书
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </router-link>
    </div>
  </section>
</template>
