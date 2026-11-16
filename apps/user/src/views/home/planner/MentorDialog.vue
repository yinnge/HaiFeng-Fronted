<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getPlanners, getPlannerDetail, getPlannerAppointment,
  getInstitutions, getInstitutionDetail, getInstitutionAppointment,
} from '@/api/home'
import type {
  MentorCardConfig, PlannerListVO, InstitutionListVO,
  PlannerDetailVO, InstitutionDetailVO,
} from '@/types/home'
import ConsultationDialog from '@/components/ConsultationDialog.vue'

const props = defineProps<{
  modelValue: boolean
  card: MentorCardConfig | null
}>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const isPerson = computed(() => props.card?.kind === 'person')
const unit = computed(() => (isPerson.value ? '位' : '家'))

// ===== 统一列表项 ViewModel =====
interface EntryVM {
  id: string
  name: string
  province: string
  badge: string
  subtitle: string
  tags: string[]
  avatarUrl: string
  logoText: string
}
const list = ref<EntryVM[]>([])
const listLoading = ref(false)
const provinceFilter = ref('全部')

const provinceChips = computed(() => {
  const counts: Record<string, number> = {}
  list.value.forEach((it) => { if (it.province) counts[it.province] = (counts[it.province] || 0) + 1 })
  return [{ name: '全部', count: list.value.length },
    ...Object.keys(counts).map((name) => ({ name, count: counts[name] }))]
})
const filteredList = computed(() =>
  provinceFilter.value === '全部' ? list.value : list.value.filter((it) => it.province === provinceFilter.value))

const toEntryVM = (p: PlannerListVO | InstitutionListVO): EntryVM => {
  if (isPerson.value) {
    const v = p as PlannerListVO
    return {
      id: v.id, name: v.name, province: v.province || '',
      badge: v.position || '', subtitle: v.listDesc || '',
      tags: v.listTags || [], avatarUrl: v.avatarUrl || '', logoText: v.name?.slice(0, 1) || '',
    }
  }
  const v = p as InstitutionListVO
  return {
    id: v.id, name: v.name, province: v.province || '',
    badge: '', subtitle: v.category || '',
    tags: v.tags || [], avatarUrl: '', logoText: v.name?.slice(0, 1) || '',
  }
}

const loadList = async () => {
  const card = props.card
  if (!card) return
  listLoading.value = true
  provinceFilter.value = '全部'
  view.value = 'list'
  try {
    if (card.kind === 'person') {
      const res = await getPlanners({ page: 1, size: 100, serviceTarget: card.serviceTarget! })
      list.value = res.data.data.records.map(toEntryVM)
    } else {
      const res = await getInstitutions({ page: 1, size: 100, category: card.category! })
      list.value = res.data.data.records.map(toEntryVM)
    }
  } catch (e: any) {
    list.value = []
    ElMessage.error(e?.message || '获取名单失败')
  } finally {
    listLoading.value = false
  }
}

// ===== 详情 ViewModel =====
type Stat = [string, string]
interface CourseVM { name: string; meta: string; tag: string }
interface DetailVM {
  id: string
  name: string
  province: string
  badge: string
  subtitle: string
  credential: string
  avatarUrl: string
  logoText: string
  stats: Stat[]
  intro: string
  tags: string[]
  services: { title: string; content: string }[]
  images: string[]
  grid: Stat[]
  courses: CourseVM[]
  advantages: string[]
  notice: string
}
const detail = ref<DetailVM | null>(null)
const detailLoading = ref(false)
const currentIndex = ref(0)

const fillDetail = (d: PlannerDetailVO | InstitutionDetailVO): DetailVM => {
  const base: DetailVM = {
    id: d.id, name: d.name, province: d.province || '',
    badge: '', subtitle: '', credential: '', avatarUrl: '', logoText: (d.name || '').slice(0, 1),
    stats: [], intro: '', tags: [], services: [], images: [], grid: [], courses: [], advantages: [], notice: '',
  }
  if (isPerson.value) {
    const p = d as PlannerDetailVO
    const stats: Stat[] = []
    if (p.workYears) stats.push([p.workYears, '从业年限'])
    if (p.servedCount) stats.push([p.servedCount, '服务考生'])
    if (p.draftSla) stats.push([p.draftSla, '初稿时效'])
    return {
      ...base,
      badge: p.position || '',
      subtitle: p.position || '',
      credential: p.certDesc || '',
      avatarUrl: p.avatarUrl || '',
      stats,
      intro: p.description || '',
      tags: p.detailTags || [],
      services: (p.services || []).map((s) => ({ title: s.title, content: s.content })),
    }
  }
  const o = d as InstitutionDetailVO
  const grid: Stat[] = []
  if (o.mainDirection) grid.push(['主打方向', o.mainDirection])
  if (o.classSize) grid.push(['班型规模', o.classSize])
  if (o.teacherConfig) grid.push(['师资配置', o.teacherConfig])
  if (o.courseForm) grid.push(['上课形式', o.courseForm])
  return {
    ...base,
    images: o.carouselImages || [],
    intro: o.introduction || '',
    tags: o.tags || [],
    grid,
    courses: (o.classTypes || []).map((t) => ({ name: t.title, meta: t.introduction || '', tag: t.tag || '' })),
    advantages: o.advantages || [],
    notice: o.notice || '',
  }
}

