<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStrongBaseScoreList } from '@/api/special'
import { ProvinceOptions } from '@haifeng/shared'
import type { StrongBaseScoreListVO } from '@/types/special'
import { SubjectTypeOptions, EntryScoreTypeOptions } from '@/types/special'

const router = useRouter()

const records = ref<StrongBaseScoreListVO[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 10
const total = ref(0)

// ===== 查询条件（与 StrongBaseScoreQueryDTO 对应） =====
const sYear = ref<number | undefined>(undefined)
const sProvince = ref('')
const sSubjectType = ref('')
const sEntryScoreType = ref('')
const sUniversityName = ref('')
const sMajorName = ref('')
const sMajorCode = ref('')

// 生成年份选项（近5年）
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years: { value: number | undefined; label: string }[] = [{ value: undefined, label: '全部' }]
  for (let i = 0; i < 5; i++) {
    const y = currentYear - i
    years.push({ value: y, label: `${y}年` })
  }
  return years
})

async function fetchData() {
  loading.value = true
  try {
    const res = await getStrongBaseScoreList({
      page: currentPage.value,
      size: pageSize,
      year: sYear.value || undefined,
      province: sProvince.value || undefined,
      subjectType: sSubjectType.value || undefined,
      entryScoreType: sEntryScoreType.value || undefined,
      universityName: sUniversityName.value || undefined,
      majorName: sMajorName.value || undefined,
      majorCode: sMajorCode.value || undefined,
    })
    records.value = res.data.data.records
    total.value = res.data.data.total
  } catch (e: any) {
    ElMessage.error(e?.message || '获取强基数据失败')
  } finally {
    loading.value = false
  }
}

function onSearch() {
  currentPage.value = 1
  fetchData()
}

function onPageChange(page: number) {
  currentPage.value = page
  fetchData()
}

function viewDetail(id: string) {
  router.push(`/special/strong-base/${id}`)
}

onMounted(fetchData)
</script>

<template>
  <section class="sb-section fade-up delay-1">
    <div class="sb-head">
      <h3 class="sb-title">强基计划入围/录取数据</h3>
      <span class="sb-count">共 {{ total }} 条</span>
    </div>

    <!-- 搜索栏 -->
    <div class="white-card mb-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label class="search-label">年份</label>
          <el-select v-model="sYear" placeholder="全部" clearable class="w-full">
            <el-option
              v-for="opt in yearOptions"
              :key="String(opt.value ?? 'all')"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
        <div>
          <label class="search-label">省份</label>
          <el-select v-model="sProvince" placeholder="全部" clearable filterable class="w-full">
            <el-option v-for="opt in ProvinceOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
        <div>
          <label class="search-label">科类</label>
          <el-select v-model="sSubjectType" placeholder="全部" clearable class="w-full">
            <el-option v-for="opt in SubjectTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
        <div>
          <label class="search-label">入围类型</label>
          <el-select v-model="sEntryScoreType" placeholder="全部" clearable class="w-full">
            <el-option v-for="opt in EntryScoreTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="search-label">大学名称</label>
          <input
            v-model="sUniversityName"
            type="text"
            placeholder="模糊搜索"
            class="search-input"
            @keyup.enter="onSearch"
          />
        </div>
        <div>
          <label class="search-label">专业名称</label>
          <input
            v-model="sMajorName"
            type="text"
            placeholder="模糊搜索"
            class="search-input"
            @keyup.enter="onSearch"
          />
        </div>
        <div>
          <label class="search-label">专业代码</label>
          <input
            v-model="sMajorCode"
            type="text"
            placeholder="模糊搜索"
            class="search-input"
            @keyup.enter="onSearch"
          />
        </div>
      </div>
      <div class="flex justify-center">
        <button class="search-btn" @click="onSearch">搜索</button>
      </div>
    </div>

    <!-- 卡片网格 -->
    <div v-loading="loading" class="min-h-[200px]">
      <div v-if="records.length" class="sb-grid">
        <div
          v-for="(item, idx) in records"
          :key="item.id"
          class="sb-card fade-up"
          :style="{ animationDelay: `${(idx % 4) * 70}ms` }"
        >
          <div class="sb-card-head">
            <div class="sb-card-title">
              <span class="sb-avatar">{{ item.universityName?.slice(0, 1) || '大' }}</span>
              <h4 class="sb-name">{{ item.universityName }}</h4>
            </div>
            <span class="sb-year">{{ item.year }}年</span>
          </div>
          <p class="sb-major">
            {{ item.majorName }}
            <span v-if="item.majorCode" class="sb-major-code">({{ item.majorCode }})</span>
          </p>
          <div class="sb-meta">
            <span>省份: {{ item.province }}</span>
            <span>科类: {{ item.subjectType }}</span>
            <span>入围类型: {{ item.entryScoreType }}</span>
            <span>入围比例: {{ item.entryRatio }}</span>
          </div>
          <div class="sb-scores">
            <div class="sb-score">
              <span class="sb-score-label">入围分</span>
              <span class="sb-score-value">{{ item.entryScore ?? '-' }}</span>
            </div>
            <div class="sb-score">
              <span class="sb-score-label">录取分</span>
              <span class="sb-score-value">{{ item.admissionScore ?? '-' }}</span>
            </div>
            <div class="sb-score">
              <span class="sb-score-label">计划/录取</span>
              <span class="sb-score-value">{{ item.planCount ?? '-' }}/{{ item.admissionCount ?? '-' }}</span>
            </div>
          </div>
          <button class="univ-btn" @click="viewDetail(item.id)">查看详情</button>
        </div>
      </div>
      <div v-else-if="!loading" class="empty-tip">暂无强基计划数据</div>
    </div>

    <div v-if="total > pageSize" class="mt-6 flex justify-center">
      <el-pagination
        background
        layout="prev, pager, next, total"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="onPageChange"
      />
    </div>
  </section>
