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
      meta: { title: '系统设置', icon: 'Tools', moduleCode: 'system_setting' },
    },
    {
      path: 'log',
      name: 'SystemLog',
      component: () => import('@/views/system/log/index.vue'),
      meta: { title: '操作日志', icon: 'Document', moduleCode: 'system_log' },
    },
    {
      path: 'provider',
      name: 'SystemProvider',
      component: () => import('@/views/system/provider/index.vue'),
      meta: { title: 'AI余额查询', icon: 'Monitor', moduleCode: 'system_provider' },
    },
  ],
}

export default systemRoutes
