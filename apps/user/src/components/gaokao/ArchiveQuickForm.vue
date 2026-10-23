<script setup lang="ts">
// apps/user/src/components/gaokao/ArchiveQuickForm.vue
// 高考首页右侧「志愿测算」紧凑卡片：与档案弹窗共用 useArchiveForm 逻辑，
// 保存行为完全一致（saveArchiveSmart 持久化），数据经父组件与导航栏右侧 chip 双向同步。
// 设计：纯白底 + #FFEDD5 边框 + 柔和橙光投影；主按钮活力橙→深橙微渐变。
import { onMounted, watch } from 'vue'
import { useArchiveForm } from '@/composables/useArchiveForm'
import type { GaokaoArchiveVO } from '@/api/gaokao'
import ProvincePicker from './ProvincePicker.vue'
import { useProvinceLock } from '@/composables/useProvinceLock'

const props = defineProps<{
  /** 当前档案（来自导航栏 canonical 源），变化时回填卡片 */
  archive: GaokaoArchiveVO | null
}>()

const emit = defineEmits<{
  /** 保存成功（已入库或已存本地），携带最终表单；父组件据此跳转查询 */
  (e: 'saved', form: Record<string, unknown>): void
  /** 档案字段变化（保存后），携带最新档案，父组件据此同步导航栏 chip */
  (e: 'change', archive: GaokaoArchiveVO | null): void
}>()

// 省份锁定：登录用户保存过档案后不可再改（游客永不锁定）
const { provinceLocked } = useProvinceLock()

const {
  form,
  reformModel,
  modelType,
  modelLoading,
  batchList,
  batchLoading,
  rankDataYear,
  yearOptions,
  saving,
  secondSubjects,
  firstSubjects,
  loadYears,
  toggleSecondSubject,
  toggleFirstSubject,
  initFrom,
  save,
  handleMakePlan,
} = useArchiveForm()

onMounted(async () => {
  await loadYears()
  await initFrom(props.archive)
})

// 档案源变化（初始加载 / 导航栏省份切换 / 弹窗保存）→ 回填卡片
watch(
  () => props.archive,
  (a) => {
    void initFrom(a)
  },
)

async function onMockFill() {
  const ok = await save()
  if (!ok) return
  const merged = { ...(props.archive || {}), ...form } as GaokaoArchiveVO
  emit('change', merged)
  emit('saved', { ...form })
}
</script>

