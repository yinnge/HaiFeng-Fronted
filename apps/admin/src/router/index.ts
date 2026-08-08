import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { getAccessToken } from '@haifeng/shared'
import { useUserStore } from '@/store'
import systemRoutes from './modules/system'
import permissionRoutes from './modules/permission'
import userRoutes from './modules/user'
import homeRoutes from './modules/home'
import universityRoutes from './modules/university'
import majorRoutes from './modules/major'
import cityRoutes from './modules/city'
import industryRoutes from './modules/industry'
import resourceRoutes from './modules/resource'
import certificateRoutes from './modules/certificate'
import algorithmRoutes from './modules/algorithm'
import specialRoutes from './modules/special'
import companyRoutes from './modules/company'
import employmentRoutes from './modules/employment'

// 静态路由 (无需权限)
const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: { title: '403', hidden: true },
  },
]

// 动态路由 (根据权限加载)
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '控制面板', icon: 'Monitor' },
      },
      systemRoutes,
      permissionRoutes,
      userRoutes,
      homeRoutes,
      universityRoutes,
      majorRoutes,
      cityRoutes,
      industryRoutes,
      resourceRoutes,
      certificateRoutes,
      algorithmRoutes,
      specialRoutes,
      companyRoutes,
      employmentRoutes,
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', hidden: true },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...constantRoutes, ...asyncRoutes],
})

// 路由守卫
router.beforeEach(async (to, _from, next) => {
  const token = getAccessToken()
  const whiteList = ['/login', '/404', '/403']

  if (token) {
    if (to.path === '/login') {
      next({ path: '/' })
      return
    }
    // 先确保已拉取当前管理员信息（moduleCodes 驱动侧边栏过滤）。
    // 之前只在 to.meta.moduleCode 存在时才拉取，导致刷新后落在无 moduleCode 页面（如 /dashboard）时
    // profile 为 null，侧边栏过滤逻辑被跳过 → 无权限模块也全部展示。
    const userStore = useUserStore()
    if (!userStore.profile) {
      try {
        await userStore.fetchProfile()
      } catch {
        // 拉取失败不阻塞跳转，下方按空权限处理
      }
    }
    // moduleCode 鉴权
    if (to.meta?.moduleCode) {
      const codes = userStore.profile?.moduleCodes ?? []
      if (!codes.includes(to.meta.moduleCode as string)) {
        next({ path: '/403' })
        return
      }
    }
    next()
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router
