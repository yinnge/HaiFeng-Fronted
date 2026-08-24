import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus, { ElMessageBox } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import { setSessionExpiredHandler } from '@haifeng/shared'
import { useUserStore } from '@/store/modules/user'
import './assets/styles/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

// 会话过期（如服务器重启导致 token 失效）：统一弹"请重新登录"，确认后跳登录页
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
    window.location.href = `${import.meta.env.BASE_URL}login`
  })
})

app.mount('#app')
