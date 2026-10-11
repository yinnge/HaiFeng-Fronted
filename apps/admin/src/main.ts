import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus, { ElMessageBox } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import { setSessionExpiredHandler } from '@haifeng/shared'
import { useUserStore } from '@/store/modules/user'

import 'element-plus/dist/index.css'
import './assets/styles/index.css'

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

// 会话过期（如服务器重启导致 token 失效）：统一弹"请重新登录"，确认后跳登录页
// 注意 admin base 为 /admin/，登录页路径须用 BASE_URL 拼接，不能写死 /login
// 必须在 createPinia() 之后注册，handler 内 useUserStore() 才能拿到 store 实例
setSessionExpiredHandler(() => {
  // 立即清理 store 中的 token，使路由守卫 isLoggedIn() 立刻失效，
  // 避免「token 已清但 store 仍为脏值」导致反复 401 闪屏、点按钮不跳转
  useUserStore().logout()
  ElMessageBox.alert('登录已过期，请重新登录', '提示', {
    confirmButtonText: '重新登录',
    type: 'warning',
    showClose: false,
    closeOnClickModal: false,
    closeOnPressEscape: false,
  }).finally(() => {
    // 改用 SPA 内跳转（router.push）替代 window.location.href 整页刷新，
    // 避免「长时间 idle 后点路由 → 整个页面白屏刷新」的突兀感；
    // 带上 redirect 让重新登录后平滑回到触发失效前的那个路由。
    const redirect = router.currentRoute.value.fullPath
    router.push(`/login?redirect=${encodeURIComponent(redirect)}`)
  })
})

app.mount('#app')
