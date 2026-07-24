import type { RouteRecordRaw } from 'vue-router'

const resourceRoutes: RouteRecordRaw = {
  path: '/resource',
  name: 'Resource',
  meta: { title: '资源管理', icon: 'Collection' },
  redirect: '/resource/list',
  children: [
    {
      path: 'list',
      name: 'ResourceList',
      component: () => import('@/views/resource/list/index.vue'),
      meta: { title: '资源管理', moduleCode: 'resource_info' },
    },
  ],
}

export default resourceRoutes
