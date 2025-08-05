<template>
  <div class="home-page">
    <!-- Hero区域 -->
    <section id="hero" class="hero-section">
      <div class="hero-content">
        <h2>专业的养猫知识分享平台</h2>
        <p>每日更新猫咪护理、品种介绍、用品测评等专业内容，助您成为更好的铲屎官</p>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number" ref="articleCountRef">{{ animatedCount }}</span>
            <span class="stat-label">篇文章</span>
          </div>
          <div class="stat">
            <span class="stat-number">50+</span>
            <span class="stat-label">个品种</span>
          </div>
          <div class="stat">
            <span class="stat-number">10000+</span>
            <span class="stat-label">位铲屎官</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 广告位 -->
    <div class="ad-container">
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-YOUR_ADSENSE_ID"
           data-ad-slot="1234567890"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>

    <!-- 最新文章 -->
    <section id="latest-articles" class="articles-section">
      <h3>最新文章</h3>
      
      <div v-if="articlesStore.isLoading" class="loading-message">
        <div class="loading-spinner"></div>
        <p>加载文章中...</p>
      </div>
      
      <div v-else class="articles-grid">
        <ArticleCard
          v-for="article in articlesStore.displayedArticles"
          :key="article.slug"
          :article="article"
        />
      </div>
      
      <div v-if="articlesStore.hasMoreArticles" class="load-more">
        <button 
          class="btn-primary"
          @click="loadMoreArticles"
          :disabled="articlesStore.isLoading"
        >
          {{ articlesStore.isLoading ? '加载中...' : '加载更多' }}
        </button>
      </div>
    </section>

    <!-- 热门分类 -->
    <section id="categories" class="categories-section">
      <h3>热门分类</h3>
      <div class="categories-grid">
        <div 
          v-for="category in categories" 
          :key="category.name"
          class="category-card"
          @click="goToCategory(category.name)"
        >
          <div class="category-icon">{{ category.icon }}</div>
          <h4>{{ category.name }}</h4>
          <p>{{ category.description }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'
import { useArticlesStore } from '@/stores/articles'
import ArticleCard from '@/components/ui/ArticleCard.vue'

const router = useRouter()
const articlesStore = useArticlesStore()

// 响应式数据
const animatedCount = ref(0)

// SEO配置
useHead({
  title: '首页',
  meta: [
    { name: 'description', content: '专业的养猫知识分享平台，每日更新猫咪护理、品种介绍、用品测评等专业内容，助您成为更好的铲屎官' },
    { name: 'keywords', content: '养猫,猫咪,宠物,猫粮,幼猫,猫咪品种,宠物护理' },
    { property: 'og:title', content: '猫咪世界 - 专业的养猫知识分享平台' },
    { property: 'og:description', content: '专业的养猫知识分享，每日更新猫咪护理、品种介绍、用品测评等内容' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://www.mao.com.cn/' }
  ]
})

// 分类数据
const categories = [
  {
    name: '猫咪品种',
    icon: '🐾',
    description: '详细介绍各种猫咪品种的特点和护理要点'
  },
  {
    name: '幼猫护理',
    icon: '🍼',
    description: '从出生到成年，全方位的幼猫护理指南'
  },
  {
    name: '猫粮测评',
    icon: '🥫',
    description: '专业的猫粮成分分析和性价比评测'
  },
  {
    name: '健康护理',
    icon: '🏥',
    description: '猫咪常见疾病预防和日常健康管理'
  }
]

// 计算属性
const totalArticles = computed(() => articlesStore.totalArticles)

// 方法
function loadMoreArticles() {
  articlesStore.loadMoreArticles()
}

function goToCategory(categoryName) {
  router.push(`/categories/${encodeURIComponent(categoryName)}`)
}

function animateNumber(start, end, duration) {
  const startTime = performance.now()
  
  const update = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const current = Math.floor(start + (end - start) * progress)
    animatedCount.value = current
    
    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }
  
  requestAnimationFrame(update)
}

// 生命周期
onMounted(async () => {
  // 加载文章数据
  await articlesStore.loadArticles()
  
  // 启动数字动画
  animateNumber(0, totalArticles.value, 2000)
  
  // 初始化AdSense（如果有的话）
  if (window.adsbygoogle && typeof window.adsbygoogle.push === 'function') {
    try {
      window.adsbygoogle.push({})
    } catch (e) {
      console.log('AdSense 初始化失败:', e)
    }
  }
})
</script>

<style lang="scss" scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.hero-section {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
  color: white;
  margin: 2rem -2rem;
  border-radius: var(--border-radius);
  
  h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
  }
  
  p {
    font-size: 1.2rem;
    margin-bottom: 3rem;
    opacity: 0.9;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.stat {
  text-align: center;
  
  .stat-number {
    display: block;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    font-size: 1rem;
    opacity: 0.8;
  }
}

.ad-container {
  margin: 3rem 0;
  text-align: center;
  min-height: 100px;
  background: var(--bg-light);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
}

.articles-section {
  margin: 4rem 0;
  
  h3 {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 3rem;
    color: var(--text-dark);
  }
}

.loading-message {
  text-align: center;
  padding: 3rem 0;
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-light);
    border-top: 3px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.load-more {
  text-align: center;
  
  .btn-primary {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 1rem 2rem;
    border-radius: var(--border-radius);
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    
    &:hover:not(:disabled) {
      background: darken(#ff6b6b, 10%);
      transform: translateY(-2px);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.categories-section {
  margin: 4rem 0;
  
  h3 {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 3rem;
    color: var(--text-dark);
  }
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.category-card {
  background: var(--bg-white);
  padding: 2rem;
  border-radius: var(--border-radius);
  text-align: center;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  }
  
  .category-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  h4 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    color: var(--text-dark);
  }
  
  p {
    color: var(--text-light);
    line-height: 1.6;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: 768px) {
  .home-page {
    padding: 0 1rem;
  }
  
  .hero-section {
    margin: 1rem -1rem;
    padding: 2rem 1rem;
    
    h2 {
      font-size: 2rem;
    }
    
    p {
      font-size: 1rem;
    }
  }
  
  .hero-stats {
    gap: 2rem;
  }
  
  .stat .stat-number {
    font-size: 2rem;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>