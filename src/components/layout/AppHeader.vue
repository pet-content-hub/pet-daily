<template>
  <header class="site-header">
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-logo">
          <h1>
            <RouterLink to="/" class="logo-link">
              🐱 猫咪世界
            </RouterLink>
          </h1>
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

<style lang="scss" scoped>
.site-header {
  background: var(--bg-white);
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar {
  padding: 1rem 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.logo-link {
  text-decoration: none;
  color: var(--primary-color);
  transition: var(--transition);
  
  &:hover {
    opacity: 0.8;
  }
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
  
  a {
    text-decoration: none;
    color: var(--text-dark);
    font-weight: 500;
    transition: var(--transition);
    position: relative;
    
    &:hover {
      color: var(--primary-color);
    }
    
    &.active {
      color: var(--primary-color);
      font-weight: 600;
      
      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--primary-color);
        border-radius: 1px;
      }
    }
  }
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 24px;
  height: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  
  span {
    width: 100%;
    height: 2px;
    background: var(--text-dark);
    transition: var(--transition);
    transform-origin: center;
  }
  
  &.active {
    span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }
    
    span:nth-child(2) {
      opacity: 0;
    }
    
    span:nth-child(3) {
      transform: rotate(-45deg) translate(7px, -6px);
    }
  }
}

.mobile-menu {
  display: none;
  background: var(--bg-white);
  border-top: 1px solid var(--border-light);
  
  &.open {
    display: block;
  }
  
  ul {
    list-style: none;
    margin: 0;
    padding: 1rem 0;
    
    li {
      padding: 0.5rem 2rem;
      
      a {
        display: block;
        text-decoration: none;
        color: var(--text-dark);
        font-weight: 500;
        transition: var(--transition);
        
        &:hover {
          color: var(--primary-color);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }
  
  .nav-menu {
    display: none;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
}
</style>