import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'
import App from './App.vue'
import router from './router'
import './assets/styles/main.scss'

// 创建应用实例
const app = createApp(App)

// 安装插件
app.use(createPinia())
app.use(router)
app.use(createHead())

// 挂载应用
app.mount('#app')

// 开发环境日志
if (import.meta.env.DEV) {
  console.log('%c🐱 猫咪世界 Vue 3 应用已启动！', 'color: #ff6b6b; font-size: 16px; font-weight: bold;')
}