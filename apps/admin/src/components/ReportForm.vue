<script setup lang="ts">
import JsonbArrayEditor from './JsonbArrayEditor.vue'
import JsonbObjectEditor, { type ColumnDef } from './JsonbObjectEditor.vue'
import CareerEditor from './CareerEditor.vue'
import SubjectsDetailEditor from './SubjectsDetailEditor.vue'

// reportData 由父组件以响应式对象方式传入（与父共享同一引用，直接读写其字段）
const props = defineProps<{
  reportData: {
    subtitle: string
    overview: { title: string; descriptions: string[] }
    prospects: {
      employmentRate: string
      masterSalary: string
      furtherStudyRate: string
      fortune500Rate: string
      salaryGrowthRate: string
      overseasRate: string
    }
    trends: { highGrowthTracks: string[]; policyOrientations: string[]; environmentAnalysis: string[] }
    citySalary: { cityName: string; minSalary: number; maxSalary: number }[]
    salary: { majorName: string; minSalary: number; maxSalary: number }[]
    postgraduate: { title: string; directions: string[] }
    career: any[]
    subjectsDetail: any[]
    majorCompose: { subjectName: string; percentage: number }[]
    disclaimer: { text: string; updateTime: string; version: string; compileUnit: string }
  }
}>()

const citySalaryColumns: ColumnDef[] = [
  { key: 'cityName', label: '城市', width: '25%' },
  { key: 'minSalary', label: '最低薪资', type: 'number', width: '25%' },
  { key: 'maxSalary', label: '最高薪资', type: 'number', width: '25%' },
]
const salaryColumns: ColumnDef[] = [
  { key: 'majorName', label: '专业', width: '25%' },
  { key: 'minSalary', label: '最低薪资', type: 'number', width: '25%' },
  { key: 'maxSalary', label: '最高薪资', type: 'number', width: '25%' },
]
const majorComposeColumns: ColumnDef[] = [
  { key: 'subjectName', label: '学科名称', width: '50%' },
  { key: 'percentage', label: '占比(%)', type: 'number', width: '50%' },
]
</script>

<template>
  <div class="report-form">
    <el-form label-width="120px">
      <el-form-item label="副标题">
        <el-input v-model="reportData.subtitle" placeholder="如：2024 年度深度分析" />
      </el-form-item>
    </el-form>

    <div class="section-block">
      <div class="section-title">概况 (overview)</div>
      <el-form label-width="120px">
        <el-form-item label="标题">
          <el-input v-model="reportData.overview.title" placeholder="概况标题" />
        </el-form-item>
      </el-form>
      <JsonbArrayEditor v-model="reportData.overview.descriptions" label="描述列表" placeholder="输入描述内容" />
    </div>

    <div class="section-block">
      <div class="section-title">前景数据 (prospects)</div>
      <el-form label-width="120px">
        <el-form-item label="就业率">
          <el-input v-model="reportData.prospects.employmentRate" placeholder="如：95%" />
        </el-form-item>
        <el-form-item label="平均薪资">
          <el-input v-model="reportData.prospects.masterSalary" placeholder="如：15000元/月" />
        </el-form-item>
        <el-form-item label="深造率">
          <el-input v-model="reportData.prospects.furtherStudyRate" placeholder="如：42%" />
        </el-form-item>
        <el-form-item label="500强就职率">
          <el-input v-model="reportData.prospects.fortune500Rate" placeholder="如：28%" />
        </el-form-item>
        <el-form-item label="薪资增长率">
          <el-input v-model="reportData.prospects.salaryGrowthRate" placeholder="如：12%" />
        </el-form-item>
        <el-form-item label="海外留学率">
          <el-input v-model="reportData.prospects.overseasRate" placeholder="如：18%" />
        </el-form-item>
      </el-form>
    </div>

    <div class="section-block">
      <div class="section-title">趋势分析 (trends)</div>
      <JsonbArrayEditor v-model="reportData.trends.highGrowthTracks" label="高增长领域" placeholder="如：人工智能" />
      <JsonbArrayEditor v-model="reportData.trends.policyOrientations" label="政策导向" placeholder="如：新工科建设" />
      <JsonbArrayEditor v-model="reportData.trends.environmentAnalysis" label="环境分析" placeholder="输入分析内容" />
    </div>

    <div class="section-block">
      <JsonbObjectEditor v-model="reportData.citySalary" :columns="citySalaryColumns" label="城市薪资 (citySalary)" />
    </div>

    <div class="section-block">
      <JsonbObjectEditor v-model="reportData.salary" :columns="salaryColumns" label="薪资数据 (salary)" />
    </div>

    <div class="section-block">
      <div class="section-title">考研方向 (postgraduate)</div>
      <el-form label-width="120px">
        <el-form-item label="标题">
          <el-input v-model="reportData.postgraduate.title" placeholder="如：考研方向分析" />
        </el-form-item>
      </el-form>
      <JsonbArrayEditor v-model="reportData.postgraduate.directions" label="方向列表" placeholder="如：计算机科学与技术" />
    </div>

    <div class="section-block">
      <JsonbObjectEditor v-model="reportData.majorCompose" :columns="majorComposeColumns" label="专业构成 (majorCompose)" />
    </div>

    <div class="section-block">
      <CareerEditor v-model="reportData.career" label="职业路径 (career)" />
    </div>

    <div class="section-block">
      <SubjectsDetailEditor v-model="reportData.subjectsDetail" label="专业详情 (subjectsDetail)" />
    </div>

    <div class="section-block">
      <div class="section-title">免责声明 (disclaimer)</div>
      <el-form label-width="120px">
        <el-form-item label="声明内容">
          <el-input v-model="reportData.disclaimer.text" type="textarea" :rows="2" placeholder="免责声明文本" />
        </el-form-item>
        <el-form-item label="更新时间">
          <el-input v-model="reportData.disclaimer.updateTime" placeholder="如：2024-01-01" />
        </el-form-item>
        <el-form-item label="版本">
          <el-input v-model="reportData.disclaimer.version" placeholder="如：v1.0" />
        </el-form-item>
        <el-form-item label="编制单位">
          <el-input v-model="reportData.disclaimer.compileUnit" placeholder="如：海枫研究院" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.report-form {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}
.section-block {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(249, 115, 22, 0.1);
}
.section-block:last-child {
  border-bottom: none;
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #f97316;
}
.report-form :deep(.el-tabs__header) {
  background: linear-gradient(180deg, #fff7ed, #ffedd5);
}
.report-form :deep(.el-tabs__item.is-active) {
  color: #f97316;
}
.report-form :deep(.el-tabs__active-bar) {
  background: #f97316;
}
</style>
