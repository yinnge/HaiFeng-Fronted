<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getInstitutionDetail, getInstitutionAppointment } from '@/api/home'
import type { InstitutionDetailVO, InstitutionAppointmentVO } from '@/types/home'
import ConsultationDialog from '@/components/ConsultationDialog.vue'

const route = useRoute()
const router = useRouter()
const detail = ref<InstitutionDetailVO | null>(null)
const appointment = ref<InstitutionAppointmentVO | null>(null)
const consultationVisible = ref(false)
const loading = ref(true)

onMounted(async () => {
  try {
    const id = route.params.id as string
    const res = await getInstitutionDetail(id)
    detail.value = res.data.data
    // 联系方式单独接口，失败不影响详情展示
    try {
      const a = await getInstitutionAppointment(id)
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
        <div v-if="detail.carouselImages?.length" class="grid gap-6 md:grid-cols-2">
          <img
            v-for="(img, i) in detail.carouselImages"
            :key="i"
            :src="img"
            :alt="`${detail.name} 图片 ${i + 1}`"
            class="h-64 w-full rounded-xl object-cover shadow-lg"
          />
        </div>

        <div class="mt-8">
          <div class="flex items-center gap-4">
            <div class="flex h-16 w-16 items-center justify-center rounded-lg bg-orange-500 text-2xl font-bold text-white">
              {{ detail.name?.slice(0, 1) }}
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-800">{{ detail.name }}</h1>
              <div class="mt-1 flex flex-wrap items-center gap-2 text-sm">
                <span v-if="detail.category" class="rounded-full bg-orange-100 px-3 py-1 text-orange-600">{{ detail.category }}</span>
                <span v-if="detail.province" class="rounded-full bg-blue-100 px-3 py-1 text-blue-600">{{ detail.province }}</span>
                <span v-if="detail.foundedYear" class="rounded-full bg-gray-100 px-3 py-1 text-gray-600">{{ detail.foundedYear }}</span>
              </div>
            </div>
          </div>

          <div v-if="detail.mainDirection || detail.classSize || detail.teacherConfig || detail.courseForm" class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div v-if="detail.mainDirection" class="rounded-xl bg-white p-4 shadow-sm">
              <div class="text-xs text-gray-400">主打方向</div>
              <div class="mt-1 font-medium text-gray-800">{{ detail.mainDirection }}</div>
            </div>
            <div v-if="detail.classSize" class="rounded-xl bg-white p-4 shadow-sm">
              <div class="text-xs text-gray-400">班级规模</div>
              <div class="mt-1 font-medium text-gray-800">{{ detail.classSize }}</div>
            </div>
            <div v-if="detail.teacherConfig" class="rounded-xl bg-white p-4 shadow-sm">
              <div class="text-xs text-gray-400">师资配置</div>
              <div class="mt-1 font-medium text-gray-800">{{ detail.teacherConfig }}</div>
            </div>
            <div v-if="detail.courseForm" class="rounded-xl bg-white p-4 shadow-sm">
              <div class="text-xs text-gray-400">上课形式</div>
              <div class="mt-1 font-medium text-gray-800">{{ detail.courseForm }}</div>
            </div>
          </div>

          <div v-if="appointment && (appointment.phone || appointment.address || appointment.email)" class="mt-6 grid gap-4 sm:grid-cols-2">
            <div v-if="appointment.phone" class="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
              <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="text-gray-600">{{ appointment.phone }}</span>
            </div>
            <div v-if="appointment.address" class="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
              <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-gray-600">{{ appointment.address }}</span>
            </div>
          </div>

          <button
            class="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            @click="consultationVisible = true"
          >
            留言咨询
          </button>

          <div class="mt-8 rounded-2xl bg-white p-6 shadow-lg">
            <h2 class="mb-3 text-lg font-bold text-gray-800">机构简介</h2>
            <p class="text-gray-600 leading-relaxed">{{ detail.introduction }}</p>
            <img v-if="appointment?.wechatQrcodeUrl" :src="appointment.wechatQrcodeUrl" alt="微信二维码" class="mt-4 h-32 w-32 rounded-lg border border-gray-200" />
          </div>

          <div v-if="detail.classTypes?.length" class="mt-6 rounded-2xl bg-white p-6 shadow-lg">
            <h2 class="mb-3 text-lg font-bold text-gray-800">主打班型</h2>
            <ul class="space-y-3">
              <li v-for="(c, i) in detail.classTypes" :key="i" class="rounded-lg bg-gray-50 px-4 py-3">
                <div class="flex items-center justify-between gap-3">
                  <span class="font-medium text-gray-800">{{ c.title }}</span>
                  <span v-if="c.tag" class="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{{ c.tag }}</span>
                </div>
                <p v-if="c.introduction" class="mt-1 text-sm text-gray-500">{{ c.introduction }}</p>
              </li>
            </ul>
          </div>

          <div v-if="detail.advantages?.length" class="mt-6 rounded-2xl bg-white p-6 shadow-lg">
            <h2 class="mb-3 text-lg font-bold text-gray-800">机构优势</h2>
            <ul class="list-disc space-y-2 pl-5 text-gray-600">
              <li v-for="(a, i) in detail.advantages" :key="i">{{ a }}</li>
            </ul>
          </div>

          <p v-if="detail.notice" class="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">{{ detail.notice }}</p>
        </div>
      </div>
    </div>

    <ConsultationDialog
      v-if="detail"
      v-model:visible="consultationVisible"
      biz-type="institution"
      :biz-id="detail.id"
      :biz-name="detail.name"
    />
  </div>
</template>
