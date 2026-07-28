<script setup lang="ts">
import { ref, watch } from 'vue'
import { getExamGuideDetail } from '@/api/employment/guide'
import type { ExamGuideDetailVO } from '@/types/employment/guide'
import { GuideCategoryLabel } from '@/types/employment/guide'

const props = defineProps<{ visible: boolean; currentId: string | null }>()
const emit = defineEmits<{ 'update:visible': [val: boolean] }>()

const loading = ref(false)
const detail = ref<ExamGuideDetailVO | null>(null)
const categoryLabel = (cat: string) => GuideCategoryLabel[cat] || cat

watch(() => props.visible, async (val) => {
  if (val && props.currentId) {
    loading.value = true
    try { const res = await getExamGuideDetail(props.currentId); if (res.data.code === 200) detail.value = res.data.data } catch { /* ignore */ }
    loading.value = false
  } else { detail.value = null }
})
</script>

<template>
  <el-dialog :model-value="visible" title="备考指南详情" width="800px" :close-on-click-modal="false" @update:model-value="emit('update:visible', $event)">
    <div v-loading="loading">
      <el-descriptions v-if="detail" :column="2" border>
        <el-descriptions-item label="标题" :span="2">{{ detail.title }}</el-descriptions-item>
        <el-descriptions-item label="副标题" :span="2">{{ detail.subtitle || '-' }}</el-descriptions-item>
        <el-descriptions-item label="指南类别">{{ categoryLabel(detail.guideCategory) }}</el-descriptions-item>
        <el-descriptions-item label="指南类型">{{ detail.guideType }}</el-descriptions-item>
        <el-descriptions-item label="难度">{{ detail.difficultyLevel || '-' }}</el-descriptions-item>
        <el-descriptions-item label="目标读者">{{ detail.targetAudience || '-' }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ detail.authorName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="作者头衔">{{ detail.authorTitle || '-' }}</el-descriptions-item>
        <el-descriptions-item label="置顶">
          <span v-if="detail.isTop" class="pill pill-orange">置顶</span><span v-else>无</span>
        </el-descriptions-item>
        <el-descriptions-item label="推荐">
          <span v-if="detail.isRecommended" class="pill pill-red">推荐</span><span v-else>无</span>
        </el-descriptions-item>
        <el-descriptions-item label="阅读量">{{ detail.viewCount }}</el-descriptions-item>
        <el-descriptions-item label="点赞量">{{ detail.likeCount }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ detail.sortOrder }}</el-descriptions-item>
        <el-descriptions-item label="标签">
          <span v-for="tag in detail.tags" :key="tag" class="pill pill-gray" style="margin-right: 4px">{{ tag }}</span>
          <span v-if="!detail.tags || detail.tags.length === 0">-</span>
        </el-descriptions-item>
        <el-descriptions-item label="封面" :span="2">
          <el-image v-if="detail.coverImage" :src="detail.coverImage" style="max-height: 120px" fit="contain" />
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="摘要" :span="2">{{ detail.summary || '-' }}</el-descriptions-item>
        <el-descriptions-item label="内容" :span="2">
          <div class="max-h-80 overflow-y-auto border rounded p-2" v-html="detail.content" />
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createdAt }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detail.updatedAt }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <button type="button" class="btn-close" @click="emit('update:visible', false)">关闭</button>
    </template>
  </el-dialog>
</template>

<style scoped>
.pill { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.pill-orange { background: #ffedd5; color: #ea580c; }
.pill-red { background: #fee2e2; color: #dc2626; }
.pill-gray { background: #f3f4f6; color: #6b7280; }
.btn-close { background: linear-gradient(135deg, #F97316, #FB923C); color: #fff; border: none; border-radius: 20px; padding: 8px 24px; font-size: 14px; cursor: pointer; }
.btn-close:hover { filter: brightness(1.1); }
</style>