</template>

<style scoped>
/* ===== 入场动画（与父级 GaokaoChannelUniversities 一致） ===== */
.fade-up {
  opacity: 0;
  animation: fadeUp 0.5s ease-out forwards;
}
.delay-1 { animation-delay: 100ms; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .fade-up { animation: none; opacity: 1; }
}

/* ===== 区块头部 ===== */
.sb-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.sb-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #1f2937;
}
.sb-count {
  font-size: 13px;
  color: #9ca3af;
}

/* ===== 白卡（压过全局 transparent 规则） ===== */
.white-card {
  background: #ffffff !important;
  border: 1px solid #f0e9e3;
  border-radius: 16px;
  padding: 20px 22px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ===== 搜索栏 ===== */
.search-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}
.search-input {
  width: 100%;
  padding: 9px 14px;
  border-radius: 10px;
  border: 1px solid #ece4db;
  background: #fff;
  font-size: 14px;
  color: #1f2937;
  outline: none;
  transition: border-color 0.2s ease;
}
.search-input:focus {
  border-color: #e8722a;
}
.search-btn {
  padding: 10px 32px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(90deg, #e8722a, #f59e0b);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(232, 114, 42, 0.25);
  transition: filter 0.2s ease;
}
.search-btn:hover {
  filter: brightness(1.05);
}

/* ===== 强基卡片 ===== */
.sb-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
@media (min-width: 768px) {
  .sb-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.sb-card {
  padding: 18px 18px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #f0e9e3;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.sb-card:hover {
  transform: translateY(-3px);
  border-color: #fdd9c3;
  box-shadow: 0 8px 20px rgba(232, 114, 42, 0.1);
}
.sb-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.sb-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.sb-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: linear-gradient(135deg, #fff3e8, #ffe8d6);
  color: #e8722a;
  font-size: 16px;
  font-weight: 700;
}
.sb-name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sb-year {
  flex-shrink: 0;
  padding: 2px 10px;
  border-radius: 999px;
  background: #fff3e8;
  color: #e8722a;
  font-size: 12px;
  font-weight: 500;
}
.sb-major {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #4b5563;
}
.sb-major-code {
  font-size: 12px;
  color: #9ca3af;
}
.sb-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 12px;
  padding: 10px 12px;
  margin-bottom: 12px;
  border-radius: 10px;
  background: #faf7f4;
  font-size: 12px;
  color: #6b7280;
}
.sb-scores {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 14px;
}
.sb-score {
  padding: 10px 0;
  text-align: center;
  border-radius: 10px;
  background: #fffaf5;
  border: 1px solid #f5ece3;
}
.sb-score-label {
  display: block;
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 4px;
}
.sb-score-value {
  font-size: 16px;
  font-weight: 700;
  color: #e8722a;
}
.univ-btn {
  width: 100%;
  padding: 8px 0;
  border: 1px solid #f5c9a8;
  border-radius: 10px;
  background: transparent;
  color: #e8722a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.univ-btn:hover {
  background: #fff3e8;
}
.empty-tip {
  padding: 48px 0;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}
</style>
