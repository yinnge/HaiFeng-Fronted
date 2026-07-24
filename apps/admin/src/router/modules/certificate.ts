import type { RouteRecordRaw } from 'vue-router'

const certificateRoutes: RouteRecordRaw = {
  path: '/certificate',
  name: 'Certificate',
  meta: { title: '证书竞赛', icon: 'TrophyBase' },
  redirect: '/certificate/certificate',
  children: [
    {
      path: 'certificate',
      name: 'CertificateInfo',
      component: () => import('@/views/certificate/certificate/index.vue'),
      meta: { title: '证书管理', moduleCode: 'certificate_info' },
    },
    {
      path: 'competition',
      name: 'CertificateComp',
      component: () => import('@/views/certificate/competition/index.vue'),
      meta: { title: '竞赛管理', moduleCode: 'certificate_comp' },
    },
    {
      path: 'competition-major',
      name: 'CertificateCompMajor',
      component: () => import('@/views/certificate/competition-major/index.vue'),
      meta: { title: '竞赛-专业关联', moduleCode: 'cert_comp_major' },
    },
  ],
}

export default certificateRoutes
