import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/modules/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/gaokao',
    name: 'GaokaoEntry',
    component: () => import('@/views/gaokao/index.vue'),
    meta: { title: '高考报志愿', requiresAuth: true },
  },
  {
    path: '/gaokao/archive',
    name: 'GaokaoArchive',
    component: () => import('@/views/gaokao/Archive.vue'),
    meta: { title: '高考档案', requiresAuth: true },
  },
  {
    path: '/gaokao/groups',
    name: 'GaokaoGroups',
    component: () => import('@/views/gaokao/Groups.vue'),
    meta: { title: '专业组查询', requiresAuth: true },
  },
  {
    path: '/gaokao/plans',
    name: 'GaokaoPlans',
    component: () => import('@/views/gaokao/PlansList.vue'),
    meta: { title: '志愿表', requiresAuth: true },
  },
  {
    path: '/gaokao/plans/:id',
    name: 'GaokaoPlanDetail',
    component: () => import('@/views/gaokao/PlanDetail.vue'),
    meta: { title: '志愿表详情', requiresAuth: true },
  },
  {
    path: '/gaokao/pdf-history/:planId',
    name: 'PdfHistory',
    component: () => import('@/views/gaokao/PdfHistory.vue'),
    meta: { title: 'AI报告记录', requiresAuth: true },
  },
  {
    path: '/gaokao/pdf-report/:recordId',
    name: 'PdfReportDetail',
    component: () => import('@/views/gaokao/PdfReportDetail.vue'),
    meta: { title: 'AI分析报告', requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', layout: 'blank' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register/index.vue'),
    meta: { title: '注册', layout: 'blank' },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/forgot-password/index.vue'),
    meta: { title: '重置密码', layout: 'blank' },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/index.vue'),
    meta: { title: '个人中心', requiresAuth: true },
  },
  {
    path: '/home/announcement/:id',
    name: 'AnnouncementDetail',
    component: () => import('@/views/home/announcement/Detail.vue'),
    meta: { title: '公告详情' },
  },
  {
    path: '/home/planner/:id',
    name: 'PlannerDetail',
    component: () => import('@/views/home/planner/Detail.vue'),
    meta: { title: '规划师详情' },
  },
  {
    path: '/home/institution/:id',
    name: 'InstitutionDetail',
    component: () => import('@/views/home/institution/Detail.vue'),
    meta: { title: '培训机构详情' },
  },
  {
    path: '/university',
    name: 'UniversityList',
    component: () => import('@/views/university/List.vue'),
    meta: { title: '院校列表' },
  },
  {
    path: '/university/:id',
    name: 'UniversityDetail',
    component: () => import('@/views/university/Detail.vue'),
    meta: { title: '院校详情', requiresAuth: true },
  },
  {
    path: '/university/admission-group/:groupId',
    name: 'AdmissionGroupDetail',
    component: () => import('@/views/university/AdmissionGroupDetail.vue'),
    meta: { title: '录取专业组详情', requiresAuth: true },
  },
  {
    path: '/university/:id/guide',
    name: 'UniversityGuide',
    component: () => import('@/views/university/Guide.vue'),
    meta: { title: '适应指南', requiresAuth: true },
  },
  {
    path: '/university/laboratory/:labId',
    name: 'LaboratoryDetail',
    component: () => import('@/views/university/LaboratoryDetail.vue'),
    meta: { title: '实验室详情', requiresAuth: true },
  },
  {
    path: '/university/departments/:deptId',
    name: 'DepartmentDetail',
    component: () => import('@/views/university/DepartmentDetail.vue'),
    meta: { title: '院系详情', requiresAuth: true },
  },
  {
    path: '/major',
    name: 'MajorList',
    component: () => import('@/views/major/List.vue'),
    meta: { title: '专业查询' }
  },
  {
    path: '/major/:id',
    name: 'MajorDetail',
    component: () => import('@/views/major/Detail.vue'),
    meta: { title: '专业详情', requiresAuth: true }
  },
  {
    path: '/postgrad-major',
    name: 'PostgradMajorList',
    component: () => import('@/views/major/PostgradList.vue'),
    meta: { title: '考研专业', requiresAuth: true }
  },
  {
    path: '/city',
    name: 'CityList',
    component: () => import('@/views/city/List.vue'),
    meta: { title: '城市查询' },
  },
  {
    path: '/city/:id',
    name: 'CityDetail',
    component: () => import('@/views/city/Detail.vue'),
    meta: { title: '城市详情', requiresAuth: true },
  },
  {
    path: '/industry',
    name: 'IndustryList',
    component: () => import('@/views/industry/List.vue'),
    meta: { title: '行业探索' },
  },
  {
    path: '/industry/:id',
    name: 'IndustryDetail',
    component: () => import('@/views/industry/Detail.vue'),
    meta: { title: '行业详情', requiresAuth: true },
  },
  {
    path: '/resource',
    name: 'ResourceList',
    component: () => import('@/views/resource/List.vue'),
    meta: { title: '资源下载' },
  },
  {
    path: '/certificate',
    name: 'CertificateList',
    component: () => import('@/views/certificate/List.vue'),
    meta: { title: '职业技能证书' },
  },
  {
    path: '/competition',
    name: 'CompetitionList',
    component: () => import('@/views/competition/List.vue'),
    meta: { title: '大学科研与竞赛' },
  },
  {
    path: '/competition/:id',
    name: 'CompetitionDetail',
    component: () => import('@/views/competition/Detail.vue'),
    meta: { title: '竞赛详情', requiresAuth: true },
  },
  {
    path: '/enterprise',
    name: 'EnterpriseList',
    component: () => import('@/views/enterprise/List.vue'),
    meta: { title: '企业探索' },
  },
  {
    path: '/enterprise/:id/positions',
    name: 'EnterprisePositionList',
    component: () => import('@/views/enterprise/PositionList.vue'),
    meta: { title: '企业岗位', requiresAuth: true },
  },
  {
    path: '/employment/jobs',
    name: 'EmploymentJobList',
    component: () => import('@/views/employment/jobs/index.vue'),
    meta: { title: '统一岗位搜索' },
  },
  {
    path: '/employment/job/:id',
    name: 'EmploymentJobDetail',
    component: () => import('@/views/employment/job/Detail.vue'),
    meta: { title: '岗位详情', requiresAuth: true },
  },
  {
    path: '/employment/teacher',
    name: 'EmploymentTeacherList',
    component: () => import('@/views/employment/teacher/List.vue'),
    meta: { title: '教师招聘' },
  },
  {
    path: '/employment/teacher/:id',
    name: 'EmploymentTeacherDetail',
    component: () => import('@/views/employment/teacher/Detail.vue'),
    meta: { title: '教师岗位详情', requiresAuth: true },
  },
  {
    path: '/employment/healthcare',
    name: 'EmploymentHealthcareList',
    component: () => import('@/views/employment/healthcare/List.vue'),
    meta: { title: '医疗卫生招聘' },
  },
  {
    path: '/employment/healthcare/:id',
    name: 'EmploymentHealthcareDetail',
    component: () => import('@/views/employment/healthcare/Detail.vue'),
    meta: { title: '医疗卫生岗位详情', requiresAuth: true },
  },
  {
    path: '/employment/finance',
    name: 'EmploymentFinanceList',
    component: () => import('@/views/employment/finance/List.vue'),
    meta: { title: '金融银行招聘' },
  },
  {
    path: '/employment/finance/:id',
    name: 'EmploymentFinanceDetail',
    component: () => import('@/views/employment/finance/Detail.vue'),
    meta: { title: '金融银行岗位详情', requiresAuth: true },
  },
  {
    path: '/employment/grassroots',
    name: 'EmploymentGrassrootsList',
    component: () => import('@/views/employment/grassroots/List.vue'),
    meta: { title: '基层服务招聘' },
  },
  {
    path: '/employment/grassroots/:id',
    name: 'EmploymentGrassrootsDetail',
    component: () => import('@/views/employment/grassroots/Detail.vue'),
    meta: { title: '基层服务岗位详情', requiresAuth: true },
  },
  {
    path: '/employment/community',
    name: 'EmploymentCommunityList',
    component: () => import('@/views/employment/community/List.vue'),
    meta: { title: '社区招聘' },
  },
  {
    path: '/employment/community/:id',
    name: 'EmploymentCommunityDetail',
    component: () => import('@/views/employment/community/Detail.vue'),
    meta: { title: '社区岗位详情', requiresAuth: true },
  },
  {
    path: '/employment/welfare',
    name: 'EmploymentWelfareList',
    component: () => import('@/views/employment/welfare/List.vue'),
    meta: { title: '公益招聘' },
  },
  {
    path: '/employment/welfare/:id',
    name: 'EmploymentWelfareDetail',
    component: () => import('@/views/employment/welfare/Detail.vue'),
    meta: { title: '公益性岗位详情', requiresAuth: true },
  },
  {
    path: '/employment/civil',
    name: 'EmploymentCivilList',
    component: () => import('@/views/employment/civil/List.vue'),
    meta: { title: '公务员考试' },
  },
  {
    path: '/employment/civil/:id',
    name: 'EmploymentCivilDetail',
    component: () => import('@/views/employment/civil/Detail.vue'),
    meta: { title: '公务员岗位详情', requiresAuth: true },
  },
  {
    path: '/employment/institution',
    name: 'EmploymentInstitutionList',
    component: () => import('@/views/employment/institution/List.vue'),
    meta: { title: '事业单位招聘' },
  },
  {
    path: '/employment/institution/:id',
    name: 'EmploymentInstitutionDetail',
    component: () => import('@/views/employment/institution/Detail.vue'),
    meta: { title: '事业编岗位详情', requiresAuth: true },
  },
  {
    path: '/employment/military',
    name: 'EmploymentMilitaryList',
    component: () => import('@/views/employment/military/List.vue'),
    meta: { title: '部队文职招聘' },
  },
  {
    path: '/employment/military/:id',
    name: 'EmploymentMilitaryDetail',
    component: () => import('@/views/employment/military/Detail.vue'),
    meta: { title: '部队文职岗位详情', requiresAuth: true },
  },
  {
    path: '/employment/selection',
    name: 'EmploymentSelectionList',
    component: () => import('@/views/employment/selection/List.vue'),
    meta: { title: '选调生招聘' },
  },
  {
    path: '/employment/selection/:id',
    name: 'EmploymentSelectionDetail',
    component: () => import('@/views/employment/selection/Detail.vue'),
    meta: { title: '选调生岗位详情', requiresAuth: true },
  },
  {
    path: '/special',
    name: 'SpecialChannel',
    component: () => import('@/views/special/index.vue'),
    meta: { title: '特殊招生通道' },
  },
  {
    path: '/special/channel/:id',
    name: 'SpecialChannelDetail',
    component: () => import('@/views/special/ChannelDetail.vue'),
    meta: { title: '通道详情', requiresAuth: true },
  },
  {
    path: '/special/strong-base/:id',
    name: 'SpecialStrongBaseDetail',
    component: () => import('@/views/special/StrongBaseDetail.vue'),
    meta: { title: '强基数据详情', requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在', layout: 'blank' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '海枫未来规划院'}`

  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    const userStore = useUserStore()

    if (!userStore.isLoggedIn()) {
      // 存储目标路由
      userStore.setRedirectPath(to.fullPath)

      try {
        await ElMessageBox.confirm(
          '您还没有登录，请先登录',
          '提示',
          {
            confirmButtonText: '前往登录',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
        next({ name: 'Login' })
      } catch {
        next(false)
      }
      return
    }
  }

  next()
})

export default router
