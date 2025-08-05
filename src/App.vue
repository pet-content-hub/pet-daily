<template>
  <div id="app">
    <!-- 导航栏 -->
    <AppHeader />
    
    <!-- 主要内容区域 -->
    <main class="main-content">
      <RouterView />
    </main>
    
    <!-- 页脚 -->
    <AppFooter />
    
    <!-- 加载指示器 -->
    <LoadingIndicator v-if="isLoading" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useHead } from '@vueuse/head'
import { useAppStore } from '@/stores/app'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import LoadingIndicator from '@/components/ui/LoadingIndicator.vue'

// 全局状态
const appStore = useAppStore()
const isLoading = ref(false)

// SEO 配置
useHead({
  titleTemplate: (title) => title ? `${title} - 猫咪世界` : '猫咪世界 - 专业的养猫知识分享平台',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#ff6b6b' },
    { property: 'og:image', content: 'assets/images/logo.png' },
    { property: 'og:site_name', content: '猫咪世界' },
    { name: 'twitter:image', content: 'assets/images/logo.png' }
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/assets/images/favicon.ico' },
    { rel: 'apple-touch-icon', href: '/assets/images/apple-touch-icon.png' },
    { rel: 'shortcut icon', href: '/assets/images/logo.png' }
  ]
})

// 初始化应用
onMounted(async () => {
  isLoading.value = true
  try {
    await appStore.initialize()
    
    // 处理 GitHub Pages 重定向
    const urlParams = new URLSearchParams(window.location.search)
    const redirect = urlParams.get('redirect')
    
    if (redirect) {
      // 清除重定向参数并跳转到目标路由
      const newUrl = new URL(window.location)
      newUrl.searchParams.delete('redirect')
      window.history.replaceState({}, '', newUrl.toString())
      router.push(redirect)
    }
  } catch (error) {
    console.error('应用初始化失败:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style lang="scss">
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 2rem;
  padding-bottom: 2rem;
}
</style>