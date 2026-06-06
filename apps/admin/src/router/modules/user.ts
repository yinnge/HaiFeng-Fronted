import type { RouteRecordRaw } from 'vue-router'

const userRoutes: RouteRecordRaw = {
  path: '/user',
  name: 'User',
  meta: { title: '用户管理', icon: 'User' },
  redirect: '/user/list',
  children: [
    {
      path: 'list',
      name: 'UserList',
      component: () => import('@/views/user/list/index.vue'),
      meta: { title: '用户列表', icon: 'UserFilled' },
    },
  ],
}

export default userRoutes
