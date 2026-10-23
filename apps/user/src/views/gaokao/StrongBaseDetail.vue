<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStrongBaseScoreDetail, getStrongBaseUniversityDetail } from '@/api/special'
import type { StrongBaseScoreDetailVO, StrongBaseUniversityDetailVO } from '@/types/special'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<StrongBaseScoreDetailVO | null>(null)

// 强基院校配置
const univConfig = ref<StrongBaseUniversityDetailVO | null>(null)
const configLoading = ref(false)

// 强基院校配置折叠面板（纯展示状态，默认展开）
const configActive = ref<string[]>(['config'])

// ===== 纯展示派生：入围/录取分对比条宽度（以两者较大值为基准归一化） =====
const scoreBars = computed(() => {
  if (!detail.value) return []
  const entry = Number(detail.value.entryScore) || 0
  const admission = Number(detail.value.admissionScore) || 0
  const max = Math.max(entry, admission, 1)
  return [
    { label: '入围分数线', value: entry, pct: Math.max((entry / max) * 100, 2), color: 'linear-gradient(90deg,#f59e0b,#e8722a)' },
    { label: '录取综合分', value: admission, pct: Math.max((admission / max) * 100, 2), color: 'linear-gradient(90deg,#e8722a,#c2410c)' },
  ]
})

