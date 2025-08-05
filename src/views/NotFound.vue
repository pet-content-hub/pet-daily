<template>
  <div class="not-found-page">
    <div class="error-content">
      <div class="error-visual">
        <div class="error-number">404</div>
        <div class="cat-illustration">
          <div class="cat-body">
            <div class="cat-head">
              <div class="cat-ears">
                <div class="ear ear-left"></div>
                <div class="ear ear-right"></div>
              </div>
              <div class="cat-face">
                <div class="eyes">
                  <div class="eye eye-left"></div>
                  <div class="eye eye-right"></div>
                </div>
                <div class="nose"></div>
                <div class="mouth sad"></div>
              </div>
            </div>
            <div class="cat-paws">
              <div class="paw paw-left"></div>
              <div class="paw paw-right"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="error-text">
        <h1>页面走丢了</h1>
        <p>看起来这只小猫咪找不到回家的路了...</p>
        <p>您访问的页面可能不存在或已被移动。</p>
      </div>
      
      <div class="error-actions">
        <RouterLink to="/" class="primary-btn">
          🏠 返回首页
        </RouterLink>
        <button @click="goBack" class="secondary-btn">
          ← 返回上页
        </button>
      </div>
      
      <!-- 建议链接 -->
      <div class="suggestions">
        <h3>或许您在寻找：</h3>
        <div class="suggestion-links">
          <RouterLink to="/" class="suggestion-link">
            <span class="icon">🏠</span>
            <div class="link-info">
              <h4>首页</h4>
              <p>浏览最新的养猫知识文章</p>
            </div>
          </RouterLink>
          
          <RouterLink to="/about" class="suggestion-link">
            <span class="icon">ℹ️</span>
            <div class="link-info">
              <h4>关于我们</h4>
              <p>了解猫咪世界团队和使命</p>
            </div>
          </RouterLink>
          
          <RouterLink to="/categories/新手指南" class="suggestion-link">
            <span class="icon">📚</span>
            <div class="link-info">
              <h4>新手指南</h4>
              <p>适合新手铲屎官的养猫知识</p>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'

const router = useRouter()

// SEO配置
useHead({
  title: '页面未找到',
  meta: [
    { name: 'description', content: '抱歉，您访问的页面不存在。请返回首页浏览其他内容。' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

// 方法
function goBack() {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style lang="scss" scoped>
.not-found-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-content {
  text-align: center;
  width: 100%;
}

.error-visual {
  position: relative;
  margin-bottom: 3rem;
}

.error-number {
  font-size: 8rem;
  font-weight: 900;
  color: var(--primary-color);
  opacity: 0.1;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.cat-illustration {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.cat-body {
  width: 80px;
  height: 60px;
  position: relative;
}

.cat-head {
  width: 50px;
  height: 40px;
  background: var(--primary-color);
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 15px;
}

.cat-ears {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
}

.ear {
  width: 12px;
  height: 15px;
  background: var(--primary-color);
  border-radius: 50% 50% 0 0;
  position: absolute;
  
  &.ear-left {
    left: -8px;
    transform: rotate(-20deg);
  }
  
  &.ear-right {
    right: -8px;
    transform: rotate(20deg);
  }
}

.cat-face {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.eyes {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  justify-content: center;
}

.eye {
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  animation: sadBlink 3s ease-in-out infinite;
}

.nose {
  width: 3px;
  height: 3px;
  background: white;
  border-radius: 50%;
  margin: 0 auto 3px;
}

.mouth.sad {
  width: 12px;
  height: 6px;
  border: 2px solid white;
  border-top: none;
  border-radius: 0 0 12px 12px;
  margin: 0 auto;
  transform: rotate(180deg);
}

.cat-paws {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
}

.paw {
  width: 8px;
  height: 12px;
  background: var(--primary-color);
  border-radius: 50%;
}

.error-text {
  margin-bottom: 3rem;
  
  h1 {
    font-size: 2.5rem;
    color: var(--text-dark);
    margin-bottom: 1rem;
    font-weight: 700;
  }
  
  p {
    color: var(--text-light);
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 0.5rem;
  }
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 4rem;
  flex-wrap: wrap;
}

.primary-btn, .secondary-btn {
  padding: 1rem 2rem;
  border-radius: var(--border-radius);
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: var(--transition);
  cursor: pointer;
  border: none;
  
  &:hover {
    transform: translateY(-2px);
  }
}

.primary-btn {
  background: var(--primary-color);
  color: white;
  
  &:hover {
    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
  }
}

.secondary-btn {
  background: var(--bg-light);
  color: var(--text-dark);
  border: 2px solid var(--border-light);
  
  &:hover {
    background: var(--bg-white);
    border-color: var(--primary-color);
  }
}

.suggestions {
  h3 {
    color: var(--text-dark);
    margin-bottom: 2rem;
    font-size: 1.3rem;
  }
}

.suggestion-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  text-align: left;
}

.suggestion-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  text-decoration: none;
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  }
  
  .icon {
    font-size: 2rem;
    flex-shrink: 0;
  }
  
  .link-info {
    h4 {
      color: var(--text-dark);
      margin-bottom: 0.25rem;
      font-size: 1.1rem;
    }
    
    p {
      color: var(--text-light);
      font-size: 0.9rem;
      margin: 0;
    }
  }
}

@keyframes sadBlink {
  0%, 85%, 100% {
    transform: scaleY(1);
  }
  90% {
    transform: scaleY(0.1);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .not-found-page {
    padding: 1rem;
  }
  
  .error-number {
    font-size: 6rem;
  }
  
  .error-text h1 {
    font-size: 2rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .primary-btn, .secondary-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .suggestion-links {
    grid-template-columns: 1fr;
  }
}
</style>