<template>
  <div class="gk-quick-card">
    <!-- 头部：学士帽徽章 + 标题/副标题 -->
    <div class="gk-quick-head">
      <span class="gk-quick-badge" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3z" />
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
        </svg>
      </span>
      <div class="gk-quick-head-text">
        <p class="gk-quick-title">志愿填报</p>
        <p class="gk-quick-sub">完善信息，智能推荐院校与专业</p>
      </div>
    </div>

    <div class="gk-quick-body">
      <!-- 省份 / 年份 -->
      <div class="gk-row">
        <div class="gk-item">
          <label class="gk-label">高考省份</label>
          <ProvincePicker
            v-model="form.gaokaoProvince"
            variant="form"
            placeholder="北京"
            :disabled="provinceLocked"
          />
        </div>
        <div class="gk-item">
          <label class="gk-label">高考年份</label>
          <el-select v-model="form.gaokaoYear" placeholder="选择年份" class="gk-select" popper-class="gk-select-popper">
            <el-option v-for="y in yearOptions" :key="y" :label="`${y}年`" :value="y" />
          </el-select>
        </div>
      </div>

      <!-- 高考科目（按改革模式直接渲染，不展示模式文案） -->
      <div class="gk-item">
        <label class="gk-label">高考科目</label>
        <div v-if="!form.gaokaoProvince || !form.gaokaoYear" class="gk-ph">请先选择省份和年份</div>
        <div v-else-if="modelLoading" class="gk-ph">正在获取科目配置…</div>
        <div v-else-if="!modelType" class="gk-ph gk-ph-warn">该省份暂未配置高考改革模式</div>
        <div v-else class="space-y-2">
          <!-- 传统文理 -->
          <div v-if="modelType === '传统文理'" class="gk-subject-group">
            <button
              v-for="s in ['文科', '理科']"
              :key="s"
              type="button"
              class="gk-subject-btn"
              :class="{ 'is-selected': form.subjectType === s }"
              @click="form.subjectType = s"
            >
              {{ s }}
            </button>
          </div>

          <!-- 3+1+2 -->
          <div v-else-if="modelType === '3+1+2'" class="space-y-2">
            <div>
              <p class="gk-sub-label">首选科目</p>
              <div class="gk-subject-group">
                <button
                  v-for="sub in reformModel!.subjects.first"
                  :key="sub"
                  type="button"
                  class="gk-subject-btn"
                  :class="{ 'is-selected': form.subjectType === sub }"
                  @click="form.subjectType = sub"
                >
                  {{ sub }}
                </button>
              </div>
            </div>
            <div>
              <p class="gk-sub-label">再选科目（选2个）</p>
              <div class="gk-subject-group">
                <button
                  v-for="sub in reformModel!.subjects.second"
                  :key="sub"
                  type="button"
                  class="gk-subject-btn"
                  :class="{ 'is-selected': secondSubjects.includes(sub) }"
                  @click="toggleSecondSubject(sub)"
                >
                  {{ sub }}
                </button>
              </div>
            </div>
          </div>

          <!-- 3+3 -->
          <div v-else-if="modelType === '3+3'">
            <p class="gk-sub-label">选考科目（选3个）</p>
            <div class="gk-subject-group">
              <button
                v-for="sub in reformModel!.subjects.first"
                :key="sub"
                type="button"
                class="gk-subject-btn"
                :class="{ 'is-selected': firstSubjects.includes(sub) }"
                @click="toggleFirstSubject(sub)"
              >
                {{ sub }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 总分 / 位次（gk-row-tight：两框贴拢，间隔最小化） -->
      <div class="gk-row gk-row-tight">
        <div class="gk-item">
          <label class="gk-label">预估分数</label>
          <el-input-number v-model="form.score" :min="0" :max="750" :controls="false" class="gk-number">
            <template #prefix>
              <svg class="gk-ctl-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </template>
            <template #suffix><span class="num-unit">分</span></template>
          </el-input-number>
        </div>
        <div class="gk-item">
          <label class="gk-label">
            对应位次
            <el-tooltip content="填完分数后系统自动查位次，可手动修改" placement="top" effect="dark">
              <svg class="gk-tip-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="7.5" x2="12" y2="13" />
                <line x1="12" y1="16.5" x2="12.01" y2="16.5" />
              </svg>
            </el-tooltip>
          </label>
          <el-input-number v-model="form.rank" :min="0" :controls="false" class="gk-number rank-number">
            <template #prefix>
              <svg class="gk-ctl-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 3v18h18" />
                <rect x="7" y="10" width="3" height="8" />
                <rect x="12" y="6" width="3" height="12" />
                <rect x="17" y="13" width="3" height="5" />
              </svg>
            </template>
            <template #suffix><span class="num-unit">名</span></template>
          </el-input-number>
        </div>
      </div>

      <p v-if="rankDataYear && rankDataYear !== form.gaokaoYear" class="gk-hint">
        位次数据基于 <b>{{ rankDataYear }}</b> 年（当年暂无，自动取最近年份）
      </p>

      <!-- 填报批次：省控线以淡色小字显示在标签 tip 图标右侧（与 dialog 同款） -->
      <div class="gk-item">
        <label class="gk-label">
          填报批次
          <el-tooltip content="选择科目后自动加载可选批次" placement="top" effect="dark">
            <svg class="gk-tip-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="7.5" x2="12" y2="13" />
              <line x1="12" y1="16.5" x2="12.01" y2="16.5" />
            </svg>
          </el-tooltip>
          <span v-if="form.batch && form.batchLineScore" class="gk-batch-line">
            省控线：<b class="gk-batch-score">{{ form.batchLineScore }} 分</b>
          </span>
          <span v-else-if="batchLoading" class="gk-batch-line gk-batch-muted">正在查询批次线…</span>
        </label>
        <div class="gk-row">
          <el-select v-model="form.batch" placeholder="选择批次" :disabled="!batchList.length" class="gk-batch-select" popper-class="gk-select-popper">
            <el-option v-for="b in batchList" :key="b.batch" :label="b.batch" :value="b.batch" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 底部：制定方案 / 模拟填报 -->
    <div class="gk-quick-footer">
      <button type="button" class="gk-plan" @click="handleMakePlan">
        制定方案
        <span class="gk-btn-sub">一键生成专属志愿</span>
      </button>
      <button type="button" class="gk-mock" :disabled="saving" @click="onMockFill">
        {{ saving ? '保存中…' : '模拟填报' }}
        <span class="gk-btn-sub">自选冲稳保院校</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.gk-quick-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #ffffff;
  border: 1px solid var(--neutral-border);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04), 0 12px 32px -8px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

