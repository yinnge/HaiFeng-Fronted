import type { RouteRecordRaw } from 'vue-router'

const universityRoutes: RouteRecordRaw = {
  path: '/university',
  name: 'University',
  meta: { title: '院校管理', icon: 'School' },
  redirect: '/university/info',
  children: [
    {
      path: 'info',
      name: 'UniversityInfo',
      component: () => import('@/views/university/info/index.vue'),
      meta: { title: '院校列表', moduleCode: 'university_info' },
    },
    {
      path: 'album',
      name: 'UniversityAlbum',
      component: () => import('@/views/university/album/index.vue'),
      meta: { title: '校园图册', moduleCode: 'university_album' },
    },
    {
      path: 'guide',
      name: 'UniversityGuide',
      component: () => import('@/views/university/guide/index.vue'),
      meta: { title: '院校适应指南', moduleCode: 'university_guide' },
    },
    {
      path: 'dept',
      name: 'UniversityDept',
      component: () => import('@/views/university/dept/index.vue'),
      meta: { title: '院系管理', moduleCode: 'university_dept' },
    },
    {
      path: 'laboratory',
      name: 'UniversityLab',
      component: () => import('@/views/university/laboratory/index.vue'),
      meta: { title: '实验室管理', moduleCode: 'university_lab' },
    },
    {
      path: 'subject-evaluation',
      name: 'UniversitySubjectEvaluation',
      component: () => import('@/views/university/subject-evaluation/index.vue'),
      meta: { title: '学科评估管理', moduleCode: 'university_eval' },
    },
  ],
}

export default universityRoutes
