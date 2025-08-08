import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'
import App from './App.vue'
import router from './router'
import './assets/styles/main.scss'
import cloudbaseService from './utils/cloudbase'

// 创建应用实例
const app = createApp(App)

// 安装插件
app.use(createPinia())
app.use(router)
app.use(createHead())

// 初始化 CloudBase
const initCloudBase = () => {
  try {
    // 从环境变量或配置文件读取环境ID
    const cloudbaseEnv = import.meta.env.VITE_CLOUDBASE_ENV || 'your-env-id'
    
    if (cloudbaseEnv && cloudbaseEnv !== 'your-env-id') {
      cloudbaseService.init({
        env: cloudbaseEnv
      })
    } else {
      console.warn('⚠️ CloudBase 环境ID未配置，请在 .env 文件中设置 VITE_CLOUDBASE_ENV')
    }
  } catch (error) {
    console.error('CloudBase 初始化失败:', error)
  }
}

// 应用启动
async function bootstrap() {
  // 初始化 CloudBase
  initCloudBase()
  
  // 挂载应用
  app.mount('#app')

  // 开发环境日志
  if (import.meta.env.DEV) {
    console.log('%c🐱 猫咪世界 Vue 3 应用已启动！', 'color: #ff6b6b; font-size: 16px; font-weight: bold;')
    console.log('%c🔥 CloudBase 集成已加载', 'color: #10b981; font-size: 14px;')
  }
}

bootstrap()