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
    {
      path: 'college',
      name: 'FileLoadCollege',
      component: () => import('@/views/home/college/index.vue'),
      meta: { title: '大学资源', moduleCode: 'fileload_college' },
    },
    {
      path: 'postgrad-exam',
      name: 'FileLoadPostgradExam',
      component: () => import('@/views/home/postgradExam/index.vue'),
      meta: { title: '考研资源', moduleCode: 'fileload_postgrad_exam' },
    },
    {
      path: 'civil-service',
      name: 'FileLoadCivilService',
      component: () => import('@/views/home/civilService/index.vue'),
      meta: { title: '考公资源', moduleCode: 'fileload_civil_service' },
    },
    {
      path: 'graduate',
      name: 'FileLoadGraduate',
      component: () => import('@/views/home/graduate/index.vue'),
      meta: { title: '研究生资源', moduleCode: 'fileload_graduate' },
    },
  ],
}

export default fileloadRoutes
