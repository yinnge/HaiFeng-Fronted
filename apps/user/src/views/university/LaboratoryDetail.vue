<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getLaboratoryDetail } from '@/api/university/laboratory'
import type { LaboratoryDetailVO } from '@/types/university/laboratory'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const detail = ref<LaboratoryDetailVO | null>(null)

async function fetchDetail() {
  const labId = route.params.labId as string
  if (!labId) {
    ElMessage.error('实验室ID不存在')
    return
  }
  loading.value = true
  try {
    const res = await getLaboratoryDetail(labId)
    detail.value = res.data.data
  } catch (e: any) {
    ElMessage.error(e?.message || '获取实验室详情失败')
  } finally {
    loading.value = false
  }
}

/** 返回院校详情：优先用来源 universityId，其次回退浏览器历史，最后回院校列表 */
function goBackUniversity() {
  const from = (route.query.from as string) || ''
  if (from) {
    router.push(`/university/${from}`)
  } else if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/university')
  }
}

onMounted(fetchDetail)
</script>

<template>
  <div class="min-h-screen">
    <main class="container mx-auto px-6 py-8" v-loading="loading">
      <!-- 顶部操作栏 -->
      <div class="flex justify-between items-center gap-4 mb-6">
        <div class="min-w-0">
          <h1 class="text-2xl font-bold text-gray-800 truncate">{{ detail?.labType || '实验室详情' }}</h1>
          <p class="text-sm text-gray-500 mt-1 truncate">{{ detail?.universityName || '重点实验室' }}</p>
        </div>
        <button
          class="btn-secondary shrink-0 px-4 py-2 text-sm flex items-center gap-1.5"
          @click="goBackUniversity"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回院校
        </button>
      </div>

      <template v-if="detail">
        <section class="univ-card mb-6 p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">{{ detail.labType }}</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
            <div><span class="text-gray-400">所属院校：</span><span class="text-gray-700">{{ detail.universityName }}</span></div>
            <div><span class="text-gray-400">成立时间：</span><span class="text-gray-700">{{ detail.establishedYear || '-' }}</span></div>
            <div><span class="text-gray-400">所在地区：</span><span class="text-gray-700">{{ detail.region || '-' }}</span></div>
            <div><span class="text-gray-400">主管部门：</span><span class="text-gray-700">{{ detail.department || '-' }}</span></div>
            <div><span class="text-gray-400">实验室主任：</span><span class="text-gray-700">{{ detail.director || '-' }}</span></div>
            <div><span class="text-gray-400">人员规模：</span><span class="text-gray-700">{{ detail.staffCount || '-' }}</span></div>
            <div><span class="text-gray-400">学生规模：</span><span class="text-gray-700">{{ detail.studentCount || '-' }}</span></div>
            <div><span class="text-gray-400">联系邮箱：</span><span class="text-gray-700">{{ detail.email || '-' }}</span></div>
            <div><span class="text-gray-400">联系电话：</span><span class="text-gray-700">{{ detail.phone || '-' }}</span></div>
          </div>
        </section>

        <section class="univ-card mb-6 p-6 space-y-4">
          <div v-if="detail.introduction">
            <h3 class="text-lg font-bold text-gray-800 mb-2">实验室简介</h3>
            <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.introduction }}</p>
          </div>
          <div v-if="detail.researchDescription">
            <h3 class="text-lg font-bold text-gray-800 mb-2">研究方向描述</h3>
            <p class="text-gray-600 leading-relaxed whitespace-pre-line">{{ detail.researchDescription }}</p>
          </div>
          <div v-if="detail.labSpace">
            <h3 class="text-lg font-bold text-gray-800 mb-2">实验室空间</h3>
            <p class="text-gray-600">{{ detail.labSpace }}</p>
          </div>
          <div v-if="detail.researchFields?.length">
            <h3 class="text-lg font-bold text-gray-800 mb-2">研究领域</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="field in detail.researchFields" :key="field" class="pill-new text-sm">{{ field }}</span>
            </div>
          </div>
          <div v-if="detail.majorEquipment?.length">
            <h3 class="text-lg font-bold text-gray-800 mb-2">主要设备</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="eq in detail.majorEquipment" :key="eq" class="pill-new text-sm">{{ eq }}</span>
            </div>
          </div>
          <div v-if="detail.openTopics">
            <h3 class="text-lg font-bold text-gray-800 mb-2">开放课题</h3>
            <p class="text-gray-600">{{ detail.openTopics }}</p>
          </div>
          <div v-if="detail.cooperation">
            <h3 class="text-lg font-bold text-gray-800 mb-2">合作交流</h3>
            <p class="text-gray-600">{{ detail.cooperation }}</p>
          </div>
          <div v-if="detail.visitingScholars">
            <h3 class="text-lg font-bold text-gray-800 mb-2">访问学者</h3>
            <p class="text-gray-600">{{ detail.visitingScholars }}</p>
          </div>
        </section>

        <section v-if="detail.coreTeam?.length" class="univ-card mb-6 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">核心团队</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 text-gray-400">
                  <th class="text-left py-2 px-3">姓名</th>
                  <th class="text-left py-2 px-3">职务</th>
                  <th class="text-left py-2 px-3">岗位角色</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(member, idx) in detail.coreTeam" :key="idx" class="border-b border-gray-50">
                  <td class="py-2.5 px-3 text-gray-800 font-medium">{{ member.memberName }}</td>
                  <td class="py-2.5 px-3 text-gray-600">{{ member.position || '-' }}</td>
                  <td class="py-2.5 px-3 text-gray-600">{{ member.role || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="detail.statistics?.length" class="univ-card mb-6 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">统计数据</h3>
          <div class="flex flex-wrap gap-4">
            <div v-for="(stat, idx) in detail.statistics" :key="idx" class="stat-card rounded-xl px-5 py-3 text-center flex-1 min-w-[120px]">
              <div class="text-2xl font-bold text-orange-600">{{ stat.count }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ stat.label }}</div>
            </div>
          </div>
        </section>

        <!-- 底部操作 -->
        <div class="flex justify-center pb-8">
          <button
            class="btn-brand px-6 py-2.5 text-sm flex items-center gap-1.5"
            @click="goBackUniversity"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回院校
          </button>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
/* ===== 新规范卡片：纯白底 + 橙描边 + 渐变顶边 ===== */
.univ-card {
  /* !important 覆盖 .app-shell main > * 的透底规则（卡片是 main 直接子） */
  background: #ffffff !important;
  background-image: none !important;
  border-radius: 1rem;
  border: 1px solid rgba(249, 115, 22, 0.15);
  border-top: 3px solid transparent;
  border-image: linear-gradient(90deg, #f97316, #fb923c) 1;
  border-top-width: 3px;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.06);
  transition: all 0.25s ease;
}

/* ===== 橙系药丸标签 ===== */
.pill-new {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.8rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #e8722a;
  background: linear-gradient(90deg, rgba(249, 115, 22, 0.12), rgba(251, 146, 60, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.25);
}

/* ===== 按钮 token 覆盖（本页生效，不动全局） ===== */
.btn-brand {
  background: linear-gradient(90deg, #f97316, #fb923c) !important;
  border-color: transparent !important;
}

/* ===== 统计数字卡：浅橙渐变底 ===== */
.stat-card {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 146, 60, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.2);
}
</style>
