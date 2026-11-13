<script setup lang="ts">
/**
 * 企业岗位页：本文件只负责取数与编排，展示拆到 position/components/ 下。
 * 接口：
 *   - GET /api/v1/app/enterprise/{id}            企业详情（免登录）
 *   - GET /api/v1/app/enterprise/{id}/positions  岗位列表（@RequireLogin）
 *   - GET /api/v1/app/enterprise/industries      关联行业（@RequireVip，只放行旗舰版 VIP）
 * 收藏（targetType=enterprise）：与列表页同一 targetType，后端三处已就绪，零后端改动。
 */
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { MemberType } from '@haifeng/shared'
import {
  getEnterpriseDetail,
  getPositions,
  getEnterpriseIndustries,
} from '@/api/enterprise'
import type { EnterpriseListVO, EnterprisePositionVO } from '@/types/enterprise'
import { addFavorite, removeFavorite, getFavoriteStatus } from '@/api/favorite'
import { useAutoHideHeader } from '@/composables/useAutoHideHeader'
import { useRechargeDialog } from '@/composables/useRechargeDialog'
import { useUserStore } from '@/store'
import { confirmLogin } from '@/utils/loginGuide'

import PositionHero from './position/components/PositionHero.vue'
import PositionListCard from './position/components/PositionListCard.vue'
import IndustryCard from './position/components/IndustryCard.vue'
import EnterpriseInfoCard from './position/components/EnterpriseInfoCard.vue'
// 在线工具栏：直接复用列表页组件（同一份 ENTERPRISE_TOOLS 配置，零重复）
import EnterpriseToolsCard from './components/EnterpriseToolsCard.vue'

import './position/position.css'

const route = useRoute()
const userStore = useUserStore()
const recharge = useRechargeDialog()
const { hidden: headerHidden } = useAutoHideHeader()

/** 与列表页一致，导航抽屉收起时把 sticky 顶部空隙收掉 */
const asideTop = computed(() => (headerHidden.value ? 8 : 76))

const enterpriseId = computed(() => String(route.params.id ?? ''))

const enterprise = ref<EnterpriseListVO | null>(null)
const positions = ref<EnterprisePositionVO[]>([])
const loading = ref(false)
const error = ref('')

/** 关联行业（@RequireVip，普通会员与 Pro 均被拒） */
const industries = ref<string[]>([])
const industriesLoaded = ref(false)

/** 是否 VIP：改用会员类型判断。
 *  ⚠️ 旧实现用 `e?.response?.status === 403` 判断，但 shared request.ts 的响应拦截器
 *     统一 `reject(new Error(message))`（**没有 .response 属性**），该判断永远不成立，
 *     导致非 VIP 用户永远看到「升级 VIP」而 VIP 用户也判断异常。
 *     且 @RequireVip 失败时后端返回 HTTP 200 + 业务码 1005，不是 HTTP 403。
 */
const isVip = computed(() => userStore.userInfo?.memberType === MemberType.VIP)

/** 是否已收藏该企业 */
const favorited = ref(false)

/** 岗位统计（Hero 三数字块） */
const totalCount = computed(() => positions.value.length)
const campusCount = computed(
  () => positions.value.filter((p) => p.recruitmentType === '校招').length,
)
const internCount = computed(
  () => positions.value.filter((p) => p.recruitmentType === '实习').length,
)

/** 企业详情：失败时静默降级（岗位列表仍可展示） */
async function fetchEnterprise() {
  if (!enterpriseId.value) return
  try {
    const res = await getEnterpriseDetail(enterpriseId.value)
    enterprise.value = res.data.data ?? null
  } catch (e: any) {
    console.warn('获取企业详情失败', e?.message)
  }
}

/** 岗位列表 */
async function fetchPositions() {
  if (!enterpriseId.value) {
    error.value = '企业 ID 不存在'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await getPositions(enterpriseId.value)
    positions.value = res.data.data ?? []
  } catch (e: any) {
    error.value = e?.message || '获取岗位列表失败'
    positions.value = []
  } finally {
    loading.value = false
  }
}

/**
 * 关联行业：仅 VIP 能取到（@RequireVip 只放行旗舰版 VIP）。
 * 非 VIP 直接跳过请求，避免无谓的 401/1005 往返与错误噪音。
 */
async function fetchIndustries() {
  if (!enterpriseId.value) return
  if (!isVip.value) {
    industriesLoaded.value = true
    return
  }
  try {
    const res = await getEnterpriseIndustries([enterpriseId.value])
    const group = res.data.data?.[0]
    industries.value = (group?.industries ?? []).map((i) => i.industryName).filter(Boolean)
  } catch (e: any) {
    // 鉴权失败或关联表为空：静默降级为空态
    console.warn('获取关联行业失败', e?.message)
    industries.value = []
  } finally {
    industriesLoaded.value = true
  }
}

/** 回填收藏状态（单次上限 100 → 一家企业一次即可；失败静默） */
async function refreshFavStatus() {
  if (!userStore.isLoggedIn() || !enterpriseId.value) return
  try {
    const res = await getFavoriteStatus('enterprise', [enterpriseId.value])
    favorited.value = (res.data.data || []).map(String).includes(enterpriseId.value)
  } catch {
    /* 收藏状态回填失败忽略，药丸保持默认态 */
  }
}

/** Hero 收藏药丸：收藏 / 取消收藏这家企业 */
async function onToggleFav(id: string) {
  if (!userStore.isLoggedIn()) {
    userStore.setRedirectPath(route.fullPath)
    if (await confirmLogin('收藏功能需登录后使用，请先登录')) {
      // 路由守卫会处理跳转
    }
    return
  }
  try {
    if (favorited.value) {
      await removeFavorite('enterprise', id)
      favorited.value = false
      ElMessage.success('已取消收藏')
    } else {
      await addFavorite('enterprise', id)
      favorited.value = true
      ElMessage.success('收藏成功')
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '收藏操作失败')
  }
}

/** 非 VIP 用户点「前往开通」 */
function onUpgrade() {
  recharge.open()
}

onMounted(() => {
  void fetchEnterprise()
  void fetchPositions()
  void fetchIndustries()
  void refreshFavStatus()
})
</script>

<template>
  <div class="page-enterprise-position">
    <div class="pos-container">
      <div class="pos-hero-wrap">
        <PositionHero
          :enterprise="enterprise"
          :total-count="totalCount"
          :campus-count="campusCount"
          :intern-count="internCount"
          :favorited="favorited"
          @toggle-fav="onToggleFav"
        />
      </div>

      <div class="pos-grid">
        <div class="pos-left">
          <PositionListCard
            :positions="positions"
            :loading="loading"
            :error="error"
            @retry="fetchPositions"
          />
        </div>

        <aside class="pos-right" :style="{ top: `${asideTop}px` }">
          <IndustryCard
            :industries="industries"
            :is-vip="isVip"
            :loaded="industriesLoaded"
            @upgrade="onUpgrade"
          />
          <EnterpriseInfoCard :enterprise="enterprise" />
          <EnterpriseToolsCard />
        </aside>
      </div>
    </div>
  </div>
</template>
