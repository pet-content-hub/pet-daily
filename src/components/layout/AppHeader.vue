<template>
  <header class="site-header">
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-logo">
          <RouterLink to="/" class="logo-link">
            <img 
              src="/assets/images/logo.png" 
              alt="猫咪世界" 
              class="logo-image"
              @error="handleLogoError"
            >
            <h1 class="logo-text">猫咪世界</h1>
          </RouterLink>
        </div>
        
        <ul class="nav-menu">
          <li>
            <RouterLink to="/" :class="{ active: $route.name === 'Home' }">
              首页
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/#articles" @click="scrollToArticles">
              文章
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/about" :class="{ active: $route.name === 'About' }">
              关于
            </RouterLink>
          </li>
          <li>
            <a href="/feed.xml" target="_blank">RSS</a>
          </li>
        </ul>
        
        <!-- 移动端菜单按钮 -->
        <button 
          class="mobile-menu-btn"
          @click="toggleMobileMenu"
          :class="{ active: isMobileMenuOpen }"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      
      <!-- 移动端菜单 -->
      <div class="mobile-menu" :class="{ open: isMobileMenuOpen }">
        <ul>
          <li>
            <RouterLink to="/" @click="closeMobileMenu">首页</RouterLink>
          </li>
          <li>
            <RouterLink to="/#articles" @click="scrollToArticles">文章</RouterLink>
          </li>
          <li>
            <RouterLink to="/about" @click="closeMobileMenu">关于</RouterLink>
          </li>
          <li>
            <a href="/feed.xml" target="_blank">RSS</a>
          </li>
        </ul>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isMobileMenuOpen = ref(false)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function handleLogoError(event) {
  // 如果logo加载失败，显示emoji作为后备
  event.target.style.display = 'none'
  const logoText = event.target.nextElementSibling
  if (logoText) {
    logoText.textContent = '🐱 猫咪世界'
  }
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

function scrollToArticles() {
  closeMobileMenu()
  if (router.currentRoute.value.path === '/') {
    // 如果在首页，滚动到文章区域
    setTimeout(() => {
      const articlesSection = document.getElementById('latest-articles')
      if (articlesSection) {
        articlesSection.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  } else {
    // 如果不在首页，先跳转到首页再滚动
    router.push('/').then(() => {
      setTimeout(() => {
        const articlesSection = document.getElementById('latest-articles')
        if (articlesSection) {
          articlesSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 200)
    })
  }
}
</script>

<!-- 移除 scoped 样式，使用全局样式 -->