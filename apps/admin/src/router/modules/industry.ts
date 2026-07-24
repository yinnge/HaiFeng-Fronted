import type { RouteRecordRaw } from 'vue-router'

const industryRoutes: RouteRecordRaw = {
  path: '/industry',
  name: 'Industry',
  meta: { title: '行业管理', icon: 'DataLine' },
  redirect: '/industry/list',
  children: [
    {
      path: 'list',
      name: 'IndustryList',
      component: () => import('@/views/industry/list/index.vue'),
      meta: { title: '行业管理', moduleCode: 'industry_info' },
    },
  ],
}

export default industryRoutes
