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
      meta: { title: '用户列表', moduleCode: 'user_member' },
    },
    {
      path: 'order',
      name: 'UserOrder',
      component: () => import('@/views/user/order/index.vue'),
      meta: { title: '订单管理', moduleCode: 'user_order' },
    },
    {
      path: 'commission',
      name: 'UserCommission',
      component: () => import('@/views/user/commission/index.vue'),
      meta: { title: '佣金管理', moduleCode: 'user_commission' },
    },
    {
      path: 'notification',
      name: 'UserNotification',
      component: () => import('@/views/user/notification/index.vue'),
      meta: { title: '通知管理', moduleCode: 'user_notification' },
    },
    {
      path: 'withdraw',
      name: 'UserWithdraw',
      component: () => import('@/views/user/withdraw/index.vue'),
      meta: { title: '提现管理', moduleCode: 'user_withdraw' },
    },
  ],
}

export default userRoutes
