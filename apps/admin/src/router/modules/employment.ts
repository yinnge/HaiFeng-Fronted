import type { RouteRecordRaw } from 'vue-router'

const employmentRoutes: RouteRecordRaw = {
  path: '/employment',
  name: 'Employment',
  meta: { title: '就业管理', icon: 'Briefcase' },
  redirect: '/employment/civil/servant',
  children: [
    {
      path: 'civil',
      name: 'CivilService',
      meta: { title: '体制内招录', icon: 'Briefcase' },
      redirect: '/employment/civil/servant',
      children: [
        {
          path: 'servant',
          name: 'CivilServant',
          component: () => import('@/views/employment/civil/index.vue'),
          meta: { title: '公务员职位', moduleCode: 'emp_civil_servant' },
        },
        {
          path: 'institution',
          name: 'CivilInstitution',
          component: () => import('@/views/employment/institution/index.vue'),
          meta: { title: '事业编职位', moduleCode: 'emp_civil_institution' },
        },
        {
          path: 'military',
          name: 'CivilMilitary',
          component: () => import('@/views/employment/military/index.vue'),
          meta: { title: '部队文职岗位', moduleCode: 'emp_civil_military' },
        },
        {
          path: 'selection',
          name: 'CivilSelection',
          component: () => import('@/views/employment/selection/index.vue'),
          meta: { title: '选调生岗位', moduleCode: 'emp_civil_selected' },
        },
      ],
    },
    {
      path: 'grassroots',
      name: 'Grassroots',
      meta: { title: '基层服务管理', icon: 'User' },
      redirect: '/employment/grassroots/project',
      children: [
        {
          path: 'project',
          name: 'GrassrootsProject',
          component: () => import('@/views/employment/grassroots/project/index.vue'),
          meta: { title: '基层服务项目岗位', moduleCode: 'emp_grassroots_3s' },
        },
        {
          path: 'community',
          name: 'GrassrootsCommunity',
          component: () => import('@/views/employment/community/index.vue'),
          meta: { title: '社区工作者岗位', moduleCode: 'emp_grassroots_comm' },
        },
        {
          path: 'welfare',
          name: 'GrassrootsWelfare',
          component: () => import('@/views/employment/welfare/index.vue'),
          meta: { title: '公益性岗位', moduleCode: 'emp_grassroots_welfare' },
        },
      ],
    },
    {
      path: 'content',
      name: 'EmploymentContent',
      meta: { title: '招聘内容管理', icon: 'Document' },
      redirect: '/employment/content/guide',
      children: [
        {
          path: 'guide',
          name: 'EmpContentGuide',
          component: () => import('@/views/employment/content/guide/index.vue'),
          meta: { title: '统一备考指南', moduleCode: 'emp_content_guide' },
        },
        {
          path: 'notice',
          name: 'EmpContentNotice',
          component: () => import('@/views/employment/content/notice/index.vue'),
          meta: { title: '统一公告', moduleCode: 'emp_content_notice' },
        },
      ],
    },
    {
      path: 'industry',
      name: 'EmploymentIndustry',
      meta: { title: '行业专项招聘管理', icon: 'OfficeBuilding', moduleCode: 'emp_industry' },
      redirect: '/employment/industry/bank',
      children: [
        {
          path: 'bank',
          name: 'IndustryBank',
          component: () => import('@/views/employment/finance/index.vue'),
          meta: { title: '银行/金融岗位管理', moduleCode: 'emp_industry_bank' },
        },
        {
          path: 'medical',
          name: 'IndustryMedical',
          component: () => import('@/views/employment/healthcare/index.vue'),
          meta: { title: '医疗卫生岗位管理', moduleCode: 'emp_industry_medical' },
        },
        {
          path: 'teacher',
          name: 'IndustryTeacher',
          component: () => import('@/views/employment/teacher/index.vue'),
          meta: { title: '教师招聘岗位管理', moduleCode: 'emp_industry_teacher' },
        },
      ],
    },
  ],
}

export default employmentRoutes