const loadDetail = async (index: number) => {
  const entry = filteredList.value[index]
  if (!entry) return
  currentIndex.value = index
  detailLoading.value = true
  view.value = 'detail'
  try {
    const res = isPerson.value ? await getPlannerDetail(entry.id) : await getInstitutionDetail(entry.id)
    detail.value = fillDetail(res.data.data)
  } catch (e: any) {
    detail.value = null
    ElMessage.error(e?.message || '获取详情失败')
  } finally {
    detailLoading.value = false
  }
}

const stepDetail = (step: number) => {
  const next = currentIndex.value + step
  if (next < 0 || next >= filteredList.value.length) return
  loadDetail(next)
}
const backToList = () => { view.value = 'list'; detail.value = null }

// ===== 预约弹窗 =====
interface AppointmentVM {
  name: string
  avatarUrl: string
  logoText: string
  phone: string
  email: string
  address: string
  qrcodeUrl: string
}
const appointmentOpen = ref(false)
const appointmentLoading = ref(false)
const appointment = ref<AppointmentVM | null>(null)
const consultationVisible = ref(false)
const currentEntry = computed(() => filteredList.value[currentIndex.value] || null)

const openAppointment = async () => {
  const entry = filteredList.value[currentIndex.value]
  if (!entry) return
  appointmentOpen.value = true
  appointmentLoading.value = true
  try {
    if (isPerson.value) {
      const r = await getPlannerAppointment(entry.id)
      const d = r.data.data
      appointment.value = {
        name: d.name, avatarUrl: d.avatarUrl || '', logoText: d.name?.slice(0, 1) || '',
        phone: d.phone || '', email: d.email || '', address: d.address || '', qrcodeUrl: d.wechatQrcodeUrl || '',
      }
    } else {
      const r = await getInstitutionAppointment(entry.id)
      const d = r.data.data
      appointment.value = {
        name: d.name, avatarUrl: '', logoText: d.name?.slice(0, 1) || '',
        phone: d.phone || '', email: d.email || '', address: d.address || '', qrcodeUrl: d.wechatQrcodeUrl || '',
      }
    }
  } catch (e: any) {
    appointment.value = null
    ElMessage.error(e?.message || '获取预约信息失败')
  } finally {
    appointmentLoading.value = false
  }
}

const copyText = async (text: string, label: string) => {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(`已复制${label}`)
  } catch {
    ElMessage.info(`请手动复制：${text}`)
  }
}

/** 机构详情「电话咨询」：直接取预约信息并唤起拨号 */
const callPhone = async () => {
  const entry = filteredList.value[currentIndex.value]
  if (!entry) return
  try {
    const res = await getInstitutionAppointment(entry.id)
    const phone = res.data.data.phone
    if (phone) {
      window.location.href = `tel:${phone}`
    } else {
      ElMessage.info('该机构暂无公开电话，可点「预约试听」查看其他联系方式')
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '获取联系电话失败')
  }
}

// ===== 相册切图 =====
const shotIndex = ref(0)
watch(() => detail.value?.id, () => { shotIndex.value = 0 })
const currentShot = computed(() => detail.value?.images?.[shotIndex.value] || '')
const stepShot = (step: number) => {
  const imgs = detail.value?.images || []
  if (!imgs.length) return
  shotIndex.value = (shotIndex.value + step + imgs.length) % imgs.length
}

// ===== 弹窗生命周期 =====
const view = ref<'list' | 'detail'>('list')
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      appointmentOpen.value = false
      loadList()
    } else {
      detail.value = null
      list.value = []
    }
  },
)

const closeMain = () => emit('update:modelValue', false)
const closeAppointment = () => { appointmentOpen.value = false }

// SVG 图标
const ICO = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg>',
  next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>',
  place: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"></path></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><path d="m21 15-5-5L5 21"></path></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"></path></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m2 7 10 6 10-6"></path></svg>',
}
</script>

