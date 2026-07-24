import type { RouteRecordRaw } from 'vue-router'

const specialRoutes: RouteRecordRaw = {
  path: '/special',
  name: 'Special',
  meta: { title: '特殊通道', icon: 'School' },
  redirect: '/special/admission',
  children: [
    {
      path: 'admission',
      name: 'SpecialAdmission',
      component: () => import('@/views/special/admission/index.vue'),
      meta: { title: '招生通道管理', moduleCode: 'special_admission' },
    },
    {
      path: 'adm-univ',
      name: 'SpecialAdmUniv',
      component: () => import('@/views/special/adm-univ/index.vue'),
      meta: { title: '通道院校关联管理', moduleCode: 'special_adm_univ' },
    },
    {
      path: 'sbs-score',
      name: 'SpecialSbsScore',
      component: () => import('@/views/special/sbs-score/index.vue'),
      meta: { title: '强基计划分数管理', moduleCode: 'special_sbs_score' },
    },
    {
      path: 'sbs-config',
      name: 'SpecialSbsConfig',
      component: () => import('@/views/special/sbs-config/index.vue'),
      meta: { title: '强基院校配置', moduleCode: 'special_sbs_config' },
    },
  ],
}

export default specialRoutes