/* 头部 */
.gk-quick-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px 12px;
  flex-shrink: 0;
}

.gk-quick-badge {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: var(--sem-blue-bg);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.12);
}

.gk-quick-badge svg {
  width: 24px;
  height: 24px;
  color: var(--sem-blue);
}

.gk-quick-title {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--text-heading);
}

.gk-quick-sub {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

/* 表单区：可滚动，防止 40% 窄列内容溢出 */
.gk-quick-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 18px 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gk-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* 分数/位次行：与上方「省份|年份」行共用同一栅格(1fr 1fr + 12px 列距)，
   两框撑满整列 → 与省份/年份上下严格对齐（勿再改 column-gap/宽度） */

.gk-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.gk-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;
  /* 窄卡里防止「填报批次」等文字被挤成竖排（右侧省控线小字过长时整体溢出而非换行） */
  white-space: nowrap;
  max-width: 100%;
}

.gk-ctl-ico {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
  color: var(--sem-blue);
}

.gk-tip-ico {
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  color: #94a3b8;
  cursor: help;
}

.gk-tip-ico:hover {
  color: var(--sem-blue);
}

.gk-ph {
  padding: 10px 0;
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  background: #f9fafb;
  border-radius: 10px;
}

.gk-ph-warn {
  color: var(--sem-yellow-deep);
  background: var(--sem-yellow-bg);
  border: 1px solid var(--sem-yellow-soft);
}

.gk-sub-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.gk-subject-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.gk-subject-btn {
  min-width: 64px;
  padding: 8px 14px;
  background: #f8fafc;
  border: 1px solid var(--neutral-border-strong);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.gk-subject-btn:hover {
  border-color: var(--sem-blue-soft);
  background: var(--sem-blue-bg);
  color: var(--sem-blue);
  transform: translateY(-1px);
}

.gk-subject-btn:active {
  transform: scale(0.97);
}

.gk-subject-btn.is-selected,
.gk-subject-btn.is-selected:hover {
  background: var(--sem-blue-bg);
  border-color: var(--sem-blue);
  color: var(--sem-blue);
  box-shadow: 0 0 0 1px var(--sem-blue) inset;
}

.gk-hint {
  margin: -4px 0 0;
  font-size: 11px;
  color: #9ca3af;
  line-height: 1.5;
}

.gk-batch-line {
  font-size: 13px;
  font-weight: 400;
  color: #6b7280;
  white-space: nowrap;
  margin-left: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gk-batch-line .gk-batch-score {
  color: var(--sem-blue);
  font-weight: 700;
}

.gk-batch-line.gk-batch-muted {
  color: #9ca3af;
}

/* 底部按钮 */
.gk-quick-footer {
  display: flex;
  gap: 12px;
  padding: 14px 18px 18px;
  flex-shrink: 0;
  border-top: 1px solid var(--neutral-border);
}

.gk-plan,
.gk-mock {
  flex: 1 1 0;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s ease;
  line-height: 1.2;
}

.gk-plan {
  background: #fff;
  color: #475569;
  border: 1px solid var(--neutral-border-strong);
}

.gk-plan:hover {
  background: var(--sem-blue-bg);
  border-color: var(--sem-blue-soft);
  color: var(--sem-blue);
  transform: translateY(-1px);
}

.gk-mock {
  background: linear-gradient(135deg, var(--brand-orange) 0%, var(--brand-orange-dark) 100%);
  color: #fff;
  border: none;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.28);
}

.gk-mock:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(249, 115, 22, 0.42);
}

