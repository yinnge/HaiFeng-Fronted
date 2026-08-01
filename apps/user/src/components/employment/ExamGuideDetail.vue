<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getExamGuideDetail } from '@/api/employment/content/examGuide'
import type { ExamGuideDetailVO } from '@/types/employment/content/examGuide'

const props = defineProps<{
  id: string
}>()

const loading = ref(false)
const detail = ref<ExamGuideDetailVO | null>(null)

const guideCategoryMap: Record<string, string> = {
  civil: '公务员',
  institution: '事业单位',
  military: '军队文职',
  selection: '选调生',
  teacher: '教师招聘',
  healthcare: '医疗卫生',
  finance: '金融银行',
  grassroots: '基层服务',
  community: '社区工作者',
  general: '通用/其他',
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await getExamGuideDetail(props.id)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || '获取详情失败')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-loading="loading" class="min-h-[300px]">
    <template v-if="detail">
      <div v-if="detail.coverImage" class="mb-6 rounded-xl overflow-hidden">
        <img :src="detail.coverImage" alt="cover" class="w-full h-48 object-cover" />
      </div>

      <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ detail.title }}</h2>
      <div v-if="detail.subtitle" class="text-gray-500 mb-4">{{ detail.subtitle }}</div>

      <div class="flex flex-wrap items-center gap-2 mb-4 text-sm text-gray-500">
        <span v-if="detail.authorName" class="font-medium text-gray-700">{{ detail.authorName }}</span>
        <span v-if="detail.authorTitle">· {{ detail.authorTitle }}</span>
        <el-tag v-if="detail.difficultyLevel" size="small" type="warning">{{ detail.difficultyLevel }}</el-tag>
        <span>· 阅读 {{ detail.viewCount }}</span>
        <span v-if="detail.likeCount">· 点赞 {{ detail.likeCount }}</span>
      </div>

      <div v-if="detail.tags && detail.tags.length" class="flex flex-wrap gap-1.5 mb-4">
        <el-tag v-for="tag in detail.tags" :key="tag" size="small">{{ tag }}</el-tag>
      </div>

      <div v-if="detail.summary" class="bg-gray-50 rounded-lg p-4 mb-6 text-gray-600 text-sm leading-relaxed">
        {{ detail.summary }}
      </div>

      <div class="prose max-w-none" v-html="detail.content" />
    </template>

    <div v-if="!loading && !detail" class="py-20 text-center text-gray-400">
      暂无内容
    </div>
  </div>
</template>
