import type { RouteRecordRaw } from 'vue-router'

const homeRoutes: RouteRecordRaw = {
  path: '/home',
  name: 'Home',
  meta: { title: '首页管理', icon: 'HomeFilled' },
  redirect: '/home/announcement',
  children: [
    {
      path: 'announcement',
      name: 'HomeAnnouncement',
      component: () => import('@/views/home/announcement/index.vue'),
      meta: { title: '公告管理', moduleCode: 'home_announcement' },
    },
    {
      path: 'planner',
      name: 'HomePlanner',
      component: () => import('@/views/home/planner/index.vue'),
      meta: { title: '规划师管理', moduleCode: 'home_planner' },
    },
    {
      path: 'institution',
      name: 'HomeInstitution',
      component: () => import('@/views/home/institution/index.vue'),
      meta: { title: '培训机构管理', moduleCode: 'home_institution' },
    },
  ],
}

export default homeRoutes
