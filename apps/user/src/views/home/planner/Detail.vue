<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPlannerDetail, getPlannerAppointment } from '@/api/home'
import type { PlannerDetailVO, PlannerAppointmentVO } from '@/types/home'
import ConsultationDialog from '@/components/ConsultationDialog.vue'

const route = useRoute()
const router = useRouter()
const detail = ref<PlannerDetailVO | null>(null)
const appointment = ref<PlannerAppointmentVO | null>(null)
const consultationVisible = ref(false)
const loading = ref(true)

/** 头像加载失败（OSS 对象被删 / URL 失效）时回退到姓名首字 */
const avatarBroken = ref(false)
const onAvatarError = () => { avatarBroken.value = true }

onMounted(async () => {
  try {
    const id = route.params.id as string
    const res = await getPlannerDetail(id)
    detail.value = res.data.data
    // 联系方式单独接口，失败不影响详情展示
    try {
      const a = await getPlannerAppointment(id)
      appointment.value = a.data.data
    } catch { /* 联系方式非必需 */ }
  } catch {
    router.replace('/')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <div class="container mx-auto px-6 py-12">
      <button
        class="mb-6 flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors"
        @click="router.push('/')"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        返回首页
      </button>

      <div v-if="loading" class="flex justify-center py-20">
        <div class="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
      </div>

      <div v-else-if="detail" class="mx-auto max-w-4xl">
        <div class="flex flex-col gap-8 md:flex-row">
          <div class="flex-shrink-0 text-center md:text-left">
            <img
              v-if="detail.avatarUrl && !avatarBroken"
              :src="detail.avatarUrl"
              :alt="detail.name"
              @error="onAvatarError"
              class="mx-auto h-40 w-40 rounded-full border-4 border-orange-100 object-cover md:mx-0"
            />
            <div
              v-else
              class="mx-auto flex h-40 w-40 items-center justify-center rounded-full border-4 border-orange-100 bg-orange-50 text-5xl font-bold text-orange-500 md:mx-0"
            >{{ detail.name?.slice(0, 1) }}</div>
          </div>
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-gray-800">{{ detail.name }}</h1>
            <div class="mt-2 flex flex-wrap items-center gap-3">
              <span v-if="detail.position" class="rounded-full bg-orange-100 px-3 py-1 text-sm text-orange-600">{{ detail.position }}</span>
              <span v-if="detail.province" class="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-600">{{ detail.province }}</span>
              <span v-if="detail.serviceTarget" class="rounded-full bg-green-100 px-3 py-1 text-sm text-green-600">{{ detail.serviceTarget }}</span>
              <span v-if="detail.certDesc" class="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-600">{{ detail.certDesc }}</span>
            </div>

            <div v-if="detail.workYears || detail.servedCount || detail.draftSla" class="mt-5 grid grid-cols-3 gap-3">
              <div v-if="detail.workYears" class="rounded-xl bg-white p-3 text-center shadow-sm">
                <div class="text-lg font-bold text-orange-600">{{ detail.workYears }}</div>
                <div class="text-xs text-gray-400">从业年限</div>
              </div>
              <div v-if="detail.servedCount" class="rounded-xl bg-white p-3 text-center shadow-sm">
                <div class="text-lg font-bold text-orange-600">{{ detail.servedCount }}</div>
                <div class="text-xs text-gray-400">服务考生</div>
              </div>
              <div v-if="detail.draftSla" class="rounded-xl bg-white p-3 text-center shadow-sm">
                <div class="text-lg font-bold text-orange-600">{{ detail.draftSla }}</div>
                <div class="text-xs text-gray-400">初稿时效</div>
              </div>
            </div>

            <p class="mt-4 text-gray-600 leading-relaxed">{{ detail.description || detail.listDesc }}</p>

            <div v-if="detail.detailTags?.length" class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="(tag, i) in detail.detailTags"
                :key="i"
                class="rounded-full bg-orange-50 px-4 py-1.5 text-sm text-orange-600"
              >{{ tag }}</span>
            </div>

            <div v-if="appointment" class="mt-6 rounded-2xl bg-white p-6 shadow-lg">
              <h2 class="mb-3 text-lg font-bold text-gray-800">预约咨询</h2>
              <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                <span v-if="appointment.phone">电话：{{ appointment.phone }}</span>
                <span v-if="appointment.email">邮箱：{{ appointment.email }}</span>
                <span v-if="appointment.address">地址：{{ appointment.address }}</span>
              </div>
              <img v-if="appointment.wechatQrcodeUrl" :src="appointment.wechatQrcodeUrl" alt="微信二维码" class="mt-4 h-32 w-32 rounded-lg border border-gray-200" />
              <button
                class="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
                @click="consultationVisible = true"
              >
                留言咨询
              </button>
            </div>
          </div>
        </div>

        <div v-if="detail.services?.length" class="mt-8 rounded-2xl bg-white p-6 shadow-lg">
          <h2 class="mb-3 text-lg font-bold text-gray-800">服务内容</h2>
          <ul class="space-y-3">
            <li v-for="(s, i) in detail.services" :key="i" class="text-gray-600">
              <strong class="text-gray-800">{{ s.title }}</strong> —— {{ s.content }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <ConsultationDialog
      v-if="detail"
      v-model:visible="consultationVisible"
      biz-type="planner"
      :biz-id="detail.id"
      :biz-name="detail.name"
    />
  </div>
</template>
