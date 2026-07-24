import type { RouteRecordRaw } from 'vue-router'

const majorRoutes: RouteRecordRaw = {
  path: '/major',
  name: 'Major',
  meta: { title: '专业管理', icon: 'Reading' },
  redirect: '/major/list',
  children: [
    {
      path: 'list',
      name: 'MajorList',
      component: () => import('@/views/major/list/index.vue'),
      meta: { title: '专业列表', moduleCode: 'major_info' },
    },
    {
      path: 'postgrad',
      name: 'MajorPostgrad',
      component: () => import('@/views/major/postgrad/index.vue'),
      meta: { title: '考研专业', moduleCode: 'major_subject' },
    },
    {
      path: 'postgrad-univ',
      name: 'MajorPostgradUniv',
      component: () => import('@/views/major/postgrad-univ/index.vue'),
      meta: { title: '考研专业大学关联', moduleCode: 'major_univ' },
    },
    {
      path: 'postgrad-direction',
      name: 'MajorPostgradDirection',
      component: () => import('@/views/major/postgrad-direction/index.vue'),
      meta: { title: '专业考研关联', moduleCode: 'major_postgraduate' },
    },
  ],
}

export default majorRoutes
