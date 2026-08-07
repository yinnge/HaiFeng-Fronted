<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getNoticeDetail } from '@/api/employment/content/notice'
import type { NoticeDetailVO } from '@/types/employment/content/notice'

const props = defineProps<{
  id: string
}>()

const loading = ref(false)
const detail = ref<NoticeDetailVO | null>(null)

const noticeCategoryMap: Record<string, string> = {
  civil: '公务员',
  institution: '事业单位',
  military: '军队文职',
  selection: '选调生',
  teacher: '教师招聘',
  healthcare: '医疗卫生',
  finance: '金融银行',
  grassroots: '基层服务',
  community: '社区工作者',
  public_welfare: '公益岗位',
  enterprise: '国企/名企',
  general: '通用/其他',
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await getNoticeDetail(props.id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取公告详情失败')
  } finally {
    loading.value = false
  }
})

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  return dateStr.slice(0, 10)
}
</script>

<template>
  <div v-loading="loading" class="min-h-[300px]">
    <template v-if="detail">
      <div class="flex flex-wrap items-center gap-2 mb-3">
        <el-tag type="primary">
          {{ noticeCategoryMap[detail.noticeCategory] || detail.noticeCategory }}
        </el-tag>
        <el-tag v-if="detail.noticeType" type="success">{{ detail.noticeType }}</el-tag>
        <el-tag v-if="detail.isTop" type="warning" effect="dark">置顶</el-tag>
        <el-tag v-if="detail.isImportant" type="danger" effect="dark">重要</el-tag>
      </div>

      <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ detail.title }}</h2>

      <div class="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
        <div v-if="detail.source">来源：{{ detail.source }}</div>
        <div v-if="detail.publishUnit">发布单位：{{ detail.publishUnit }}</div>
        <div v-if="detail.publishDate">发布日期：{{ formatDate(detail.publishDate) }}</div>
        <div v-if="detail.province || detail.city">地区：{{ [detail.province, detail.city].filter(Boolean).join(' ') }}</div>
        <div v-if="detail.recruitmentCount">招录人数：{{ detail.recruitmentCount }} 人</div>
        <div v-if="detail.regStartDate">报名开始：{{ formatDate(detail.regStartDate) }}</div>
        <div v-if="detail.regEndDate">报名截止：{{ formatDate(detail.regEndDate) }}</div>
        <div v-if="detail.examTime">考试时间：{{ formatDate(detail.examTime) }}</div>
        <div>阅读量：{{ detail.viewCount }}</div>
      </div>

      <div v-if="detail.summary" class="bg-orange-50 rounded-lg p-4 mb-6 text-gray-600 text-sm leading-relaxed border-l-4 border-orange-400">
        {{ detail.summary }}
      </div>

      <div class="prose max-w-none" v-html="detail.content" />

      <div v-if="detail.sourceUrl" class="mt-6 pt-4 border-t border-gray-200">
        <a :href="detail.sourceUrl" target="_blank" rel="noopener noreferrer" class="text-orange-500 hover:text-orange-600 text-sm">
          查看原文 ↗
        </a>
      </div>
    </template>

    <div v-if="!loading && !detail" class="py-20 text-center text-gray-400">
      暂无内容
    </div>
  </div>
</template>