<template>
  <!-- ============ 主弹窗：名单 / 详情 ============ -->
  <el-dialog
    :model-value="modelValue"
    :show-close="false"
    width="min(56rem, 94vw)"
    append-to-body
    class="mentor-panel-dialog"
    :class="`accent-${card?.accent || 'blue'}`"
    @update:model-value="closeMain"
  >
    <div class="mentor-dialog-root" :class="`accent-${card?.accent || 'blue'}`">
    <button class="md-close" type="button" aria-label="关闭" @click="closeMain">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
    </button>

    <div v-if="listLoading" class="md-loading">
      <div class="md-spinner"></div>
    </div>

    <!-- 名单视图 -->
    <template v-else-if="view === 'list'">
      <div class="md-head">
        <span class="md-eyebrow">{{ card?.eyebrow }} · 共 {{ filteredList.length }} {{ unit }}</span>
        <h3 class="md-title">{{ card?.title }}</h3>
        <p class="md-sub">{{ card?.sub }}</p>
      </div>
      <div class="md-body">
        <div class="filter-bar">
          <span class="filter-bar__label" v-html="ICO.place"></span>
          <span class="filter-bar__label">省份</span>
          <div class="filter-chips" role="group" aria-label="按省份筛选">
            <button
              v-for="chip in provinceChips"
              :key="chip.name"
              type="button"
              class="filter-chip"
              :class="{ 'is-active': provinceFilter === chip.name }"
              @click="provinceFilter = chip.name"
            >{{ chip.name }}<em>{{ chip.count }}</em></button>
          </div>
          <span class="filter-bar__count">当前 {{ filteredList.length }} {{ unit }}</span>
        </div>

        <div v-if="!filteredList.length" class="empty-hint">该省份暂无可展示的{{ isPerson ? '规划师' : '机构' }}，可切换其他省份查看。</div>

        <div v-else class="entry-grid" :class="isPerson ? 'entry-grid--person' : 'entry-grid--org'">
          <button
            v-for="entry in filteredList"
            :key="entry.id"
            type="button"
            class="entry-card"
            :class="{ 'entry-card--org': !isPerson }"
            @click="loadDetail(filteredList.indexOf(entry))"
          >
            <template v-if="isPerson">
              <span class="entry-avatar">
                <img v-if="entry.avatarUrl" :src="entry.avatarUrl" :alt="entry.name" />
                <span v-else class="avatar-fallback">{{ entry.logoText }}</span>
              </span>
              <span class="entry-main">
                <span class="entry-name">{{ entry.name }}<em v-if="entry.badge">{{ entry.badge }}</em></span>
                <span class="entry-role">{{ entry.subtitle }}</span>
                <span class="entry-tags">
                  <i class="entry-prov">{{ entry.province }}</i>
                  <i v-for="t in entry.tags.slice(0, 2)" :key="t">{{ t }}</i>
                </span>
              </span>
              <span class="entry-arrow" v-html="ICO.arrow"></span>
            </template>
            <template v-else>
              <span class="entry-cover">
                <span class="cover-placeholder">{{ entry.logoText }}</span>
                <span class="entry-cover__logo">{{ entry.logoText }}</span>
              </span>
              <span class="entry-body">
                <span class="entry-title">{{ entry.name }}</span>
                <span class="entry-meta">{{ entry.province }} · {{ entry.subtitle }}</span>
              </span>
            </template>
          </button>
        </div>

        <p class="md-foot">{{ card?.foot }}</p>
      </div>
    </template>

    <!-- 详情视图 -->
    <template v-else-if="detail">
      <div class="md-head">
        <button class="panel-back" type="button" @click="backToList"><span v-html="ICO.back"></span>返回名单</button>
        <span class="md-eyebrow">{{ card?.title }} · {{ detail.province }} · {{ currentIndex + 1 }} / {{ filteredList.length }}</span>
        <h3 class="md-title">{{ detail.name }}<em v-if="detail.badge" class="panel-badge">{{ detail.badge }}</em></h3>
        <p class="md-sub">{{ detail.subtitle }}</p>
      </div>
      <div class="md-body">
        <!-- 人物详情 -->
        <div v-if="isPerson" class="person-detail">
          <div class="person-side">
            <div class="person-avatar">
              <img v-if="detail.avatarUrl" :src="detail.avatarUrl" :alt="detail.name" />
              <span v-else class="avatar-fallback big">{{ detail.logoText }}</span>
            </div>
            <span v-if="detail.credential" class="person-credential"><span v-html="ICO.check"></span>{{ detail.credential }}</span>
            <div class="person-pager">
              <button type="button" :disabled="currentIndex === 0" aria-label="上一位" @click="stepDetail(-1)"><span v-html="ICO.prev"></span></button>
              <span>{{ currentIndex + 1 }} / {{ filteredList.length }}</span>
              <button type="button" :disabled="currentIndex === filteredList.length - 1" aria-label="下一位" @click="stepDetail(1)"><span v-html="ICO.next"></span></button>
            </div>
          </div>
          <div class="person-main">
            <div v-if="detail.stats.length" class="person-stats">
              <div v-for="s in detail.stats" :key="s[1]" class="person-stat"><b>{{ s[0] }}</b><span>{{ s[1] }}</span></div>
            </div>
            <p class="md-intro">{{ detail.intro }}</p>
            <div v-if="detail.tags.length" class="person-tags">
              <span v-for="t in detail.tags" :key="t" class="person-tag">{{ t }}</span>
            </div>
            <div v-if="detail.services.length" class="person-services">
              <h4>服务内容</h4>
              <ul>
                <li v-for="s in detail.services" :key="s.title"><strong>{{ s.title }}</strong>{{ s.content }}</li>
              </ul>
            </div>
            <div class="md-actions">
              <button class="btn-solid" type="button" @click="openAppointment">预约{{ detail.name.slice(0, 1) }}老师</button>
              <button class="btn-outline" type="button" @click="backToList">看其他规划师</button>
            </div>
          </div>
        </div>

        <!-- 机构详情 -->
        <div v-else class="org-detail">
          <div v-if="detail.images.length" class="org-gallery">
            <div class="gallery-stage">
              <img v-if="currentShot" :src="currentShot" :alt="detail.name" />
              <span class="gallery-cap">{{ detail.images.length > 0 ? `图 ${shotIndex + 1} / ${detail.images.length}` : '' }}</span>
              <button class="gallery-nav gallery-nav--prev" type="button" aria-label="上一张" @click="stepShot(-1)"><span v-html="ICO.prev"></span></button>
              <button class="gallery-nav gallery-nav--next" type="button" aria-label="下一张" @click="stepShot(1)"><span v-html="ICO.next"></span></button>
            </div>
            <div class="gallery-thumbs">
              <button
                v-for="(img, i) in detail.images"
                :key="i"
                class="gallery-thumb"
                :class="{ 'is-active': i === shotIndex }"
                type="button"
                @click="shotIndex = i"
              ><img :src="img" alt="" /></button>
            </div>
          </div>
          <p class="md-intro">{{ detail.intro }}</p>
          <dl v-if="detail.grid.length" class="org-grid">
            <div v-for="g in detail.grid" :key="g[0]" class="org-cell"><dt>{{ g[0] }}</dt><dd>{{ g[1] }}</dd></div>
          </dl>
          <div v-if="detail.tags.length" class="person-tags">
            <span v-for="t in detail.tags" :key="t" class="person-tag">{{ t }}</span>
          </div>
          <div v-if="detail.courses.length" class="org-block">
            <h4>主打班型</h4>
            <div v-for="c in detail.courses" :key="c.name" class="course">
              <div class="course__main"><div class="course__name">{{ c.name }}</div><div class="course__meta">{{ c.meta }}</div></div>
              <span v-if="c.tag" class="course__tag">{{ c.tag }}</span>
            </div>
          </div>
          <div v-if="detail.advantages.length" class="org-block">
            <h4>机构优势</h4>
            <ul class="org-hl"><li v-for="a in detail.advantages" :key="a"><span class="dot"></span>{{ a }}</li></ul>
          </div>
          <div class="org-foot">
            <p v-if="detail.notice" class="org-tip">{{ detail.notice }}</p>
            <div class="md-actions">
              <button class="btn-outline" type="button" @click="callPhone">电话咨询</button>
              <button class="btn-solid" type="button" @click="openAppointment">预约试听</button>
            </div>
          </div>
        </div>
      </div>
    </template>
    </div>
  </el-dialog>

  <!-- ============ 预约弹窗（独立小弹窗） ============ -->
  <el-dialog
    v-model="appointmentOpen"
    :show-close="false"
    width="min(26rem, 92vw)"
    append-to-body
    class="mentor-appointment-dialog"
  >
    <button class="md-close" type="button" aria-label="关闭" @click="closeAppointment">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
    </button>
    <div class="appt-head">
      <span class="appt-avatar">
        <img v-if="appointment?.avatarUrl" :src="appointment.avatarUrl" :alt="appointment.name" />
        <span v-else class="avatar-fallback">{{ appointment?.logoText }}</span>
      </span>
      <div>
        <span class="md-eyebrow">预约联系方式</span>
        <h3 class="md-title">{{ appointment?.name }}</h3>
      </div>
    </div>
    <div v-if="appointmentLoading" class="md-loading"><div class="md-spinner"></div></div>
    <div v-else class="appt-body">
      <div v-if="appointment?.phone" class="appt-row">
        <span class="appt-icon" v-html="ICO.phone"></span>
        <span class="appt-value">{{ appointment.phone }}</span>
        <a class="appt-action" :href="`tel:${appointment.phone}`"><span v-html="ICO.phone"></span>拨打</a>
        <button class="appt-action" type="button" @click="copyText(appointment.phone, '电话')"><span v-html="ICO.copy"></span>复制</button>
      </div>
      <div v-if="appointment?.email" class="appt-row">
        <span class="appt-icon" v-html="ICO.mail"></span>
        <span class="appt-value">{{ appointment.email }}</span>
        <button class="appt-action" type="button" @click="copyText(appointment.email, '邮箱')"><span v-html="ICO.copy"></span>复制</button>
      </div>
      <div v-if="appointment?.address" class="appt-row">
        <span class="appt-icon" v-html="ICO.place"></span>
        <span class="appt-value">{{ appointment.address }}</span>
        <button class="appt-action" type="button" @click="copyText(appointment.address, '地址')"><span v-html="ICO.copy"></span>复制</button>
      </div>
      <div v-if="appointment?.qrcodeUrl" class="appt-qr">
        <p>微信扫码联系</p>
        <img :src="appointment.qrcodeUrl" alt="微信二维码" />
      </div>
      <div v-if="!appointment?.phone && !appointment?.email && !appointment?.address && !appointment?.qrcodeUrl" class="empty-hint">暂无公开联系方式</div>
      <button class="appt-consult-btn" type="button" @click="consultationVisible = true">留言咨询</button>
    </div>
  </el-dialog>

  <ConsultationDialog
    v-if="currentEntry"
    v-model:visible="consultationVisible"
    :biz-type="isPerson ? 'planner' : 'institution'"
    :biz-id="currentEntry.id"
    :biz-name="appointment?.name || currentEntry.name"
  />
