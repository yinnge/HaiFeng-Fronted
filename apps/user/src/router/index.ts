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
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/register/index.vue'),
    meta: { title: '注册' },
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
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '海峰未来规划院'}`

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
