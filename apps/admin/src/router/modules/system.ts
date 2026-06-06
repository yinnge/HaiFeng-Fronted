import type { RouteRecordRaw } from 'vue-router'

const systemRoutes: RouteRecordRaw = {
  path: '/system',
  name: 'System',
  meta: { title: '系统管理', icon: 'Setting' },
  redirect: '/system/settings',
  children: [
    {
      path: 'settings',
      name: 'SystemSettings',
      component: () => import('@/views/system/settings/index.vue'),
      meta: { title: '系统设置', icon: 'Tools' },
    },
    {
      path: 'log',
      name: 'SystemLog',
      component: () => import('@/views/system/log/index.vue'),
      meta: { title: '操作日志', icon: 'Document' },
    },
  ],
}

export default systemRoutes
