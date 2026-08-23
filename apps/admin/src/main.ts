import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus, { ElMessageBox } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import { setSessionExpiredHandler } from '@haifeng/shared'

import 'element-plus/dist/index.css'
import './assets/styles/index.css'

// 会话过期（如服务器重启导致 token 失效）：统一弹"请重新登录"，确认后跳登录页
// 注意 admin base 为 /admin/，登录页路径须用 BASE_URL 拼接，不能写死 /login
setSessionExpiredHandler(() => {
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

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

app.mount('#app')