.gk-mock:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.gk-btn-sub {
  font-size: 10px;
  font-weight: 400;
  opacity: 0.78;
}
</style>

<style>
/* EP 控件（el-select / el-input-number）：非 scoped（类名为卡片根的后代，唯一无泄漏） */
.gk-quick-card .gk-select .el-select__wrapper,
.gk-quick-card .gk-batch-select .el-select__wrapper,
.gk-quick-card .gk-number .el-input__wrapper {
  box-sizing: border-box;
  height: 44px;
  min-height: 44px;
  flex-wrap: nowrap;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 0 0 1px var(--neutral-border-strong) inset, 0 1px 2px rgba(15, 23, 42, 0.03);
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  transition: box-shadow 0.2s ease, background 0.2s ease;
}

.gk-quick-card .gk-select .el-select__wrapper.is-hovering,
.gk-quick-card .gk-select .el-select__wrapper.is-focused,
.gk-quick-card .gk-batch-select .el-select__wrapper.is-hovering,
.gk-quick-card .gk-batch-select .el-select__wrapper.is-focused,
.gk-quick-card .gk-number .el-input__wrapper.is-focus,
.gk-quick-card .gk-number .el-input__wrapper:hover {
  background: var(--sem-blue-bg);
  box-shadow: 0 0 0 1.5px rgba(59, 130, 246, 0.45) inset, 0 2px 6px rgba(59, 130, 246, 0.1);
}

.gk-quick-card .gk-select .el-select__placeholder,
.gk-quick-card .gk-batch-select .el-select__placeholder {
  color: #94a3b8;
}

.gk-quick-card .gk-select .el-select__selected-item,
.gk-quick-card .gk-batch-select .el-select__selected-item {
  color: #334155;
}

/* 高考年份 / 填报批次：隐藏右侧下拉箭头 svg（与吸顶条下拉规范一致，文字居中） */
.gk-quick-card .gk-select .el-select__suffix,
.gk-quick-card .gk-batch-select .el-select__suffix {
  display: none;
}

/* 高考省份：隐藏定位图标（窄卡省空间；仅 QuickForm 生效，dialog 不受影响） */
.gk-quick-card .pp-trigger-form .pp-ico {
  display: none;
}

/* 高考年份 / 填报批次：图标紧贴文字、整组居中（与弹窗、吸附条统一）；
   字号 16px 与省份按钮一致。
   ⚠️ 布局规则只能挂 .el-select__placeholder（选中标签/占位 div 独有双类），
   千万别挂 .el-select__selected-item —— 该类同时命中 is-hidden 的 input-wrapper
   （必须保持 absolute），覆盖成 static 后隐藏输入框占一行、文字标签被
   flex-wrap 挤到第二行排到盒子外面（「文字掉出盒子」的根因） */
.gk-quick-card .gk-select .el-select__wrapper,
.gk-quick-card .gk-batch-select .el-select__wrapper {
  justify-content: center;
  align-items: center;
  font-size: 16px;
}

.gk-quick-card .gk-select .el-select__selection,
.gk-quick-card .gk-batch-select .el-select__selection {
  flex: 0 1 auto;
  justify-content: center;
  align-items: center;
}

