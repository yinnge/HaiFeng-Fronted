import type { RouteRecordRaw } from 'vue-router'

const cityRoutes: RouteRecordRaw = {
  path: '/city',
  name: 'City',
  meta: { title: '城市管理', icon: 'MapLocation' },
  redirect: '/city/list',
  children: [
    {
      path: 'list',
      name: 'CityList',
      component: () => import('@/views/city/list/index.vue'),
      meta: { title: '城市管理', moduleCode: 'city_info' },
    },
  ],
}

export default cityRoutes
