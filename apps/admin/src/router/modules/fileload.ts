import type { RouteRecordRaw } from 'vue-router'

const fileloadRoutes: RouteRecordRaw = {
  path: '/fileload',
  name: 'FileLoad',
  meta: { title: '文件管理', icon: 'FolderOpened' },
  redirect: '/fileload/middle-school',
  children: [
    {
      path: 'middle-school',
      name: 'FileLoadMiddleSchool',
      component: () => import('@/views/home/middleSchool/index.vue'),
      meta: { title: '初中资源', moduleCode: 'fileload_middle' },
    },
    {
      path: 'high-school',
      name: 'FileLoadHighSchool',
      component: () => import('@/views/home/highSchool/index.vue'),
      meta: { title: '高中资源', moduleCode: 'fileload_high' },
    },
  ],
}

export default fileloadRoutes