</template>

<style>
/* el-dialog 挂到 body，需非 scoped 覆盖默认内边距，让 .md-head 渐变贴边 */
.mentor-panel-dialog .el-dialog__header,
.mentor-appointment-dialog .el-dialog__header { padding: 0; }
.mentor-panel-dialog .el-dialog__body,
.mentor-appointment-dialog .el-dialog__body { padding: 0; }
.mentor-panel-dialog,
.mentor-appointment-dialog { border-radius: 1.25rem; overflow: hidden; }
</style>

<style scoped>
/* 通用 */
.mentor-dialog-root { position: relative; }
.md-close {
  position: absolute; top: 1rem; right: 1rem; z-index: 5;
  display: flex; align-items: center; justify-content: center;
  width: 2.25rem; height: 2.25rem; border-radius: 50%;
  color: #64748b; background: rgba(255,255,255,.9); border: 1px solid #e2e8f0;
  cursor: pointer; transition: background .25s ease, color .25s ease, transform .3s ease;
}
.md-close:hover { background: #fff; color: #1f2937; transform: rotate(90deg); }
.md-close svg { width: 1rem; height: 1rem; }
.md-loading { display: flex; align-items: center; justify-content: center; min-height: 16rem; }
.md-spinner { width: 2rem; height: 2rem; border-radius: 50%; border: 4px solid #e0f2fe; border-top-color: var(--pc, #f97316); animation: md-spin .8s linear infinite; }
@keyframes md-spin { to { transform: rotate(360deg); } }
.md-eyebrow { display: inline-flex; align-items: center; gap: .45rem; font-size: .7rem; font-weight: 700; letter-spacing: .12em; color: var(--pc-deep, #c2410c); text-transform: uppercase; }
.md-eyebrow::before { content: ''; width: 1.1rem; height: 2px; border-radius: 2px; background: currentColor; }
.md-title { margin-top: .5rem; font-size: 1.32rem; font-weight: 800; color: #0f172a; letter-spacing: -.02em; }
.md-sub { margin-top: .4rem; max-width: 34rem; font-size: .82rem; line-height: 1.75; color: #64748b; }
.md-intro { margin-top: 1.1rem; font-size: .84rem; line-height: 1.85; color: #4b5563; }
.md-foot { margin-top: 1.1rem; padding-top: .9rem; border-top: 1px dashed #e2e8f0; font-size: .74rem; line-height: 1.7; color: #94a3b8; }
.md-actions { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: 1.35rem; }
.btn-solid, .btn-outline {
  display: inline-flex; align-items: center; justify-content: center; gap: .35rem;
  padding: .62rem 1.25rem; border-radius: .6rem; font-size: .83rem; font-weight: 600; cursor: pointer;
  transition: transform .25s ease, box-shadow .25s ease, background .25s ease, border-color .25s ease;
}
.btn-solid { background: var(--pc, #f97316); color: #fff; border: 1px solid transparent; box-shadow: 0 8px 18px -8px rgba(15,23,42,.35); }
.btn-solid:hover { transform: translateY(-1px); box-shadow: 0 12px 22px -8px rgba(15,23,42,.4); }
.btn-outline { background: #fff; color: #475569; border: 1px solid #e2e8f0; }
.btn-outline:hover { border-color: #cbd5e1; background: #f8fafc; }
.avatar-fallback { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; border-radius: 50%; color: var(--pc-deep, #c2410c); font-weight: 800; font-size: 1.1rem; background: var(--pc-soft, #fff7ed); }
.avatar-fallback.big { font-size: 2.4rem; }

/* accent 主题变量（随卡片色） */
.accent-blue { --pc: #3b82f6; --pc-soft: #eff6ff; --pc-deep: #1d4ed8; --pc-line: rgba(59,130,246,.3); }
.accent-indigo { --pc: #6366f1; --pc-soft: #eef2ff; --pc-deep: #4338ca; --pc-line: rgba(99,102,241,.3); }
.accent-orange { --pc: #f97316; --pc-soft: #fff7ed; --pc-deep: #c2410c; --pc-line: rgba(249,115,22,.3); }
.accent-green { --pc: #059669; --pc-soft: #ecfdf5; --pc-deep: #047857; --pc-line: rgba(5,150,105,.3); }
.accent-red { --pc: #ef4444; --pc-soft: #fef2f2; --pc-deep: #b91c1c; --pc-line: rgba(239,68,68,.3); }
.accent-cyan { --pc: #0891b2; --pc-soft: #ecfeff; --pc-deep: #0e7490; --pc-line: rgba(8,145,178,.3); }

/* 头部 */
.md-head { position: relative; padding: 1.75rem 3.6rem 1.2rem 2rem; border-bottom: 1px solid #f1f5f9; background: linear-gradient(135deg, var(--pc-soft) 0%, #fff 72%); }
.md-head::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: linear-gradient(180deg, var(--pc), rgba(255,255,255,0)); }
.md-body { padding: 1.25rem 2rem 1.9rem; }
.panel-back { display: inline-flex; align-items: center; gap: .28rem; margin-bottom: .9rem; padding: .26rem .7rem .26rem .5rem; border-radius: 9999px; background: #fff; border: 1px solid #e2e8f0; font-size: .75rem; font-weight: 600; color: #64748b; cursor: pointer; }
.panel-back:hover { color: var(--pc-deep); border-color: var(--pc-line); background: var(--pc-soft); }
.panel-back svg { width: .85rem; height: .85rem; }
.panel-badge { display: inline-block; vertical-align: middle; margin-left: .45rem; font-style: normal; font-size: .66rem; font-weight: 700; color: var(--pc-deep); background: var(--pc-soft); border: 1px solid var(--pc-line); border-radius: .35rem; padding: .1rem .4rem; transform: translateY(-3px); }

/* 省份筛选 */
.filter-bar { display: flex; align-items: center; gap: .65rem; margin: 0 0 1.05rem; padding-bottom: .85rem; border-bottom: 1px dashed #e2e8f0; }
.filter-bar__label { flex: none; display: inline-flex; align-items: center; gap: .28rem; font-size: .72rem; font-weight: 700; letter-spacing: .06em; color: #94a3b8; }
.filter-bar__label svg { width: .86rem; height: .86rem; }
.filter-chips { flex: 1; min-width: 0; display: flex; gap: .4rem; overflow-x: auto; scrollbar-width: none; padding: .12rem 0; }
.filter-chips::-webkit-scrollbar { display: none; }
.filter-chip { flex: none; display: inline-flex; align-items: center; gap: .3rem; padding: .28rem .7rem; border-radius: 9999px; background: #fff; border: 1px solid #e2e8f0; font-size: .76rem; font-weight: 600; color: #64748b; cursor: pointer; transition: color .25s ease, border-color .25s ease, background .25s ease; }
.filter-chip em { font-style: normal; font-size: .66rem; color: #94a3b8; }
.filter-chip:hover { color: var(--pc-deep); border-color: var(--pc-line); background: var(--pc-soft); }
.filter-chip.is-active { background: var(--pc); border-color: var(--pc); color: #fff; box-shadow: 0 8px 16px -10px var(--pc); }
.filter-chip.is-active em { color: rgba(255,255,255,.82); }
.filter-bar__count { flex: none; font-size: .7rem; color: #94a3b8; white-space: nowrap; }
.empty-hint { padding: 2.4rem 1rem; text-align: center; font-size: .82rem; line-height: 1.8; color: #94a3b8; border: 1px dashed #e2e8f0; border-radius: .85rem; background: #fafbfc; }

/* 名单卡片 */
.entry-grid { display: grid; gap: .7rem; }
.entry-grid--person, .entry-grid--org { grid-template-columns: repeat(2, minmax(0,1fr)); }
.entry-card { position: relative; display: flex; align-items: center; gap: .8rem; width: 100%; padding: .8rem .85rem; text-align: left; background: #fff; border: 1px solid #f1f5f9; border-radius: .85rem; cursor: pointer; transition: transform .3s ease, border-color .3s ease, box-shadow .3s ease; }
.entry-card:hover { transform: translateY(-2px); border-color: var(--pc-line); box-shadow: 0 14px 28px -16px rgba(15,23,42,.42); }
.entry-avatar { flex-shrink: 0; width: 3.05rem; height: 3.05rem; padding: 2px; border-radius: 50%; background: linear-gradient(145deg, var(--pc), var(--pc-soft)); }
.entry-avatar img, .person-avatar img { display: block; width: 100%; height: 100%; border-radius: 50%; object-fit: cover; object-position: center 18%; background: #fff; border: 2px solid #fff; }
.entry-main { flex: 1; min-width: 0; }
.entry-name { display: flex; align-items: center; gap: .35rem; font-size: .9rem; font-weight: 700; color: #1f2937; }
.entry-name em { flex-shrink: 0; font-style: normal; font-size: .63rem; font-weight: 700; color: var(--pc-deep); background: var(--pc-soft); border: 1px solid var(--pc-line); border-radius: .28rem; padding: .02rem .3rem; }
.entry-role { display: block; margin-top: .18rem; font-size: .74rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.entry-tags { display: flex; flex-wrap: wrap; gap: .28rem; margin-top: .4rem; }
.entry-tags i { font-style: normal; font-size: .66rem; color: #64748b; background: #f1f5f9; border-radius: .26rem; padding: .08rem .36rem; }
.entry-tags i.entry-prov { color: var(--pc-deep); background: var(--pc-soft); border: 1px solid var(--pc-line); }
.entry-arrow { flex-shrink: 0; color: #cbd5e1; transition: transform .3s ease, color .3s ease; }
.entry-arrow svg { width: .95rem; height: .95rem; }
.entry-card:hover .entry-arrow { color: var(--pc); transform: translateX(3px); }
.entry-card--org { flex-direction: column; align-items: stretch; gap: 0; padding: 0; overflow: hidden; }
.entry-cover { position: relative; aspect-ratio: 16/8.4; overflow: hidden; background: linear-gradient(135deg, var(--pc-soft), var(--pc-line)); }
.cover-placeholder { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 2.4rem; font-weight: 800; color: var(--pc-deep); opacity: .35; }
.entry-cover__logo { position: absolute; left: .7rem; bottom: .65rem; display: flex; align-items: center; justify-content: center; width: 1.95rem; height: 1.95rem; border-radius: .55rem; background: rgba(255,255,255,.95); color: var(--pc-deep); font-size: .85rem; font-weight: 800; }
.entry-body { padding: .72rem .9rem .82rem; }
.entry-title { display: block; font-size: .9rem; font-weight: 700; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.entry-meta { display: block; margin-top: .2rem; font-size: .72rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* 人物详情 */
.person-detail { display: grid; grid-template-columns: 14rem minmax(0,1fr); gap: 2rem; }
.person-side { display: flex; flex-direction: column; align-items: center; gap: .85rem; align-self: start; padding: 1.6rem 1rem; border-radius: 1rem; border: 1px solid #f1f5f9; background: radial-gradient(120% 90% at 50% 0%, var(--pc-soft) 0%, #f8fafc 62%); }
.person-avatar { width: 9.5rem; height: 9.5rem; padding: 4px; border-radius: 50%; background: linear-gradient(150deg, var(--pc), #fff 72%); }
.person-credential { display: inline-flex; align-items: center; gap: .3rem; padding: .26rem .65rem; border-radius: 9999px; background: #fff; border: 1px solid var(--pc-line); font-size: .7rem; font-weight: 600; color: var(--pc-deep); white-space: nowrap; }
.person-credential svg { width: .75rem; height: .75rem; }
.person-pager { display: flex; align-items: center; gap: .45rem; }
.person-pager button { display: flex; align-items: center; justify-content: center; width: 1.85rem; height: 1.85rem; border-radius: 50%; background: #fff; border: 1px solid #e2e8f0; color: #64748b; cursor: pointer; }
.person-pager button:hover:not(:disabled) { color: var(--pc-deep); border-color: var(--pc-line); background: var(--pc-soft); }
.person-pager button:disabled { opacity: .35; cursor: not-allowed; }
.person-pager svg { width: .85rem; height: .85rem; }
.person-pager span { font-size: .72rem; color: #94a3b8; }
.person-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: .55rem; margin-top: 1.1rem; }
.person-stat { padding: .58rem .4rem; border-radius: .6rem; text-align: center; background: #f8fafc; border: 1px solid #f1f5f9; }
.person-stat b { display: block; font-size: 1.02rem; font-weight: 800; color: var(--pc-deep); }
.person-stat span { display: block; margin-top: .15rem; font-size: .7rem; color: #94a3b8; }
.person-tags { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: .9rem; }
.person-tag { font-size: .71rem; color: var(--pc-deep); background: var(--pc-soft); border: 1px solid var(--pc-line); border-radius: 9999px; padding: .22rem .62rem; }
.person-services { margin-top: 1.2rem; }
.person-services h4, .org-block h4 { margin-bottom: .6rem; font-size: .78rem; font-weight: 700; color: #334155; }
.person-services li { position: relative; padding-left: 1.05rem; font-size: .81rem; line-height: 1.75; color: #4b5563; }
.person-services li+li { margin-top: .32rem; }
.person-services li::before { content: ''; position: absolute; left: 0; top: .62rem; width: .4rem; height: .4rem; border-radius: 50%; background: var(--pc); opacity: .7; }
.person-services li strong { color: #1f2937; font-weight: 600; margin-right: .3rem; }

/* 机构详情 */
.org-gallery { display: grid; grid-template-columns: minmax(0,1.55fr) minmax(0,1fr); gap: .55rem; }
.gallery-stage { position: relative; overflow: hidden; border-radius: .85rem; background: #f1f5f9; min-height: 15rem; }
.gallery-stage img { display: block; width: 100%; height: 100%; object-fit: cover; }
.gallery-cap { position: absolute; left: 0; right: 0; bottom: 0; padding: 1.5rem .85rem .6rem; font-size: .75rem; font-weight: 600; color: #fff; background: linear-gradient(to top, rgba(15,23,42,.72), rgba(15,23,42,0)); }
.gallery-nav { position: absolute; top: 50%; transform: translateY(-50%); display: flex; align-items: center; justify-content: center; width: 1.85rem; height: 1.85rem; border-radius: 50%; background: rgba(255,255,255,.9); color: #334155; cursor: pointer; }
.gallery-nav--prev { left: .5rem; }
.gallery-nav--next { right: .5rem; }
.gallery-nav svg { width: .85rem; height: .85rem; }
.gallery-thumbs { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); grid-template-rows: repeat(2,minmax(0,1fr)); gap: .55rem; }
.gallery-thumb { position: relative; overflow: hidden; border-radius: .6rem; border: 2px solid transparent; opacity: .68; cursor: pointer; padding: 0; background: #f1f5f9; }
.gallery-thumb img { display: block; width: 100%; height: 100%; object-fit: cover; }
.gallery-thumb.is-active { border-color: var(--pc); opacity: 1; }
.org-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: .55rem; margin-top: 1.1rem; }
.org-cell { padding: .65rem .75rem; border-radius: .65rem; background: #f8fafc; border: 1px solid #f1f5f9; }
.org-cell dt { font-size: .67rem; color: #94a3b8; }
.org-cell dd { margin: .2rem 0 0; font-size: .79rem; font-weight: 600; color: #334155; line-height: 1.5; }
.org-block { margin-top: 1.3rem; }
.course { display: flex; align-items: center; gap: .8rem; padding: .72rem .9rem; border-radius: .65rem; background: #fff; border: 1px solid #f1f5f9; }
.course+.course { margin-top: .5rem; }
.course__main { flex: 1; min-width: 0; }
.course__name { font-size: .84rem; font-weight: 700; color: #1f2937; }
.course__meta { margin-top: .16rem; font-size: .74rem; line-height: 1.6; color: #94a3b8; }
.course__tag { flex-shrink: 0; font-size: .71rem; font-weight: 600; color: var(--pc-deep); background: #fff; border: 1px solid var(--pc-line); border-radius: 9999px; padding: .2rem .58rem; }
.org-hl { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: .5rem .9rem; }
.org-hl li { display: flex; align-items: flex-start; gap: .45rem; font-size: .79rem; line-height: 1.7; color: #4b5563; }
.org-hl .dot { flex-shrink: 0; width: .4rem; height: .4rem; margin-top: .5rem; border-radius: 50%; background: var(--pc); }
.org-foot { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-top: 1.3rem; padding-top: 1rem; border-top: 1px dashed #e2e8f0; }
.org-foot .md-actions { margin-top: 0; }
.org-tip { font-size: .74rem; line-height: 1.7; color: #94a3b8; }

/* 预约弹窗 */
.appt-head { display: flex; align-items: center; gap: .9rem; padding: 1.5rem 1.5rem 1.1rem; border-bottom: 1px solid #f1f5f9; background: linear-gradient(135deg, #fff7ed 0%, #fff 72%); }
.appt-avatar { flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 3.4rem; height: 3.4rem; padding: 3px; border-radius: 50%; background: linear-gradient(145deg, #f97316, #fff7ed); overflow: hidden; }
.appt-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; background: #fff; }
.appt-body { padding: 1rem 1.5rem 1.5rem; }
.appt-consult-btn {
  width: 100%; margin-top: 1rem; padding: .7rem 1rem; border: none; border-radius: 9999px;
  color: #fff; font-size: .9rem; font-weight: 600; cursor: pointer;
  background: linear-gradient(135deg, #f5a54a, #e8722a);
  box-shadow: 0 6px 16px rgba(232, 114, 42, .22);
  transition: transform .2s ease, box-shadow .2s ease;
}
.appt-consult-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(232, 114, 42, .3); }
.appt-row { display: flex; align-items: center; gap: .6rem; padding: .7rem 0; border-bottom: 1px dashed #f1f5f9; }
.appt-icon { flex-shrink: 0; display: flex; color: #f97316; }
.appt-icon svg { width: 1.05rem; height: 1.05rem; }
.appt-value { flex: 1; min-width: 0; font-size: .84rem; color: #334155; word-break: break-all; }
.appt-action { display: inline-flex; align-items: center; gap: .2rem; flex-shrink: 0; padding: .24rem .55rem; border-radius: .45rem; font-size: .72rem; font-weight: 600; color: #c2410c; background: #fff7ed; border: 1px solid #fed7aa; text-decoration: none; cursor: pointer; }
.appt-action svg { width: .8rem; height: .8rem; }
.appt-qr { margin-top: 1rem; text-align: center; }
.appt-qr p { font-size: .75rem; color: #94a3b8; }
.appt-qr img { max-width: 11rem; max-height: 11rem; margin-top: .5rem; border: 1px solid #e2e8f0; border-radius: .6rem; }

@media (max-width: 768px) {
  .entry-grid--person, .entry-grid--org { grid-template-columns: 1fr; }
  .person-detail { grid-template-columns: 1fr; gap: 1.25rem; }
  .person-side { display: grid; grid-template-columns: auto 1fr; grid-template-areas: 'avatar cred' 'avatar pager'; gap: .55rem 1rem; align-items: center; padding: .95rem 1.1rem; }
  .person-avatar { grid-area: avatar; width: 5.4rem; height: 5.4rem; }
  .person-credential { grid-area: cred; justify-self: start; }
  .person-pager { grid-area: pager; margin: 0; justify-self: start; }
  .org-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .org-gallery { grid-template-columns: 1fr; }
  .org-hl { grid-template-columns: 1fr; }
  .filter-bar { flex-wrap: wrap; }
  .filter-chips { order: 3; flex-basis: 100%; flex-wrap: wrap; overflow: visible; }
}
</style>
