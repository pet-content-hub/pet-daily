import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 状态
  const isLoading = ref(false)
  const basePath = ref('')
  const siteInfo = ref({
    name: '猫咪世界',
    description: '专业的养猫知识分享平台',
    url: 'https://www.mao.com.cn',
    keywords: '养猫,猫咪,宠物,猫粮,幼猫,猫咪品种,宠物护理'
  })

  // 计算属性
  const fullSiteName = computed(() => `${siteInfo.value.name} - ${siteInfo.value.description}`)

  // 方法
  function setLoading(loading) {
    isLoading.value = loading
  }

  function getBasePath() {
    const pathname = window.location.pathname
    const hostname = window.location.hostname
    
    if (pathname.startsWith('/pet-daily/')) {
      return '/pet-daily'
    }
    
    if (hostname.includes('github.io')) {
      const pathParts = pathname.split('/').filter(part => part)
      if (pathParts.length === 0 || pathname === '/') {
        const currentUrl = window.location.href
        if (currentUrl.includes('/pet-daily')) {
          return '/pet-daily'
        }
        return ''
      }
    }
    
    return ''
  }

  async function initialize() {
    setLoading(true)
    try {
      // 设置基础路径
      basePath.value = getBasePath()
      
      // 其他初始化逻辑
      console.log('🐱 应用初始化完成')
      console.log('🔗 检测到的基础路径:', basePath.value || '根目录')
      console.log('🌐 当前域名:', window.location.hostname)
      
    } catch (error) {
      console.error('初始化失败:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    // 状态
    isLoading,
    basePath,
    siteInfo,
    
    // 计算属性
    fullSiteName,
    
    // 方法
    setLoading,
    getBasePath,
    initialize
  }
})