async function fetchDetail() {
  const id = route.params.id as string
  if (!id) {
    ElMessage.error('数据ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getStrongBaseScoreDetail(id)
    detail.value = res.data.data
    if (detail.value) {
      fetchUnivConfig(String(detail.value.universityId))
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '获取强基数据详情失败')
  } finally {
    loading.value = false
  }
}

async function fetchUnivConfig(universityId: string) {
  configLoading.value = true
  try {
    const res = await getStrongBaseUniversityDetail(universityId)
    univConfig.value = res.data.data
  } catch {
    univConfig.value = null
  } finally {
    configLoading.value = false
  }
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen strong-base-page">
    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <template v-if="detail">
        <!-- Hero 头部（品牌橙渐变，压过全局 transparent 规则需 !important） -->
        <section class="sb-hero fade-up">
          <div class="hero-orb" aria-hidden="true" />
          <div class="hero-main">
            <div class="hero-badge">强基计划</div>
            <h2 class="hero-title">{{ detail.universityName }}</h2>
            <p class="hero-subtitle">
              {{ detail.majorName }}
              <span v-if="detail.majorCode">({{ detail.majorCode }})</span>
            </p>
            <div class="hero-chips">
              <span class="hero-chip">{{ detail.year }} 年</span>
              <span class="hero-chip">{{ detail.province }}</span>
              <span class="hero-chip">{{ detail.subjectType }}</span>
            </div>
          </div>
        </section>

        <!-- 关键数据 stat 卡 -->
        <section class="stat-grid fade-up delay-1">
          <div class="stat-card">
            <div class="stat-label">入围分数线</div>
            <div class="stat-value">{{ detail.entryScore ?? '-' }}<span class="stat-unit">分</span></div>
            <div class="stat-note">entryScore</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">录取综合分</div>
            <div class="stat-value">{{ detail.admissionScore ?? '-' }}<span class="stat-unit">分</span></div>
            <div class="stat-note">admissionScore</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">计划 / 录取</div>
            <div class="stat-value">{{ detail.planCount ?? '-' }} / {{ detail.admissionCount ?? '-' }}<span class="stat-unit">人</span></div>
            <div class="stat-note">planCount / admissionCount</div>
          </div>
        </section>

        <!-- 入围 / 录取对比 -->
        <section class="white-card fade-up delay-2">
          <h3 class="section-title mb-5">入围 / 录取对比</h3>
          <div v-for="bar in scoreBars" :key="bar.label" class="score-row">
            <div class="score-row-head">
              <span class="score-label">{{ bar.label }}</span>
              <span class="score-value">{{ bar.value || '-' }}</span>
            </div>
            <div class="score-track">
              <div
                class="score-fill"
                :style="{ width: `${bar.pct}%`, background: bar.color }"
              />
            </div>
          </div>
          <div class="score-meta">
            <span>入围类型：{{ detail.entryScoreType || '-' }}</span>
            <span>入围比例：{{ detail.entryRatio || '-' }}</span>
          </div>
        </section>

        <!-- 入围信息 -->
        <section class="white-card fade-up delay-2">
          <h3 class="section-title mb-4">入围信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">入围分数线</span>
              <span class="info-value info-accent">{{ detail.entryScore ?? '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">入围类型</span>
              <span class="info-value">{{ detail.entryScoreType || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">入围比例</span>
              <span class="info-value">{{ detail.entryRatio || '-' }}</span>
            </div>
            <div v-if="detail.entryFormula" class="info-item info-item-full">
              <span class="info-label">计算公式</span>
              <code class="info-code">{{ detail.entryFormula }}</code>
            </div>
          </div>
        </section>

        <!-- 录取信息 -->
        <section class="white-card fade-up delay-2">
          <h3 class="section-title mb-4">录取信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">录取综合分</span>
              <span class="info-value info-accent">{{ detail.admissionScore ?? '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">计划招生</span>
              <span class="info-value">{{ detail.planCount ?? '-' }} 人</span>
            </div>
            <div class="info-item">
              <span class="info-label">实际录取</span>
              <span class="info-value">{{ detail.admissionCount ?? '-' }} 人</span>
            </div>
            <div v-if="detail.admissionFormula" class="info-item info-item-full">
              <span class="info-label">计算公式</span>
              <code class="info-code">{{ detail.admissionFormula }}</code>
            </div>
          </div>
        </section>

        <!-- 备注 -->
        <section v-if="detail.remark" class="white-card fade-up delay-2">
          <h3 class="section-title mb-3">备注</h3>
          <p class="remark-text">{{ detail.remark }}</p>
        </section>

        <!-- 强基院校配置（折叠，默认展开） -->
        <section class="white-card fade-up delay-2" v-loading="configLoading">
          <el-collapse v-model="configActive">
            <el-collapse-item name="config">
              <template #title>
                <div class="config-head">
                  <h3 class="section-title">强基院校配置</h3>
                  <span v-if="univConfig" class="config-state">{{ configActive.includes('config') ? '收起' : '展开' }}</span>
                </div>
              </template>

              <template v-if="univConfig">
                <div class="info-grid mb-4">
                  <div class="info-item">
                    <span class="info-label">强基试点</span>
                    <span :class="['info-value', univConfig.isPilot ? 'info-ok' : 'info-bad']">
                      {{ univConfig.isPilot ? '✓ 是' : '✗ 否' }}
                      <span v-if="univConfig.pilotYear" class="info-hint">({{ univConfig.pilotYear }}年试点)</span>
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">出分前校测</span>
                    <span :class="['info-value', univConfig.testBeforeScore ? 'info-accent' : '']">
                      {{ univConfig.testBeforeScore ? '✓ 是' : '✗ 否' }}
                    </span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">默认入围比例</span>
                    <span class="info-value">{{ univConfig.defaultEntryRatio || '-' }}</span>
                  </div>
                  <div v-if="univConfig.defaultAdmissionFormula" class="info-item">
                    <span class="info-label">录取公式</span>
                    <code class="info-code">{{ univConfig.defaultAdmissionFormula }}</code>
                  </div>
                </div>

                <div class="config-block">
                  <div class="config-label">可选专业</div>
                  <div class="tag-cloud">
                    <span v-for="major in univConfig.availableMajors" :key="major" class="major-tag">
                      {{ major }}
                    </span>
                  </div>
                </div>

                <div class="config-links">
                  <a v-if="univConfig.officialUrl" :href="univConfig.officialUrl" target="_blank" class="link-btn link-btn-outline">
                    官方页面 →
                  </a>
                  <a v-if="univConfig.signupUrl" :href="univConfig.signupUrl" target="_blank" class="link-btn link-btn-solid">
                    报名入口 →
                  </a>
                </div>

                <div v-if="univConfig.specialNotes" class="config-notes">
                  <div class="config-label">特殊说明</div>
                  <p class="notes-text">{{ univConfig.specialNotes }}</p>
                </div>
              </template>

              <div v-else-if="!configLoading" class="config-empty">该院校暂未配置强基计划详细信息</div>
            </el-collapse-item>
          </el-collapse>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
/* ===== 入场动画：全量 stagger ===== */
.fade-up {
  opacity: 0;
  animation: fadeUp 0.5s ease-out forwards;
}
.delay-1 { animation-delay: 100ms; }
.delay-2 { animation-delay: 200ms; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .fade-up { animation: none; opacity: 1; }
}

/* ===== Hero ===== */
.sb-hero {
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
  padding: 32px 36px;
  border-radius: 20px;
  /* 全局 .app-shell main > * 会强制透明，必须 !important 保证实心橙渐变 */
  background: linear-gradient(135deg, #e8722a 0%, #f59e0b 100%) !important;
  color: #fff;
}
.hero-orb {
  position: absolute;
  top: -60px;
  right: -40px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.25), transparent 70%);
  pointer-events: none;
}
.hero-orb::after {
  content: '';
  position: absolute;
  bottom: -70px;
  left: -30px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.12), transparent 70%);
}
.hero-main {
  position: relative;
  z-index: 1;
}
.hero-badge {
  display: inline-block;
  margin-bottom: 10px;
  padding: 3px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
  font-size: 12px;
  color: #fff;
}
.hero-title {
  margin: 0 0 8px 0;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
}
.hero-subtitle {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}
.hero-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.hero-chip {
  display: inline-block;
  padding: 5px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  color: #b45309;
  font-size: 13px;
  font-weight: 500;
}

/* ===== stat 卡 ===== */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
@media (max-width: 640px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
.stat-card {
  /* 全局 transparent 规则：卡片必须白，需 !important */
  background: #ffffff !important;
  border: 1px solid #f0e9e3;
  border-top: 3px solid #e8722a;
  border-radius: 14px;
  padding: 18px;
}
.stat-label {
  font-size: 12px;
  color: #9ca3af;
}
.stat-value {
  margin-top: 8px;
  font-size: 26px;
  font-weight: 700;
  color: #e8722a;
}
.stat-unit {
  margin-left: 2px;
  font-size: 12px;
  color: #9ca3af;
  font-weight: 400;
}
.stat-note {
  margin-top: 6px;
  font-size: 10px;
  color: #d6d3d1;
}

/* ===== 白卡 ===== */
.white-card {
  background: #ffffff !important;
  border: 1px solid #f0e9e3;
  border-radius: 16px;
  padding: 22px 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.section-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #1f2937;
}

/* ===== 分数对比条 ===== */
.score-row {
  margin-bottom: 14px;
}
.score-row:last-of-type {
  margin-bottom: 16px;
}
.score-row-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.score-label {
  font-size: 13px;
  color: #6b7280;
}
.score-value {
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;
}
.score-track {
  height: 22px;
  border-radius: 8px;
  background: #faf6f2;
  overflow: hidden;
}
.score-fill {
  height: 100%;
  border-radius: 8px;
  transition: width 0.6s ease;
}
.score-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #f3efea;
  font-size: 12px;
  color: #6b7280;
}

/* ===== 信息网格 ===== */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-item-full {
  grid-column: 1 / -1;
}
.info-label {
  font-size: 12px;
  color: #9ca3af;
}
.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}
.info-accent {
  color: #e8722a;
  font-weight: 700;
}
.info-ok {
  color: #16a34a;
}
.info-bad {
  color: #dc2626;
}
.info-hint {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 400;
}
.info-code {
  align-self: flex-start;
  padding: 3px 8px;
  border-radius: 6px;
  background: #faf6f2;
  font-size: 13px;
  color: #1f2937;
}
.remark-text {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.8;
}

/* ===== 折叠面板 ===== */
.config-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.config-state {
  font-size: 12px;
  color: #9ca3af;
}
.config-block {
  margin-bottom: 16px;
}
.config-label {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.major-tag {
  padding: 4px 12px;
  border-radius: 999px;
  background: #fff3e8;
  color: #e8722a;
  font-size: 12px;
}
.config-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}
.link-btn {
  display: inline-block;
  padding: 8px 18px;
  border-radius: 10px;
  font-size: 13px;
  text-decoration: none;
  transition: filter 0.2s ease;
}
.link-btn:hover {
  filter: brightness(0.95);
}
.link-btn-outline {
  background: #fff3e8;
  color: #e8722a;
  border: 1px solid #f5c9a8;
}
.link-btn-solid {
  background: linear-gradient(90deg, #e8722a, #f59e0b);
  color: #fff;
}
.config-notes {
  padding: 14px 16px;
  border-radius: 12px;
  background: #fffaf5;
  border: 1px solid #f5ece3;
}
.notes-text {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.7;
}
.config-empty {
  padding: 24px 0;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

/* el-collapse 容器去默认边框，融入白卡 */
:deep(.el-collapse) {
  border: none;
}
:deep(.el-collapse-item__header) {
  border: none;
  height: auto;
  padding: 4px 0;
  background: transparent;
}
:deep(.el-collapse-item__wrap) {
  border: none;
}
</style>
