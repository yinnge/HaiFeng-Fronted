import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus, { ElMessageBox } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'
import { setSessionExpiredHandler } from '@haifeng/shared'
import './assets/styles/index.css'

// 会话过期（如服务器重启导致 token 失效）：统一弹"请重新登录"，确认后跳登录页
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

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

app.mount('#app')
