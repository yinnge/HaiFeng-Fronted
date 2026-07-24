import type { RouteRecordRaw } from 'vue-router'

const companyRoutes: RouteRecordRaw = {
  path: '/company',
  name: 'Company',
  meta: { title: '企业管理', icon: 'Briefcase' },
  redirect: '/company/info',
  children: [
    {
      path: 'info',
      name: 'CompanyInfo',
      component: () => import('@/views/company/info/index.vue'),
      meta: { title: '企业列表', moduleCode: 'company_info' },
    },
    {
      path: 'industry',
      name: 'CompanyIndustry',
      component: () => import('@/views/company/industry/index.vue'),
      meta: { title: '企业-行业关联', moduleCode: 'company_industry' },
    },
  ],
}

export default companyRoutes