.gk-quick-card .gk-select .el-select__placeholder,
.gk-quick-card .gk-batch-select .el-select__placeholder {
  position: static;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  align-self: center;
  width: auto;
  height: auto;
  line-height: normal;
  transform: none;
  /* 选中文字过宽时在框内省略号截断（自适应按钮宽度），不溢出盒子 */
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.gk-quick-card .gk-select .el-select__placeholder > span,
.gk-quick-card .gk-batch-select .el-select__placeholder > span {
  display: block;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gk-quick-card .gk-number .el-input__inner {
  color: #334155;
  font-weight: 600;
}

.gk-quick-card .gk-number .el-input__wrapper {
  justify-content: center;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 0 10px;
}

.gk-quick-card .gk-number .el-input__inner {
  flex: 1 1 auto;
  min-width: 0;
  width: auto;
  text-align: center;
  font-size: 16px;
}

.gk-quick-card .gk-number .el-input__prefix {
  display: inline-flex;
  align-items: center;
  margin-right: 0;
}

/* 宽度约束（位次框超宽的根因）：.gk-number 就是 el-input-number 根本身，
   之前写 .gk-number .el-input-number 后代选择器匹配不到任何元素；
   且内层 .el-input 不限宽时 input 固有宽(~20字符)会把 wrapper 撑爆外层盒子 */
.gk-quick-card .el-input-number.gk-number {
  width: 100%;
}

.gk-quick-card .gk-number .el-input {
  width: 100%;
  min-width: 0;
}

/* 对应位次：撑满栅格第 2 列 → 与「高考年份」上下对齐（勿再缩宽/左移） */

.gk-quick-card .gk-select {
  width: 100%;
}

/* 填报批次：放入 gk-row 栅格第 1 列 → 宽度与「高考省份」一致（上下对齐） */
.gk-quick-card .gk-batch-select {
  width: 100%;
}

/* ===== 窄卡适配（Hero 4:1 定稿后卡片仅 ~200px 宽）=====
   容器查询：卡片 <240px 时整体等比收紧（字号/内边距/隐藏数字前后缀装饰）；
   移动端(<1024px) Hero 堆叠、卡片变宽时自动还原为常规样式 */
.gk-quick-card {
  container-type: inline-size;
}

/* 栅格直接子项允许收缩（EP 控件 min-width:auto 会把「选择批次」列撑到 100px 破坏对齐） */
.gk-quick-card .gk-row > .el-select,
.gk-quick-card .gk-row > .el-input-number {
  min-width: 0;
}

@container (max-width: 240px) {
  /* 卡片内边距 18 → 12px，给两列控件换空间（列宽 ~81px） */
  .gk-quick-card .gk-quick-body {
    padding-left: 12px;
    padding-right: 12px;
  }

  .gk-quick-card .gk-quick-footer {
    padding-left: 12px;
    padding-right: 12px;
  }

  /* 数字输入：12px 字号 + 极窄内边距 + 隐藏前缀图标/单位后缀
     （76~81px 列内「8位数+图标+名」数学上放不下，66px 的 8 位数是硬下限） */
  .gk-quick-card .gk-number .el-input__inner {
    font-size: 12px;
  }

  .gk-quick-card .gk-number .el-input__wrapper {
    padding: 0 2px;
  }

  .gk-quick-card .gk-number .el-input__prefix,
  .gk-quick-card .gk-number .el-input__suffix {
    display: none;
  }

  /* 下拉框：13px + 收窄内边距（「选择批次」占位 52px 放得下）；省份触发器字号同步 */
  .gk-quick-card .gk-select .el-select__wrapper,
  .gk-quick-card .gk-batch-select .el-select__wrapper {
    font-size: 13px;
    padding: 0 4px;
  }

  .gk-quick-card .pp-trigger-form {
    font-size: 13px;
  }

  /* 底部按钮：等比缩窄（flex:1 1 0 自适应），文字/小字同步缩 */
  .gk-quick-card .gk-plan,
  .gk-quick-card .gk-mock {
    font-size: 13px;
    padding: 8px 4px;
  }

  .gk-quick-card .gk-btn-sub {
    font-size: 9px;
  }
}


</style>
