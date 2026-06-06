// apps/admin/src/router/modules/permission.ts
import type { RouteRecordRaw } from 'vue-router'

const permissionRoutes: RouteRecordRaw = {
  path: '/permission',
  name: 'Permission',
  meta: { title: '权限管理', icon: 'Lock' },
  redirect: '/permission/role',
  children: [
    {
      path: 'role',
      name: 'PermissionRole',
      component: () => import('@/views/permission/role/index.vue'),
      meta: { title: '角色列表', icon: 'User' },
    },
    {
      path: 'module',
      name: 'PermissionModule',
      component: () => import('@/views/permission/module/index.vue'),
      meta: { title: '模块列表', icon: 'Menu' },
    },
    {
      path: 'admin',
      name: 'PermissionAdmin',
      component: () => import('@/views/permission/admin/index.vue'),
      meta: { title: '管理员列表', icon: 'Avatar' },
    },
  ],
}

export default permissionRoutes
